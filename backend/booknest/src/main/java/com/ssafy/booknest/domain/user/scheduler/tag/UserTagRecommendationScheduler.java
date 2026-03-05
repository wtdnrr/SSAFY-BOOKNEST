package com.ssafy.booknest.domain.user.scheduler.tag;

import com.ssafy.booknest.domain.book.entity.Book;
import com.ssafy.booknest.domain.book.repository.BookRepository;
import com.ssafy.booknest.domain.user.entity.tag.UserTagAnalysis;
import com.ssafy.booknest.domain.user.entity.tag.UserTagRecommendation;
import com.ssafy.booknest.domain.user.repository.tag.UserTagAnalysisRepository;
import com.ssafy.booknest.domain.user.repository.tag.UserTagRecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserTagRecommendationScheduler {

    private final UserTagAnalysisRepository userTagAnalysisRepository;
    private final UserTagRecommendationRepository recommendationRepository;
    private final BookRepository bookRepository;

    @Transactional
    @Scheduled(fixedRate = 1000 * 60 * 90, initialDelay = 1000 * 60 * 3) // 1시간 30분 마다 실행
    public void runUserTagRecommendationBatch() {
        log.info("[추천 배치 시작] 유저 선호 태그 기반 추천 도서 저장 시작");

        // 1. 기존 추천 모두 삭제
        recommendationRepository.deleteAllInBatch();

        // 2. 유저의 태그 분석 정보 가져오기
        List<UserTagAnalysis> analyses = userTagAnalysisRepository.findAll();
        int saved = 0;

        for (UserTagAnalysis analysis : analyses) {
            String tag = analysis.getFavoriteTag();
            Integer userId = analysis.getUserId(); // userId로 변경

            // 3. 추천 도서 조회
            List<Book> recommendedBooks = bookRepository.findRandomBooksByTag(tag, PageRequest.of(0, 15));

            // 4. 추천 도서 저장
            for (Book book : recommendedBooks) {
                UserTagRecommendation recommendation = UserTagRecommendation.builder()
                        .userId(userId) // userId로 저장
                        .tag(tag)
                        .book(book)
                        .build();

                recommendationRepository.save(recommendation);
                saved++;
            }
        }

        log.info("[추천 배치 완료] 총 추천 저장 건수: {}", saved);
        log.info("***************************************************************************************************");
    }
}
