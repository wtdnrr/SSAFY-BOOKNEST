package com.ssafy.booknest.domain.search.controller;

import com.ssafy.booknest.domain.book.dto.response.BookResponse;
import com.ssafy.booknest.domain.book.enums.BookEvalType;
import com.ssafy.booknest.domain.search.dto.response.BookSearchResponse;
import com.ssafy.booknest.domain.search.dto.response.UserSearchResponse;
import com.ssafy.booknest.domain.search.record.BookEval;
import com.ssafy.booknest.domain.search.record.SearchedBook;
import com.ssafy.booknest.domain.search.service.PopularKeywordService;
import com.ssafy.booknest.domain.search.service.SearchService;
import com.ssafy.booknest.global.common.CustomPage;
import com.ssafy.booknest.global.common.response.ApiResponse;
import com.ssafy.booknest.global.common.util.AuthenticationUtil;
import com.ssafy.booknest.global.error.ErrorCode;
import com.ssafy.booknest.global.error.exception.CustomException;
import com.ssafy.booknest.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/search")
public class SearchController {

    private final AuthenticationUtil authenticationUtil;
    private final SearchService searchService;
    private final PopularKeywordService popularKeywordService;

    // 제목 또는 태그 기준으로 도서를 검색하며, 페이징 처리된 결과를 반환함
    @GetMapping("/book")
    public ResponseEntity<ApiResponse<CustomPage<BookSearchResponse>>> searchBook(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) List<String> tags,
            Pageable pageable) {

        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        return ApiResponse.success(searchService.searchBooks(userId, title, tags, pageable));
    }

    // 외부 검색 등을 통해 가져온 도서를 DB 또는 Elasticsearch에 저장
    @PostMapping("/book")
    public ResponseEntity<ApiResponse<SearchedBook>> addBook(@RequestBody SearchedBook book) {
        SearchedBook savedBook = searchService.saveBook(book);
        return ApiResponse.success(savedBook);
    }

    // 사용자 이름(name)을 기반으로 사용자 목록을 검색하고 페이징된 결과 반환
    @GetMapping("/user")
    public ResponseEntity<ApiResponse<CustomPage<UserSearchResponse>>> searchUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) String name,
            Pageable pageable){

        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        return ApiResponse.success(searchService.searchUser(userId, name, pageable));
    }

    // 오늘 기준으로 인기 있는 검색 키워드 리스트를 조회해 반환
    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<String>>> getTodayPopularKeywords(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<String> keywords = popularKeywordService.getTodayPopularKeywords();
        return ApiResponse.success(keywords);
    }

    // 입력된 키워드에 기반하여 도서 제목 추천 리스트를 반환
    @GetMapping("/autocomplete")
    public ResponseEntity<ApiResponse<List<String>>> autocomplete(@RequestParam String keyword) {
        List<String> suggestions = searchService.autocompleteTitle(keyword);
        return ApiResponse.success(suggestions);
    }

    // 사용자 ID와 평가 기준에 따라 평가 대상 도서 리스트를 조회
    @GetMapping("/eval")
    public ResponseEntity<ApiResponse<CustomPage<BookResponse>>> getEvalBookList(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "RANDOM") BookEvalType keyword,
            Pageable pageable) {
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        try {
            return ApiResponse.success(searchService.getEvalBookList(userId, keyword, pageable));
        } catch (IOException e) {
            throw new CustomException(ErrorCode.ELASTICSEARCH_ERROR); // 또는 적절한 예외
        }
    }


    // 사용자가 도서에 대해 남긴 평가를 저장
    @PostMapping("/book-eval")
    public ResponseEntity<ApiResponse<BookEval>> addBookEval(@RequestBody BookEval bookEval) throws IOException {
        BookEval savedEval = searchService.saveBookEval(bookEval);
        return ApiResponse.success(savedEval);
    }
}
