package com.ssafy.booknest.domain.book.client;

import com.ssafy.booknest.global.error.ErrorCode;
import com.ssafy.booknest.global.error.exception.CustomException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class FastApiClient {

    @Value("${fastapi.url}")
    private String fastApiBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // 오늘의 추천
    public Map<String, Object> requestTodayRecommendation(Integer userId) {
        return postWithUserId(userId, "/recommend/today");
    }

    // 대출 기록 기반 추천
    public Map<String, Object> requestLoanLogRecommendation(Integer userId) {
        return postWithUserId(userId, "/recommend/loan_log");
    }

    // 최근 키워드 기반 추천
    public Map<String, Object> requestRecentTagRecommendation(Integer userId) {
        return postWithUserId(userId, "/recommend/recent_tag");
    }

    // 공통 POST 요청 처리
    private Map<String, Object> postWithUserId(Integer userId, String path) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("user_id", userId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            String endpoint = fastApiBaseUrl + path;
            ResponseEntity<Map> response = restTemplate.postForEntity(endpoint, requestEntity, Map.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("FastAPI 연동 실패 ({}): {}", path, e.getMessage());
            throw new CustomException(ErrorCode.FASTAPI_REQUEST_FAILED);
        }
    }
}