package com.ssafy.booknest.domain.follow.service;

import com.ssafy.booknest.domain.book.repository.evaluation.RatingRepository;
import com.ssafy.booknest.domain.follow.dto.response.FollowResponse;
import com.ssafy.booknest.domain.follow.entity.Follow;
import com.ssafy.booknest.domain.follow.repository.FollowRepository;
import com.ssafy.booknest.domain.user.entity.User;
import com.ssafy.booknest.domain.user.repository.UserRepository;
import com.ssafy.booknest.global.common.CustomPage;
import com.ssafy.booknest.global.error.ErrorCode;
import com.ssafy.booknest.global.error.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final RatingRepository ratingRepository;

    // 타겟 유저 팔로우
    @Transactional
    public void followUser(Integer userId, Integer targetUserId) {
        User follower = userRepository.findById(userId).orElseThrow(() ->
                new CustomException(ErrorCode.USER_NOT_FOUND));

        User following = userRepository.findById(targetUserId).orElseThrow(() ->
                new CustomException(ErrorCode.USER_NOT_FOUND));

        Follow follow = Follow.builder()
                .follower(follower)
                .following(following)
                .build();
        followRepository.save(follow);
    }

    // 타겟 유저 팔로우 취소
    @Transactional
    public void unfollowUser(Integer userId, Integer targetUserId) {
        User follower = userRepository.findById(userId).orElseThrow(() ->
                new CustomException(ErrorCode.USER_NOT_FOUND));

        User following = userRepository.findById(targetUserId).orElseThrow(() ->
                new CustomException(ErrorCode.USER_NOT_FOUND));

        followRepository.deleteByFollowerAndFollowing(follower, following);
    }

    // 팔로잉 목록 조회
    public CustomPage<FollowResponse> getFollowingList(Integer userId, Integer targetUserId, Pageable pageable) {
        User user = userRepository.findById(userId).orElseThrow(() ->
                new CustomException(ErrorCode.USER_NOT_FOUND));

        Page<User> followingUsers = followRepository.findFollowingUsers(targetUserId, pageable);

        return new CustomPage<>(followingUsers.map(followingUser -> {
            Integer totalRatings = ratingRepository.countRatings(followingUser.getId());
            Boolean isFollowing = followRepository.existsByFollowerIdAndFollowingId(user.getId(), followingUser.getId());
            return FollowResponse.of(followingUser, totalRatings, isFollowing);
        }));
    }

    // 팔로워 목록 조회
    public CustomPage<FollowResponse> getFollowerList(Integer userId, Integer targetUserId, Pageable pageable) {
        User user = userRepository.findById(userId).orElseThrow(() ->
                new CustomException(ErrorCode.USER_NOT_FOUND));

        Page<User> followerUsers = followRepository.findFollwerUsers(targetUserId, pageable);

        return new CustomPage<>(followerUsers.map(followerUser -> {
            Integer totalRatings = ratingRepository.countRatings(followerUser.getId());
            Boolean isFollowing = followRepository.existsByFollowerIdAndFollowingId(user.getId(), followerUser.getId());
            return FollowResponse.of(followerUser, totalRatings, isFollowing);
        }));
    }
}
