package com.ssafy.booknest.domain.user.scheduler.category;

import com.ssafy.booknest.domain.book.entity.BookCategory;
import com.ssafy.booknest.domain.book.entity.evaluation.Rating;
import com.ssafy.booknest.domain.book.repository.evaluation.RatingRepository;
import com.ssafy.booknest.domain.user.entity.User;
import com.ssafy.booknest.domain.user.entity.category.UserCategoryAnalysis;
import com.ssafy.booknest.domain.user.repository.category.UserCategoryAnalysisRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserCategoryAnalysisScheduler {

    private final RatingRepository ratingRepository;
    private final UserCategoryAnalysisRepository userCategoryAnalysisRepository;

    @Transactional
    @Scheduled(fixedRate = 1000 * 60 * 60 * 1) // 1시간 마다 실행
    public void runUserCategoryAnalysisBatch() {
        log.info("[카테고리 배치 시작] 유저 선호 분석");

        List<Rating> allRatings = ratingRepository.findAllWithBookAndCategory();
        Map<User, Map<String, List<Double>>> userCategoryRatings = new HashMap<>();

        // 1. 유저별 카테고리별 평점 수집
        for (Rating rating : allRatings) {
            User user = rating.getUser();
            userCategoryRatings.putIfAbsent(user, new HashMap<>());

            for (BookCategory bookCategory : rating.getBook().getBookCategories()) {
                String categoryName = bookCategory.getCategory().getName();
                userCategoryRatings.get(user)
                        .computeIfAbsent(categoryName, k -> new ArrayList<>())
                        .add(rating.getRating());
            }
        }

        // 2. 유저별 평균 점수 기준 상위 5개 카테고리 저장
        for (Map.Entry<User, Map<String, List<Double>>> entry : userCategoryRatings.entrySet()) {
            User user = entry.getKey();
            Map<String, List<Double>> categoryRatings = entry.getValue();

            // 평균 계산 후 상위 5개 추출
            List<String> topCategories = categoryRatings.entrySet().stream()
                    .collect(Collectors.toMap(
                            Map.Entry::getKey,
                            e -> e.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0.0)
                    ))
                    .entrySet().stream()
                    .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                    .limit(5)
                    .map(Map.Entry::getKey)
                    .toList();

            // 기존 분석 데이터 삭제
            userCategoryAnalysisRepository.deleteByUserId(user.getId());

            // 새로운 분석 데이터 저장
            for (String category : topCategories) {
                UserCategoryAnalysis analysis = UserCategoryAnalysis.builder()
                        .userId(user.getId())
                        .favoriteCategory(category)
                        .build();
                userCategoryAnalysisRepository.save(analysis);
            }
        }

        log.info("[카테고리 배치 완료] 유저 분석 테이블 갱신 완료");
        log.info("********************************************");
    }
}
