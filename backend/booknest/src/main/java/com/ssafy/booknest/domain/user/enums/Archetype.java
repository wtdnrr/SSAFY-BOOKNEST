package com.ssafy.booknest.domain.user.enums;

public enum Archetype {
    Albatross("알바트로스"),
    Eagle("독수리"),
    LongTailedTit("흰 오목눈이"),
    Owl("부엉이"),
    Crow("까마귀"),
    Canary("카나리아"),
    Parrot("앵무새"),
    Flamingo("플라밍고");

    private final String koreanName;

    Archetype(String koreanName) {
        this.koreanName = koreanName;
    }

    public String getKoreanName() {
        return koreanName;
    }
}
