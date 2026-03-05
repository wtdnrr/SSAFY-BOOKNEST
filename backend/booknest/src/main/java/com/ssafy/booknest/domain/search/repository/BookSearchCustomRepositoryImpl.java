package com.ssafy.booknest.domain.search.repository;

import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.*;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import co.elastic.clients.elasticsearch.ElasticsearchClient;
import com.ssafy.booknest.domain.search.record.BookEval;
import com.ssafy.booknest.domain.search.record.SearchedBook;
import com.ssafy.booknest.global.error.ErrorCode;
import com.ssafy.booknest.global.error.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class BookSearchCustomRepositoryImpl implements BookSearchCustomRepository {

    private final ElasticsearchClient elasticsearchClient;

    @Override
    public List<String> autocompleteTitle(String keyword) {
        try {
            // 검색 쿼리 요청 작성
            SearchRequest request = SearchRequest.of(s -> s
                    .index("book")
                    .size(15)
                    .query(q -> q
                            .functionScore(fs -> fs
                                    .query(inner -> inner
                                            .bool(b -> b
                                                            // 오토컴플리트 위주 + 일반 필드 보조
                                                            .should(s1 -> s1.matchPhrase(mp -> mp.field("title.autocomplete").query(keyword).boost(4.0f)))
                                                            .should(s2 -> s2.match(m -> m.field("title.autocomplete").query(keyword).boost(3.0f)))
                                                            .should(s3 -> s3.matchPhrase(mp -> mp.field("authors.autocomplete").query(keyword).boost(3.5f)))
                                                            .should(s4 -> s4.match(m -> m.field("authors.autocomplete").query(keyword).boost(2.5f)))
                                                            .should(s5 -> s5.matchPhrase(mp -> mp.field("title").query(keyword).boost(1.5f)))
                                                            .should(s6 -> s6.matchPhrase(mp -> mp.field("authors").query(keyword).boost(1.5f)))
                                                            .minimumShouldMatch("1")
                                            )
                                    )
                                    .functions(fns -> fns
                                            .fieldValueFactor(fvf -> fvf
                                                    .field("totalRatings")  // 평점에 따른 가중치 적용
                                                    .factor(1.0)
                                                    .modifier(FieldValueFactorModifier.Log1p)  // 평점 차이를 강조
                                                    .missing(0.0)  // 평점이 없으면 기본값 0
                                            )
                                    )
                                    .boostMode(FunctionBoostMode.Multiply)  // 점수 계산 방식 설정
                            )
                    )
                    .sort(so -> so
                            .score(sc -> sc.order(SortOrder.Desc))  // 점수 기준 내림차순 정렬
                    )
            );

            // search 메소드 호출
            SearchResponse<SearchedBook> response = elasticsearchClient.search(request, SearchedBook.class);

            Set<String> suggestions = new LinkedHashSet<>();
            for (Hit<SearchedBook> hit : response.hits().hits()) {
                SearchedBook book = hit.source();

                if (book.getTitle() != null) {
                    suggestions.add(book.getTitle());
                }
                if (book.getAuthors() != null) {
                    suggestions.addAll(book.getAuthors());
                }

                // 10개 이상 모이면 루프 중단
                if (suggestions.size() >= 10) break;
            }

            return suggestions.stream()
                    .limit(7) // 혹시라도 초과되었을 경우 안전장치
                    .collect(Collectors.toList());

        } catch (IOException e) {
            throw new CustomException(ErrorCode.ELASTICSEARCH_ERROR);
        }
    }

    @Override
    public void save(SearchedBook book) {
        try {
            elasticsearchClient.index(i -> i
                    .index("book")
                    .id(book.getBookId().toString())
                    .document(book)
            );
        } catch (IOException e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public void saveBookEval(BookEval book) {
        try {
            elasticsearchClient.index(i -> i
                    .index("book_eval")
                    .id(book.getBookId().toString())
                    .document(book)
            );
        } catch (IOException e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Page<SearchedBook> searchByTagsAndKeyword(List<String> tags, String keyword, Pageable pageable) {
        try {
            boolean hasTags = tags != null && !tags.isEmpty();
            boolean hasKeyword = keyword != null && !keyword.isBlank();

            // 키워드만 있는 경우
            if (!hasTags && hasKeyword) {
                Query keywordQuery = Query.of(q -> q.bool(b -> b
                        .should(s -> s.match(m -> m.field("title").query(keyword).boost(3.0f)))
                        .should(s -> s.match(m -> m.field("authors").query(keyword).boost(3.0f)))
                        .should(s -> s.matchPhrase(mp -> mp.field("title").query(keyword).boost(5.0f)))
                        .should(s -> s.matchPhrase(mp -> mp.field("authors").query(keyword).boost(5.0f)))
                ));

                SearchRequest request = SearchRequest.of(s -> s
                        .index("book")
                        .query(keywordQuery)
                        .from((int) pageable.getOffset())
                        .size(pageable.getPageSize())
                        .sort(so -> so
                                .score(sc -> sc.order(SortOrder.Desc)) // score 기준 내림차순 정렬 추가
                        )
                );

                SearchResponse<SearchedBook> response = elasticsearchClient.search(request, SearchedBook.class);

                List<SearchedBook> content = response.hits().hits().stream()
                        .map(Hit::source)
                        .toList();

                long total = response.hits().total() != null ? response.hits().total().value() : content.size();

                return new PageImpl<>(content, pageable, total);
            }

            // 태그만 있는 경우 또는 태그 + 키워드 둘 다 있는 경우
            List<Query> mustQueries = new ArrayList<>();

            if (hasTags) {
                for (String tag : tags) {
                    mustQueries.add(Query.of(q ->
                            q.term(t -> t.field("tags").value(tag))
                    ));
                }
            }

            if (hasKeyword) {
                Query keywordFunctionScore = Query.of(q -> q.functionScore(fs -> fs
                        .query(inner -> inner.bool(b -> b
                                .should(s -> s.match(m -> m.field("title").query(keyword).boost(3.0f)))
                                .should(s -> s.match(m -> m.field("authors").query(keyword).boost(3.0f)))
                                .should(s -> s.matchPhrase(mp -> mp.field("title").query(keyword).boost(5.0f)))
                                .should(s -> s.matchPhrase(mp -> mp.field("authors").query(keyword).boost(5.0f)))
                        ))
                        .boostMode(FunctionBoostMode.Multiply)
                        .functions(fns -> fns
                                .fieldValueFactor(fvf -> fvf
                                        .field("totalRatings")
                                        .factor(6.0)
                                        .modifier(FieldValueFactorModifier.Log1p)
                                        .missing(0.0)
                                )
                        )
                ));

                mustQueries.add(keywordFunctionScore);
            }

            Query finalQuery = Query.of(q -> q.bool(b -> b.must(mustQueries)));

            SearchRequest request = SearchRequest.of(s -> s
                    .index("book")
                    .query(finalQuery)
                    .from((int) pageable.getOffset())
                    .size(pageable.getPageSize())
                    .sort(so -> so
                            .score(sc -> sc.order(SortOrder.Desc)) // score 기준 내림차순 정렬 추가
                    )
            );

            SearchResponse<SearchedBook> response = elasticsearchClient.search(request, SearchedBook.class);

            List<SearchedBook> content = response.hits().hits().stream()
                    .map(Hit::source)
                    .toList();

            long total = response.hits().total() != null ? response.hits().total().value() : content.size();

            return new PageImpl<>(content, pageable, total);
        } catch (IOException e) {
            throw new RuntimeException("비상비상: ", e);
        }
    }


}
