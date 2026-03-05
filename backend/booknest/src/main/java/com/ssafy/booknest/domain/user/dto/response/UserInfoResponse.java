package com.ssafy.booknest.domain.user.dto.response;

import com.ssafy.booknest.domain.user.entity.Address;
import com.ssafy.booknest.domain.user.entity.User;
import com.ssafy.booknest.domain.user.enums.Gender;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserInfoResponse {
    private Integer userId;
    private Integer nestId;
    private String nickname;
    private String archetype;
    private Gender gender;
    private String birthDate;
    private String roadAddress;
    private String zipcode;
    private String profileURL;
    private Integer followers;
    private Integer followings;
    private Integer totalRatings;
    private Integer totalReviews;

    public static UserInfoResponse of(User user, Address address, Integer followers, Integer followings, Integer totalRatings, Integer totalReviews){
        return UserInfoResponse.builder()
                .userId(user.getId())
                .nestId(user.getNest().getId())
                .nickname(user.getNickname())
                .archetype(user.getArcheType())
                .gender(user.getGender())
                .birthDate(user.getBirthdate())
                .profileURL(user.getProfileUrl())
                .roadAddress(address.getRoadAddress())
                .zipcode(address.getZipcode())
                .followers(followers)
                .followings(followings)
                .totalRatings(totalRatings)
                .totalReviews(totalReviews)
                .build();
    }
}