package com.ssafy.booknest.domain.user.scheduler.tag;

import com.ssafy.booknest.domain.book.entity.BookTag;
import com.ssafy.booknest.domain.book.entity.evaluation.Rating;
import com.ssafy.booknest.domain.book.repository.evaluation.RatingRepository;
import com.ssafy.booknest.domain.user.entity.tag.UserTagAnalysis;
import com.ssafy.booknest.domain.user.repository.tag.UserTagAnalysisRepository;
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
public class UserTagAnalysisScheduler {

    private final RatingRepository ratingRepository;
    private final UserTagAnalysisRepository userTagAnalysisRepository;

    @Transactional
    @Scheduled(fixedRate = 1000 * 60 * 90) // 1시간 30분마다 실행
    public void runUserTagAnalysisBatch() {
        log.info("[태그 배치 시작] 유저 선호 분석");

        // 1. 모든 평점 데이터를 가져옴
        List<Rating> allRatings = ratingRepository.findAllWithBookAndTags();

        // 2. 유저별 태그 → 평점 리스트 맵핑
        Map<Integer, Map<String, List<Double>>> userTagRatings = new HashMap<>();

        for (Rating rating : allRatings) {
            Integer userId = rating.getUser().getId();
            List<BookTag> bookTags = rating.getBook().getBookTags();

            userTagRatings.putIfAbsent(userId, new HashMap<>());

            if (bookTags != null) {
                for (BookTag bookTag : bookTags) {
                    String tagName = bookTag.getTag().getName();
                    userTagRatings.get(userId)
                            .computeIfAbsent(tagName, k -> new ArrayList<>())
                            .add(rating.getRating());
                }
            }
        }

        // 3. 유저별 상위 5개 태그 분석
        for (Map.Entry<Integer, Map<String, List<Double>>> entry : userTagRatings.entrySet()) {
            Integer userId = entry.getKey();
            Map<String, List<Double>> tagMap = entry.getValue();

            List<String> topTags = tagMap.entrySet().stream()
                    .collect(Collectors.toMap(
                            Map.Entry::getKey,
                            e -> e.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0.0)
                    ))
                    .entrySet().stream()
                    .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                    .limit(5)
                    .map(Map.Entry::getKey)
                    .toList();

            // 4. 기존 기록 삭제 후 재삽입
            userTagAnalysisRepository.deleteByUserId(userId);

            for (String tag : topTags) {
                UserTagAnalysis analysis = UserTagAnalysis.builder()
                        .userId(userId)
                        .favoriteTag(tag)
                        .build();
                userTagAnalysisRepository.save(analysis);
            }
        }

        log.info("[태그 배치 완료] 유저 분석 테이블 갱신 완료");
        log.info("***************************************************************************************************");
    }
}
