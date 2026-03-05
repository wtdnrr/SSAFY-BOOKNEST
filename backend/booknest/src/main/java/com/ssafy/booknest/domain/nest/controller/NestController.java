package com.ssafy.booknest.domain.nest.controller;

import com.ssafy.booknest.domain.nest.dto.request.AddBookNestRequest;
import com.ssafy.booknest.domain.nest.dto.request.BookMarkRequest;
import com.ssafy.booknest.domain.nest.dto.request.DeleteBookNestRequest;
import com.ssafy.booknest.domain.nest.dto.response.AddBookNestResponse;
import com.ssafy.booknest.domain.nest.dto.response.BookMarkListResponse;
import com.ssafy.booknest.domain.nest.dto.response.NestBookListResponse;
import com.ssafy.booknest.domain.nest.service.NestService;
import com.ssafy.booknest.global.common.CustomPage;
import com.ssafy.booknest.global.common.response.ApiResponse;
import com.ssafy.booknest.global.common.util.AuthenticationUtil;
import com.ssafy.booknest.global.common.util.UserActionLogger;
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
@RequestMapping("/api/nest")
public class NestController {

    private final NestService nestService;
    private final AuthenticationUtil authenticationUtil;
    private final UserActionLogger userActionLogger;

    // 타겟 유저의 서재(nest) 내 도서 목록을 조회 (페이징 처리 포함)
    @GetMapping("")
    public ResponseEntity<ApiResponse<CustomPage<NestBookListResponse>>> getNestBookList(
            @RequestParam("userId") Integer targetUserId,
            @RequestParam("nestId") Integer nestId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable) {
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        return ApiResponse.success(nestService.getNestBookList(userId, nestId, targetUserId, pageable));
    }

    // 사용자의 서재(둥지)에 도서를 추가하고, 사용자 행동 로그를 기록
    @PostMapping("")
    public ResponseEntity<ApiResponse<AddBookNestResponse>> addBookNest(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody AddBookNestRequest addBookNestRequest){

        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        AddBookNestResponse response = nestService.addBookNest(userId, addBookNestRequest);

        userActionLogger.logAction(userId, addBookNestRequest.getBookId(), "add_to_bookshelf");

        return ApiResponse.success(response, HttpStatus.CREATED);
    }

    // 찜하기 등록
    @PostMapping("/bookmark")
    public ResponseEntity<ApiResponse<Void>> addBookMark(
            @RequestBody BookMarkRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        Integer bookId = request.getBookId();

        nestService.addBookMark(userId, bookId);

        userActionLogger.logAction(userId, bookId, "add_to_wishlist");

        return ApiResponse.success(HttpStatus.CREATED);
    }

    // 찜하기 취소
    @DeleteMapping("/bookmark")
    public ResponseEntity<ApiResponse<Void>> removeBookMark(
            @RequestBody BookMarkRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        Integer bookId = request.getBookId();

        nestService.removeBookMark(userId, bookId);

        userActionLogger.logAction(userId, bookId, "cancel_wishlist");

        return ApiResponse.success(HttpStatus.OK);
    }

    // 찜목록 조회
    @GetMapping("/bookmark")
    public ResponseEntity<ApiResponse<List<BookMarkListResponse>>> getBookMarkList(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        List<BookMarkListResponse> responseList = nestService.getBookMarkList(userId);

        return ApiResponse.success(responseList);
    }

    // 사용자가 둥지(서재)에서 도서를 삭제
    @DeleteMapping("")
    public ResponseEntity<ApiResponse<Void>> deleteBookNest(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody DeleteBookNestRequest request) {
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        nestService.deleteBookNest(userId, request);

        userActionLogger.logAction(userId, request.getBookId(), "cancel_bookshelf");

        return ApiResponse.success(HttpStatus.OK);
    }
}
