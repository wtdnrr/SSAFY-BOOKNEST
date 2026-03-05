package com.ssafy.booknest.domain.book.service;

import com.ssafy.booknest.global.error.ErrorCode;
import com.ssafy.booknest.global.error.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class KyoboService {

    public String getKyoboUrlByIsbn(String isbn) {
        try {
            // 1. ISBN 인코딩
            String encodedIsbn = URLEncoder.encode(isbn, StandardCharsets.UTF_8);

            // 2. 교보문고 ISBN 검색 URL
            String searchUrl = "https://search.kyobobook.co.kr/web/search?vPstrKeyWord=" + encodedIsbn;

            // 3. HTML 파싱
            Document doc = Jsoup.connect(searchUrl)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .get();

            // 4. 결과 중 'a.prod_info'가 상세페이지 링크
            Elements links = doc.select("a.prod_info");

            for (Element link : links) {
                String href = link.attr("href");

                // 링크 안에 ISBN이 포함되거나 관련 있는 링크면 그대로 반환
                if (href.contains("product.kyobobook.co.kr")) {
                    return href;
                }
            }

            // 5. 아무것도 없으면 null
            return null;

        } catch (Exception e) {
            log.error("Failed to fetch Kyobo link for ISBN: {}, message: {}", isbn, e.getMessage());
            throw new CustomException(ErrorCode.CRAWLING_FAILED);
        }
    }
}
