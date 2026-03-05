package com.ssafy.booknest.domain.search.controller;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/index")
public class AdminIndexController {

    private final ElasticsearchClient elasticsearchClient;

    // 기존 book 인덱스를 삭제하고 새롭게 설정된 분석기 및 매핑으로 다시 생성
    @PostMapping("/reset")
    public ResponseEntity<String> resetBookIndex() {
        try {
            // 1. 기존 인덱스 삭제
            boolean exists = elasticsearchClient.indices().exists(e -> e.index("book")).value();
            if (exists) {
                elasticsearchClient.indices().delete(d -> d.index("book"));
            }

            // 2. 인덱스 생성
            elasticsearchClient.indices().create(c -> c
                    .index("book")
                    .settings(s -> s.analysis(a -> a
                            .analyzer("korean_analyzer", analyzer -> analyzer
                                    .custom(ca -> ca
                                            .tokenizer("nori_tokenizer")
                                            .filter("lowercase", "nori_part_of_speech", "nori_readingform")
                                    )
                            )
                    ))
                    .mappings(m -> m
                            .properties("bookId", p -> p.integer(i -> i))
                            .properties("title", p -> p.text(t -> t.analyzer("korean_analyzer")))
                            .properties("image_url", p -> p.keyword(k -> k))
                            .properties("authors", p -> p.text(t -> t.analyzer("korean_analyzer")))
                            .properties("tags", p -> p.keyword(k -> k))
                            .properties("total_ratings", p -> p.integer(i -> i))  // total_ratings 필드를 추가
                    )
            );

            return ResponseEntity.ok("인덱스 재설정 완료");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("오류: " + e.getMessage());
        }
    }

}
