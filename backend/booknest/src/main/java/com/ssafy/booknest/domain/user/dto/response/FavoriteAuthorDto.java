package com.ssafy.booknest.domain.user.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FavoriteAuthorDto {
    private String name;
    private String imageUrl;
}