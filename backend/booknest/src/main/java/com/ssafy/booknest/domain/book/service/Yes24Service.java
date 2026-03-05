package com.ssafy.booknest.domain.book.service;

import com.ssafy.booknest.global.error.ErrorCode;
import com.ssafy.booknest.global.error.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class Yes24Service {

    public String getYes24UrlByIsbn(String isbn) {
        try {
            // 1. YES24 검색 URL 구성
            String searchUrl = "https://www.yes24.com/Product/Search?domain=ALL&query=" + isbn;

            // 2. Jsoup으로 HTML 문서 크롤링
            Document doc = Jsoup.connect(searchUrl)
                    .userAgent("Mozilla/5.0") // 사용자 에이전트 지정
                    .timeout(5000) // 타임아웃 지정
                    .get();

            // 3. 검색 결과 중 첫 번째 도서 링크 추출
            Element firstLink = doc.selectFirst("a.gd_name");

            if (firstLink != null) {
                String href = firstLink.attr("href");

                // 4. YES24 도서 상세 페이지 전체 URL 반환
                return "https://www.yes24.com" + href;
            } else {
                log.warn("YES24 검색 결과가 없습니다. ISBN: {}", isbn);
            }

        } catch (Exception e) {
            log.error("YES24 크롤링 실패 - ISBN: {}, 메시지: {}", isbn, e.getMessage());
            throw new CustomException(ErrorCode.CRAWLING_FAILED);
        }

        return null;
    }
}
