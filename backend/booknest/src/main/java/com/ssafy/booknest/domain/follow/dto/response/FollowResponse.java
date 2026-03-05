package com.ssafy.booknest.domain.follow.dto.response;

import com.ssafy.booknest.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FollowResponse {
    private Integer userId;
    private String nickname;
    private String profileURL;
    private String archeType;
    private Integer totalRatings;
    private Boolean isFollowing;

    public static FollowResponse of(User user, Integer totalRatings, Boolean isFollowing){
        return FollowResponse.builder()
                .userId(user.getId())
                .nickname(user.getNickname())
                .profileURL(user.getProfileUrl())
                .archeType(user.getArcheType())
                .totalRatings(totalRatings)
                .isFollowing(isFollowing)
                .build();
    }
}
