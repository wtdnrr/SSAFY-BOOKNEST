package com.ssafy.booknest.domain.search.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.ScriptSortType;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch._types.query_dsl.QueryBuilders;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.json.JsonData;
import com.ssafy.booknest.domain.book.dto.response.BookResponse;
import com.ssafy.booknest.domain.book.enums.BookEvalType;
import com.ssafy.booknest.domain.book.repository.evaluation.RatingRepository;
import com.ssafy.booknest.domain.follow.repository.FollowRepository;
import com.ssafy.booknest.domain.search.dto.response.BookSearchResponse;
import com.ssafy.booknest.domain.search.dto.response.UserSearchResponse;
import com.ssafy.booknest.domain.search.record.BookEval;
import com.ssafy.booknest.domain.search.record.SearchedBook;
import com.ssafy.booknest.domain.search.record.SerachedUser;
import com.ssafy.booknest.domain.search.repository.BookSearchCustomRepository;
import com.ssafy.booknest.domain.search.repository.UserSearchRepository;
import com.ssafy.booknest.domain.user.entity.User;
import com.ssafy.booknest.domain.user.repository.UserRepository;
import com.ssafy.booknest.global.common.CustomPage;
import com.ssafy.booknest.global.error.ErrorCode;
import com.ssafy.booknest.global.error.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


import java.io.IOException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SearchService {
    private final BookSearchCustomRepository bookSearchRepository;
    private final UserSearchRepository userSearchRepository;
    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final PopularKeywordService popularKeywordService;
    private final RatingRepository ratingRepository;
    private final ElasticsearchClient elasticsearchClient;

    // 도서 검색 (태그/키워드 기반) + 인기 검색어 카운트 처리
    public CustomPage<BookSearchResponse> searchBooks(Integer userId, String keyword, List<String> tags, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 태그와 키워드 둘 다 없으면 빈 결과 반환
        if ((keyword == null || keyword.isBlank()) && (tags == null || tags.isEmpty())) {
            return new CustomPage<>(Page.empty());
        }

        Page<SearchedBook> books = bookSearchRepository.searchByTagsAndKeyword(tags, keyword, pageable);

        // 키워드 있을 때만 카운트 증가
        if (keyword != null && !keyword.isBlank()) {
            popularKeywordService.increaseKeywordCount(keyword);
        }

        return new CustomPage<>(books.map(BookSearchResponse::of));
    }

    // 도서 정보를 Elasticsearch에 저장
    public SearchedBook saveBook(SearchedBook book) {
        bookSearchRepository.save(book);
        return book;
    }

    // 유저 정보를 Elasticsearch에 저장
    public SerachedUser saveUser(SerachedUser user) { return userSearchRepository.save(user); }

    // 유저 검색 기능 + 팔로우 여부 반영
    public CustomPage<UserSearchResponse> searchUser(Integer userId, String name, Pageable pageable) {
        User user = userRepository.findById(userId).orElseThrow(() ->
                new CustomException(ErrorCode.USER_NOT_FOUND));

        if (name == null || name.isEmpty()) {
            return new CustomPage<>(Page.empty());
        }

        Page<SerachedUser> users = userSearchRepository.findByNicknameContaining(name, pageable);

        // 검색된 유저 ID 리스트 추출
        List<Integer> userIds = users.getContent().stream()
                .map(SerachedUser::id)
                .toList();

        // 단 한 번의 쿼리로 모든 팔로우 관계 조회
        Set<Integer> followingIds = new HashSet<>(followRepository.findFollowingIds(userId, userIds));

        // 팔로우 여부를 반영하여 응답 객체 생성
        List<UserSearchResponse> responseList = users.getContent().stream()
                .map(searchedUser -> {
                    boolean isFollowing = followingIds.contains(searchedUser.id());
                    return UserSearchResponse.of(searchedUser, isFollowing);
                })
                .toList();

        return new CustomPage<>(new PageImpl<>(responseList, pageable, users.getTotalElements()));
    }

    // 도서 제목 자동완성 추천 키워드 리스트 반환
    public List<String> autocompleteTitle(String keyword) {
        return bookSearchRepository.autocompleteTitle(keyword);
    }

    // 도서 평가 페이지용 도서 리스트 조회 (랜덤, 인기순, 최신순)
    public CustomPage<BookResponse> getEvalBookList(Integer userId, BookEvalType keyword, Pageable pageable) throws IOException {
        List<Integer> evaluatedBookIds = ratingRepository.findBookIdsByUserId(userId);

        Query excludeEvaluatedBooks = QueryBuilders.bool(b -> b
                .mustNot(QueryBuilders.terms(t -> t
                        .field("book_id")
                        .terms(terms -> terms.value(
                                evaluatedBookIds.stream().map(FieldValue::of).toList()
                        ))
                )));

        SearchRequest.Builder builder = new SearchRequest.Builder()
                .index("book_eval")
                .size(pageable.getPageSize())
                .from((int) pageable.getOffset())
                .query(excludeEvaluatedBooks);

        if (keyword == BookEvalType.POPULAR) {
            builder.sort(s -> s.field(f -> f.field("total_ratings").order(SortOrder.Desc)));
        } else if (keyword == BookEvalType.RECENT) {
            builder.sort(s -> s.field(f -> f.field("published_date").order(SortOrder.Desc)));
        }  else {
            builder.sort(s -> s
                    .script(sc -> sc
                            .type(ScriptSortType.Number)
                            .script(script -> script.inline(inline -> inline.source("Math.random()")))
                            .order(SortOrder.Asc)
                    )
            );
        }

        SearchResponse<JsonData> response = elasticsearchClient.search(builder.build(), JsonData.class);

        List<BookResponse> books = response.hits().hits().stream()
                .map(hit -> {
                    Map<String, Object> source = hit.source().to(Map.class);
                    return BookResponse.builder()
                            .bookId(Optional.ofNullable((Integer) source.get("book_id")).orElse(-1))
                            .title((String) source.get("title"))
                            .imageUrl((String) source.get("image_url"))
                            .publishedDate((String) source.get("published_date"))
                            .authors((List<String>) source.get("authors"))
                            .build();
                })
                .toList();

        long totalHits = response.hits().total().value();

        Page<BookResponse> page = new PageImpl<>(books, pageable, totalHits);
        return new CustomPage<>(page);
    }

    // 도서 평가 결과 Elasticsearch에 저장
    public BookEval saveBookEval(BookEval book) {
        bookSearchRepository.saveBookEval(book);
        return book;
    }
}
