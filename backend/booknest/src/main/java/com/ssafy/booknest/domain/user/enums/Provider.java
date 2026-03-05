package com.ssafy.booknest.domain.user.enums;

public enum Provider {
    KAKAO, GOOGLE, NAVER;

    public String getName() {
        return this.name().toLowerCase();
    }
}
