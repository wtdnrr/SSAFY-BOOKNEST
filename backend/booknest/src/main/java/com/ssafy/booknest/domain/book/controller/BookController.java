package com.ssafy.booknest.domain.book.controller;

import com.ssafy.booknest.domain.book.dto.response.*;
import com.ssafy.booknest.domain.book.dto.response.recommendation.*;
import com.ssafy.booknest.domain.book.enums.BookEvalType;
import com.ssafy.booknest.domain.book.service.BookService;
import com.ssafy.booknest.domain.book.service.FastApiService;
import com.ssafy.booknest.global.common.CustomPage;
import com.ssafy.booknest.global.common.response.ApiResponse;
import com.ssafy.booknest.global.common.util.AuthenticationUtil;
import com.ssafy.booknest.global.common.util.UserActionLogger;
import com.ssafy.booknest.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/book")
public class BookController {

    private final BookService bookService;
    private final AuthenticationUtil authenticationUtil;
    private final FastApiService fastApiService;
    private final UserActionLogger userActionLogger;

    // 베스트 셀러 목록 조회
    @GetMapping("/best")
    public ResponseEntity<ApiResponse<List<BookResponse>>> getBestSeller(@AuthenticationPrincipal UserPrincipal userPrincipal) {

        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        return ApiResponse.success(bookService.getBestSellers(userId));
    }


    // 도서 상세
    @GetMapping("/{bookId}")
    public ResponseEntity<ApiResponse<BookDetailResponse>> getBook(@PathVariable("bookId") Integer bookId,
                                                                   @AuthenticationPrincipal UserPrincipal userPrincipal,
                                                                   Pageable pageable) {
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        userActionLogger.logAction(userId, bookId, "click_book_detail");

        return ApiResponse.success(bookService.getBook(userId, bookId, pageable));
    }

    // 책 구매사이트 연계
    @GetMapping("/{bookId}/purchase")
    public ResponseEntity<ApiResponse<BookPurchaseResponse>> getPurchaseLinks(@PathVariable("bookId") Integer bookId,
                                                                              @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        return ApiResponse.success(bookService.getPurchaseLinks(userId, bookId));
    }

    // 오늘의 추천
    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<FastApiRecommendation>>> getTodayRecommendations(@AuthenticationPrincipal UserPrincipal userPrincipal) {

        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        return ApiResponse.success(fastApiService.getTodayRecommendations(userId));
    }

    // 대출 기록 기반 추천
    @GetMapping("/book-loan")
    public ResponseEntity<ApiResponse<List<FastApiRecommendation>>> getBookLoanRecommendations(@AuthenticationPrincipal UserPrincipal userPrincipal) {

        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        return ApiResponse.success(fastApiService.getBookLoanRecommendations(userId));
    }

    // 최근 키워드 기반 추천
    @GetMapping("/recent-keyword")
    public ResponseEntity<ApiResponse<List<FastApiRecommendation>>> getRecentKeywordRecommendations(@AuthenticationPrincipal UserPrincipal userPrincipal) {

        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        return ApiResponse.success(fastApiService.getRecentKeywordRecommendations(userId));
    }


    // 평론가 추천 책(랜덤으로 한 명 평론가 추천 책들이 보여짐)
    @GetMapping("/critic")
    public ResponseEntity<ApiResponse<List<CriticBookResponse>>> getCriticBooks(@AuthenticationPrincipal UserPrincipal userPrincipal){

        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        return ApiResponse.success(bookService.getCriticBooks(userId));
    }

    // 화제의 작가 책 추천(랜덤으로 한 명 작가 책들이 보여짐)
    @GetMapping("/author")
    public ResponseEntity<ApiResponse<List<BookResponse>>> getAuthorBooks(@AuthenticationPrincipal UserPrincipal userPrincipal) {

        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        return ApiResponse.success(bookService.getAuthorBooks(userId));
    }

    // 나이대와 성별에 따른 추천
    @GetMapping("/age-gender")
    public ResponseEntity<ApiResponse<AgeGenderBookResult>> getAgeGenderBooks(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        // bookService에서 이미 AgeGenderBookResult 리턴하도록 수정한 상태니까, 그대로 받기만 하면 됨
        return ApiResponse.success(bookService.getAgeGenderBooks(userId));
    }


    // 태그별 랜덤 추천
    @GetMapping("/tag")
    public ResponseEntity<ApiResponse<TagBookResult>> getTagRandomBooks(
            @AuthenticationPrincipal UserPrincipal userPrincipal){

        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        return ApiResponse.success(TagBookResult.of(bookService.getTagRandomBooks(userId)));
    }

    // 년도별 도서관 대여 순위 추천
    @GetMapping("/library")
    public ResponseEntity<ApiResponse<List<LibraryBookResponse>>> getLibraryBooks(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                                                                  @RequestParam(value = "targetYear") Integer targetYear) {
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        return ApiResponse.success(bookService.getLibraryBooksByYear(userId, targetYear));
    }

    // 내가 가장 많이 본 카테고리에서 추천
    @GetMapping("/favorite-category")
    public ResponseEntity<ApiResponse<List<FavoriteCategoryBookResponse>>> getFavoriteCategoryBooks(@AuthenticationPrincipal UserPrincipal userPrincipal){

        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        return ApiResponse.success(bookService.getFavoriteCategoryBooks(userId));
    }


    // 내가 가장 많이 본 태그에서 추천
    @GetMapping("/favorite-tag")
    public ResponseEntity<ApiResponse<List<FavoriteTagBookResponse>>> getFavoriteTagBooks(@AuthenticationPrincipal UserPrincipal userPrincipal){

        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        return ApiResponse.success(bookService.getFavoriteTagBooks(userId));
    }

    // 평가 페이지 조회
    @GetMapping("/eval")
    public ResponseEntity<ApiResponse<CustomPage<BookResponse>>> getEvalBookList(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                                                                 @RequestParam(defaultValue = "RANDOM") BookEvalType keyword,
                                                                                 Pageable pageable){
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        return ApiResponse.success(bookService.getEvalBookList(userId, keyword, pageable));
    }
}
