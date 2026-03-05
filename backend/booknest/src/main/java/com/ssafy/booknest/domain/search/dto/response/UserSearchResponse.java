package com.ssafy.booknest.domain.search.dto.response;

import com.ssafy.booknest.domain.search.record.SearchedBook;
import com.ssafy.booknest.domain.search.record.SerachedUser;
import lombok.Builder;

@Builder
public record UserSearchResponse(
        Integer id,
        String nickname,
        String profileURL,
        boolean isFollowing
) {
    public static UserSearchResponse of(SerachedUser user, boolean isFollowing) {
        return UserSearchResponse.builder()
                .id(user.id())
                .nickname(user.nickname())
                .profileURL(user.profileURL())
                .isFollowing(isFollowing)
                .build();
    }
}
