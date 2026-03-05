package com.ssafy.booknest.domain.search.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PopularKeywordService {

    private final RedisTemplate<String, String> redisTemplate;

    // 날짜 포맷: yyyyMMdd 형식으로 사용 (ex: 20250410)
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.BASIC_ISO_DATE;

    // 오늘 날짜 기준 키워드 카운트를 1 증가시키고 TTL 2일 설정
    public void increaseKeywordCount(String keyword) {
        String key = getTodayKey();
        redisTemplate.opsForZSet().incrementScore(key, keyword, 1);
        // key는 TTL 2일 정도로 설정 (자동 삭제)
        redisTemplate.expire(key, Duration.ofDays(2));
    }

    // 오늘 날짜 기준 상위 5개 키워드 반환
    public List<String> getTodayPopularKeywords() {
        String key = getTodayKey();
        Set<String> keywords = redisTemplate.opsForZSet().reverseRange(key, 0, 4);
        return new ArrayList<>(keywords);
    }

    // 오늘의 상위 키워드 5개를 별도 키로 스냅샷 저장
    public void snapshotTodayTopKeywords() {
        String todayKey = getTodayKey();
        String snapshotKey = getSnapshotKey(LocalDate.now().format(FORMATTER));

        Set<String> topKeywords = redisTemplate.opsForZSet().reverseRange(todayKey, 0, 4);
        if (topKeywords != null) {
            for (String keyword : topKeywords) {
                redisTemplate.opsForList().rightPush(snapshotKey, keyword);
            }
        }

        // snapshot도 TTL 설정 (예: 30일)
        redisTemplate.expire(snapshotKey, Duration.ofDays(30));
    }

    // 오늘 날짜 기반 인기 키워드 키 생성
    private String getTodayKey() {
        return "popular_keywords:" + LocalDate.now().format(FORMATTER);
    }


    // 특정 날짜 기반 스냅샷 키 생성
    private String getSnapshotKey(String date) {
        return "daily_snapshot:" + date;
    }
}

