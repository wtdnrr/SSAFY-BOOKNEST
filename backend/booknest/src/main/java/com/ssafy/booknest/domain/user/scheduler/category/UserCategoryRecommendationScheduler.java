package com.ssafy.booknest.domain.user.scheduler.category;

import com.ssafy.booknest.domain.book.entity.Book;
import com.ssafy.booknest.domain.book.repository.BookRepository;
import com.ssafy.booknest.domain.user.entity.category.UserCategoryAnalysis;
import com.ssafy.booknest.domain.user.entity.category.UserCategoryRecommendation;
import com.ssafy.booknest.domain.user.repository.category.UserCategoryAnalysisRepository;
import com.ssafy.booknest.domain.user.repository.category.UserCategoryRecommendationRepository;
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
public class UserCategoryRecommendationScheduler {

    private final UserCategoryAnalysisRepository analysisRepository;
    private final UserCategoryRecommendationRepository recommendationRepository;
    private final BookRepository bookRepository;

    @Transactional
    @Scheduled(fixedRate = 1000 * 60 * 60 * 1, initialDelay = 1000 * 60 * 3) // 1시간마다 실행
    public void runCategoryRecommendationBatch() {
        log.info("[카테고리 추천 배치 시작] 유저 선호 카테고리 기반 추천 도서 저장");

        // 1. 기존 추천 모두 삭제
        recommendationRepository.deleteAllInBatch();

        // 2. 유저별 선호 카테고리 분석 결과 가져오기
        List<UserCategoryAnalysis> allAnalyses = analysisRepository.findAll();
        int saved = 0;

        for (UserCategoryAnalysis analysis : allAnalyses) {
            String categoryName = analysis.getFavoriteCategory();
            Integer userId = analysis.getUserId();

            List<Book> books = bookRepository.findRandomBooksByCategory(categoryName, PageRequest.of(0, 15));

            for (Book book : books) {
                UserCategoryRecommendation recommendation = UserCategoryRecommendation.builder()
                        .userId(userId)
                        .category(categoryName)
                        .book(book)
                        .build();
                recommendationRepository.save(recommendation);
                saved++;
            }
        }

        log.info("[카테고리 추천 배치 완료] 총 저장된 추천 도서 수: {}", saved);
        log.info("*********************************************************");
    }
}
