package com.ssafy.booknest.domain.book.enums;

public enum AgeGroup {

    UNDER_10("10대 이하"),
    TWENTIES("20대"),
    THIRTIES("30대"),
    FORTIES("40대"),
    FIFTIES("50대"),
    OVER_60("60대 이상");

    private final String label;

    AgeGroup(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }


    public static AgeGroup fromAge(int age) {
        if (age <= 19) {
            return UNDER_10;
        } else if (age <= 29) {
            return TWENTIES;
        } else if (age <= 39) {
            return THIRTIES;
        } else if (age <= 49) {
            return FORTIES;
        } else if (age <= 59) {
            return FIFTIES;
        } else {
            return OVER_60;
        }
    }
}
