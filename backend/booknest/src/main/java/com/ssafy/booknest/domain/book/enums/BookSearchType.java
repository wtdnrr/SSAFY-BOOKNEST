package com.ssafy.booknest.domain.book.enums;

public enum BookSearchType {
    TITLE("제목"),
    AUTHOR("저자"),
    ALL("통합 검색");

    private final String label;

    BookSearchType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
