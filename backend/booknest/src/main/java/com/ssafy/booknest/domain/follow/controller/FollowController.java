package com.ssafy.booknest.domain.follow.controller;

import com.ssafy.booknest.domain.follow.dto.response.FollowResponse;
import com.ssafy.booknest.domain.follow.service.FollowService;
import com.ssafy.booknest.global.common.CustomPage;
import com.ssafy.booknest.global.common.response.ApiResponse;
import com.ssafy.booknest.global.common.util.AuthenticationUtil;
import com.ssafy.booknest.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/follow")
public class FollowController {

    private final FollowService followService;
    private final AuthenticationUtil authenticationUtil;

    // 타겟 유저 팔로우
    @PostMapping("")
    public ResponseEntity<ApiResponse<Void>> followUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("targetUserId") Integer targetUserId){
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        followService.followUser(userId, targetUserId);

        return ApiResponse.success(HttpStatus.OK);
    }

    // 타겟 유저 팔로우 취소
    @DeleteMapping("")
    public ResponseEntity<ApiResponse<Void>> unfollowUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("targetUserId") Integer targetUserId){
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        followService.unfollowUser(userId, targetUserId);

        return ApiResponse.success(HttpStatus.OK);
    }

    // 팔로잉 목록 조회
    @GetMapping("/following")
    public ResponseEntity<ApiResponse<CustomPage<FollowResponse>>> getFollowingList(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("targetUserId") Integer targetUserId,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable){
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        return ApiResponse.success(followService.getFollowingList(userId, targetUserId, pageable));
    }

    // 팔로워 목록 조회
    @GetMapping("/follower")
    public ResponseEntity<ApiResponse<CustomPage<FollowResponse>>> getFollowerList(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("targetUserId") Integer targetUserId,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable){
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        return ApiResponse.success(followService.getFollowerList(userId, targetUserId, pageable));
    }
}
