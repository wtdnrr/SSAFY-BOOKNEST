package com.ssafy.booknest.domain.book.scheduler;

import com.ssafy.booknest.domain.book.entity.Book;
import com.ssafy.booknest.domain.book.entity.evaluation.Rating;
import com.ssafy.booknest.domain.book.entity.recommendation.TagRandomBook;
import com.ssafy.booknest.domain.book.repository.BookRepository;
import com.ssafy.booknest.domain.book.repository.evaluation.RatingRepository;
import com.ssafy.booknest.domain.book.repository.recommandation.TagRandomBookRepository;
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
public class TagPopularBookScheduler {

    private final RatingRepository ratingRepository;
    private final TagRandomBookRepository tagRandomBookRepository;
    private final BookRepository bookRepository;

    @Scheduled(fixedRate = 1000 * 60 * 60 * 5) // 5시간마다 실행
    @Transactional
    public void runTagBasedBookBatch() {
        log.info("[배치 시작] 평점 기반 태그별 인기 도서 선정 시작");

        List<Rating> ratings = ratingRepository.findAllWithBookAndTags();

        // 태그별 책 점수 누적
        Map<String, Map<Book, List<Double>>> tagScoreMap = new HashMap<>();

        for (Rating rating : ratings) {
            Book book = rating.getBook();
            double score = rating.getRating();

            Set<String> tags = book.getBookTags().stream()
                    .map(bt -> bt.getTag().getName())
                    .collect(Collectors.toSet());

            for (String tag : tags) {
                tagScoreMap
                        .computeIfAbsent(tag, k -> new HashMap<>())
                        .computeIfAbsent(book, b -> new ArrayList<>())
                        .add(score);
            }
        }

        tagRandomBookRepository.deleteAllInBatch();

        for (Map.Entry<String, Map<Book, List<Double>>> entry : tagScoreMap.entrySet()) {
            String tag = entry.getKey();
            Map<Book, List<Double>> bookScores = entry.getValue();

            // 평균 평점 기준 정렬
            LinkedHashSet<Book> topBooks = bookScores.entrySet().stream()
                    .sorted((e1, e2) -> {
                        double avg1 = e1.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                        double avg2 = e2.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                        return Double.compare(avg2, avg1); // 내림차순
                    })
                    .map(Map.Entry::getKey)
                    .limit(15)
                    .collect(Collectors.toCollection(LinkedHashSet::new));

            // 부족하면 랜덤 보충
            if (topBooks.size() < 15) {
                List<Book> randomBooks = bookRepository.findRandomBooksByTag(tag, PageRequest.of(0, 15 - topBooks.size()));
                for (Book book : randomBooks) {
                    topBooks.add(book);
                    if (topBooks.size() == 15) break;
                }
            }

            // 저장
            for (Book book : topBooks) {
                TagRandomBook entity = TagRandomBook.builder()
                        .tag(tag)
                        .book(book)
                        .build();
                tagRandomBookRepository.save(entity);
            }

            log.info("[{}] 태그 인기 도서 등록 완료. 총 {}권", tag, topBooks.size());
        }

        log.info("[배치 완료] 태그별 인기 도서 테이블 갱신 완료");
        log.info("***********************************************************************************************");
    }
}
