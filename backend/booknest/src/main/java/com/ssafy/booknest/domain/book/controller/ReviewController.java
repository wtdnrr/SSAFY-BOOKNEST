package com.ssafy.booknest.domain.book.controller;

import com.ssafy.booknest.domain.book.dto.request.ReviewRequest;
import com.ssafy.booknest.domain.book.dto.response.evaluation.BestReviewResponse;
import com.ssafy.booknest.domain.book.dto.response.evaluation.UserReviewResponse;
import com.ssafy.booknest.domain.book.service.ReviewService;
import com.ssafy.booknest.global.common.CustomPage;
import com.ssafy.booknest.global.common.response.ApiResponse;
import com.ssafy.booknest.global.common.util.AuthenticationUtil;
import com.ssafy.booknest.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/book")
public class ReviewController {

    private final AuthenticationUtil authenticationUtil;
    private final ReviewService reviewService;

    // 한줄평 등록
    @PostMapping("/{bookId}/review")
    public ResponseEntity<ApiResponse<Void>> addReview(@PathVariable("bookId") Integer bookId,
                                                       @AuthenticationPrincipal UserPrincipal userPrincipal,
                                                       @RequestBody ReviewRequest reviewRequest
    ) {
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        reviewService.saveReview(userId, bookId, reviewRequest);
        return ApiResponse.success(HttpStatus.OK);
    }

    // 한줄평 수정
    @PutMapping("/review/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> updateReview(@PathVariable("reviewId") Integer reviewId,
                                                          @AuthenticationPrincipal UserPrincipal userPrincipal,
                                                          @RequestBody ReviewRequest reviewRequest){
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        reviewService.updateReview(userId, reviewId, reviewRequest);
        return ApiResponse.success(HttpStatus.OK);
    }

    // 한줄평 삭제
    @DeleteMapping("/review/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable("reviewId") Integer reviewId,
                                                          @AuthenticationPrincipal UserPrincipal userPrincipal){
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        reviewService.deleteReview(userId, reviewId);
        return ApiResponse.success(HttpStatus.OK);
    }

    // 한줄평 목록 조회 (내 리뷰 or 타인 리뷰)
    @GetMapping("/review")
    public ResponseEntity<ApiResponse<CustomPage<UserReviewResponse>>> getReviews(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                                                                  @RequestParam(value = "targetId") Integer targetId,
                                                                                  Pageable pageable) {
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        CustomPage<UserReviewResponse> responseList = reviewService.getReviews(userId, targetId, pageable);
        return ApiResponse.success(responseList);
    }

    // 한줄평 좋아요
    @PostMapping("/review/{reviewId}/like")
    public ResponseEntity<ApiResponse<Void>> likeReview(@PathVariable("reviewId") Integer reviewId,
                                                        @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Integer likerId = authenticationUtil.getCurrentUserId(userPrincipal);
        reviewService.likeReview(likerId, reviewId);
        return ApiResponse.success(HttpStatus.CREATED);
    }

    // 한줄평 좋아요 취소
    @DeleteMapping("/review/{reviewId}/like")
    public ResponseEntity<ApiResponse<Void>> unlikeReview(@PathVariable("reviewId") Integer reviewId,
                                                          @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        reviewService.unlikeReview(userId, reviewId);
        return ApiResponse.success(HttpStatus.OK);
    }

    // 오늘 베스트 한줄평
    @GetMapping("/best-reviews")
    public ResponseEntity<ApiResponse<List<BestReviewResponse>>> getBestReviews(@AuthenticationPrincipal UserPrincipal userPrincipal) {

        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        List<BestReviewResponse> bestReviews = reviewService.getBestReviews(userId);
        return ApiResponse.success(bestReviews);
    }

}
