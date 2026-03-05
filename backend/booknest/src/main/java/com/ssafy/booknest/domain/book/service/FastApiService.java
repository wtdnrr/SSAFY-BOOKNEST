package com.ssafy.booknest.domain.book.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.booknest.domain.book.client.FastApiClient;
import com.ssafy.booknest.domain.book.dto.response.recommendation.FastApiRecommendation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class FastApiService {

    private final FastApiClient fastApiClient;

    public List<FastApiRecommendation> getTodayRecommendations(Integer userId) {
        Map<String, Object> response = fastApiClient.requestTodayRecommendation(userId);

        // 예외 처리
        if (!"ok".equals(response.get("es_status"))) {
            throw new RuntimeException("FastAPI 오류: " + response.get("detail"));
        }

        // JSON 파싱
        ObjectMapper mapper = new ObjectMapper();
        List<FastApiRecommendation> list = mapper.convertValue(
                response.get("result"),
                new TypeReference<List<FastApiRecommendation>>() {}
        );

        return list;
    }

    public List<FastApiRecommendation> getBookLoanRecommendations(Integer userId) {
        Map<String, Object> response = fastApiClient.requestLoanLogRecommendation(userId);

        // 예외 처리
        if (!"ok".equals(response.get("es_status"))) {
            throw new RuntimeException("FastAPI 오류: " + response.get("detail"));
        }

        // JSON 파싱
        ObjectMapper mapper = new ObjectMapper();
        List<FastApiRecommendation> list = mapper.convertValue(
                response.get("result"),
                new TypeReference<List<FastApiRecommendation>>() {}
        );

        return list;
    }

    public List<FastApiRecommendation> getRecentKeywordRecommendations(Integer userId) {
        Map<String, Object> response = fastApiClient.requestRecentTagRecommendation(userId);

        // 예외 처리
        if (!"ok".equals(response.get("es_status"))) {
            throw new RuntimeException("FastAPI 오류: " + response.get("detail"));
        }

        // JSON 파싱
        ObjectMapper mapper = new ObjectMapper();
        List<FastApiRecommendation> list = mapper.convertValue(
                response.get("result"),
                new TypeReference<List<FastApiRecommendation>>() {}
        );

        return list;
    }
}



