package com.ssafy.booknest.domain.user.controller;

import com.ssafy.booknest.domain.auth.dto.TokenValidationResult;
import com.ssafy.booknest.domain.user.dto.request.UserUpdateImgRequest;
import com.ssafy.booknest.domain.user.dto.response.UserInfoResponse;
import com.ssafy.booknest.domain.user.dto.request.UserUpdateRequest;
import com.ssafy.booknest.domain.user.dto.response.UserMypageResponse;
import com.ssafy.booknest.domain.user.service.UserService;
import com.ssafy.booknest.global.common.response.ApiResponse;
import com.ssafy.booknest.global.common.util.AuthenticationUtil;
import com.ssafy.booknest.global.security.UserPrincipal;
import com.ssafy.booknest.global.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final AuthenticationUtil authenticationUtil;
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/validate/{token}")
    public ResponseEntity<ApiResponse<Boolean>> validateToken(@PathVariable String token) {
        TokenValidationResult result = jwtTokenProvider.validateToken(token);
        if (!result.isValid()) {
            return ApiResponse.success(false);
        }

        try {
            Integer userId = jwtTokenProvider.getUserId(token);
            Boolean exists = userService.existsById(userId);
            return ApiResponse.success(exists);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ApiResponse.success(false);
        }
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        userService.deleteUser(userId);

        return ApiResponse.success(HttpStatus.OK);
    }

    // 회원정보 수정
    @PutMapping("/update")
    public ResponseEntity<ApiResponse<Void>> updateUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UserUpdateRequest dto) {

        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);
        userService.updateUser(userId, dto);

        return ApiResponse.success(HttpStatus.OK);
    }

    //닉네임 중복확인
    @GetMapping("/nickname-check")
    public ResponseEntity<ApiResponse<Boolean>> checkNickname(@RequestParam String nickname) {
        boolean isDuplicate = userService.isNicknameDuplicate(nickname);
        return ApiResponse.success(isDuplicate);
    }

    @GetMapping("/info")
    public ResponseEntity<ApiResponse<UserInfoResponse>> getUserInfo(
            @AuthenticationPrincipal UserPrincipal userPrincipal){
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        return ApiResponse.success(userService.getUserInfo(userId));
    }

    @GetMapping("/mypage")
    public ResponseEntity<ApiResponse<UserMypageResponse>> getUserMypage(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam("targetUserId") Integer targetUserId) {
        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        return ApiResponse.success(userService.getUserMypage(userId, targetUserId));
    }

    // 프로필 이미지 등록, 수정, 삭제
    @PutMapping("/profile-image")
    public ResponseEntity<ApiResponse<Void>> updateUserProfileImage(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UserUpdateImgRequest dto) {

        Integer userId = authenticationUtil.getCurrentUserId(userPrincipal);

        userService.saveProfileImage(userId, dto);

        return ApiResponse.success(HttpStatus.CREATED);
    }

}
