package com.ssafy.booknest.domain.book.scheduler;

import com.ssafy.booknest.domain.book.entity.Book;
import com.ssafy.booknest.domain.book.entity.BookAuthor;
import com.ssafy.booknest.domain.book.entity.recommendation.PopularAuthorBook;
import com.ssafy.booknest.domain.book.entity.evaluation.Rating;
import com.ssafy.booknest.domain.book.repository.BookRepository;
import com.ssafy.booknest.domain.book.repository.recommandation.PopularAuthorBookRepository;
import com.ssafy.booknest.domain.book.repository.evaluation.RatingRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class PopularAuthorScheduler {

    private final RatingRepository ratingRepository;
    private final BookRepository bookRepository;
    private final PopularAuthorBookRepository popularAuthorBookRepository;

    private static final int TOP_AUTHOR_COUNT = 2; // 상위 작가 수
    private static final int MAX_BOOKS_PER_AUTHOR = 15; // 작가당 최대 저장할 책 수

    @Scheduled(fixedRate = 1000 * 60 * 60 * 4) // 4시간마다 실행
    @Transactional
    public void runPopularAuthorBatch() {
        log.info("[배치 시작] 평점 기반 화제의 작가 선정");

        List<Rating> allRatings = ratingRepository.findAllWithBookAndAuthor();
        Map<String, List<Double>> authorRatingMap = new HashMap<>();

        // 작가별 평점 모으기
        for (Rating rating : allRatings) {
            double score = rating.getRating();
            for (BookAuthor bookAuthor : rating.getBook().getBookAuthors()) {
                String authorName = bookAuthor.getAuthor().getName();
                authorRatingMap
                        .computeIfAbsent(authorName, k -> new ArrayList<>())
                        .add(score);
            }
        }

        if (authorRatingMap.isEmpty()) {
            log.warn("작가 평점 데이터가 없습니다.");
            return;
        }

        // 작가별 평균 평점 계산
        Map<String, Double> authorAvgRating = authorRatingMap.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0.0)
                ));

        // 상위 TOP_AUTHOR_COUNT 명의 작가 추출
        List<String> topAuthors = authorAvgRating.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(TOP_AUTHOR_COUNT)
                .map(Map.Entry::getKey)
                .toList();

        if (topAuthors.isEmpty()) {
            log.warn("평점 상위 작가가 없습니다.");
            return;
        }

        // 기존 데이터 삭제
        popularAuthorBookRepository.deleteAllInBatch();

        List<PopularAuthorBook> popularList = new ArrayList<>();
        int rank = 1;

        for (String author : topAuthors) {
            // 작가별 책 최대 MAX_BOOKS_PER_AUTHOR권까지 가져오도록 설정
            List<Book> books = bookRepository.findBooksByAuthorNameLike(author, PageRequest.of(0, MAX_BOOKS_PER_AUTHOR));

            for (Book book : books) {
                popularList.add(PopularAuthorBook.builder()
                        .authorName(author)
                        .book(book)
                        .rank(rank)
                        .build());
            }

            log.info("[{}위] {} 작가의 책 {}권 등록", rank, author, books.size());
            rank++;
        }

        if (popularList.isEmpty()) {
            log.warn("선택된 작가들의 책이 없습니다.");
            return;
        }

        popularAuthorBookRepository.saveAll(popularList);

        log.info("총 작가 수: {}, 총 책 수: {}", rank - 1, popularList.size());
        log.info("[배치 완료] 화제의 작가 도서 테이블 갱신 완료");
        log.info("***********************************************************************************************");
    }
}
