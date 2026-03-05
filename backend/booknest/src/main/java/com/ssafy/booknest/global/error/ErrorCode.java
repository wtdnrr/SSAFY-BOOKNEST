package com.ssafy.booknest.global.error;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    // Common
    INVALID_INPUT_VALUE(400, "C001", "잘못된 입력값입니다"),
    RESOURCE_NOT_FOUND(404, "C002", "요청한 리소스를 찾을 수 없습니다"),
    INTERNAL_SERVER_ERROR(500, "C003", "서버 내부 오류가 발생했습니다"),

    // Authorization
    UNAUTHORIZED_ACCESS(401, "A001", "로그인이 필요한 서비스입니다"),
    FORBIDDEN_ACCESS(403, "A002", "접근 권한이 없습니다"),

    // OAUTH
    OAUTH_SERVER_ERROR(500, "O001", "OAuth 서버 오류가 발생했습니다"),
    INVALID_OAUTH_PROVIDER(400, "O002", "지원하지 않는 OAuth 제공자입니다"),
    INVALID_REFRESH_TOKEN(401, "O003", "Invalid refresh token"),
    REFRESH_TOKEN_NOT_FOUND(401, "O004", "Refresh token not found"),
    REFRESH_TOKEN_MISMATCH(401, "O005", "Refresh token mismatch"),

    // DB
    DATABASE_ERROR(500, "D001", "데이터베이스 오류가 발생했습니다."),

    // USER
    USER_NOT_FOUND(404, "U001", "유저를 찾을 수 없습니다."),
    ADDRESS_NOT_FOUND(404, "U002", "주소를 찾을 수 없습니다."),
    BIRTHDATE_INVALID(400, "U003", "유효하지 않은 생년월일입니다."),


    // BOOK
    BOOK_NOT_FOUND(404, "B001", "도서를 찾을 수 없습니다."),
    CRAWLING_FAILED(500, "B002", "크롤링 중 오류가 발생했습니다."),
    UNSUPPORTED_SEARCH_TYPE(400, "B003", "지원하지 않는 검색 타입입니다."),
    EMPTY_KEYWORD(400, "B004", "검색어는 필수입니다."),
    EMPTY_REVIEW_CONTENT(400, "B005", "한줄평이 입력되지 않았습니다."),
    REVIEW_ALREADY_EXISTS(400, "B006", "이미 작성한 한줄평이 존재합니다."),
    REVIEW_NOT_FOUND(404, "B007", "한줄평을 찾을 수 없습니다"),
    REVIEW_ALREADY_LIKED(400, "B007", "이미 한줄평에 좋아요가 있습니다."),
    REVIEW_LIKE_NOT_FOUND(404, "B008", "한줄평 좋아요가 없습니다"),
    EMPTY_RATING(404, "B009", "평점이 존재하지 않습니다."),
    ALREADY_IGNORED_BOOK(400, "B010", "이미 관심없음을 표시한 책입니다."),

    // RATING
    EMPTY_RATING_CONTENT(400, "R001", "점수가 입력되지 않았습니다"),
    RATING_ALREADY_EXISTS(400, "R002", "등록인데 이미 데이터베이스에 점수가 있습니다."),
    RATING_NOT_FOUND(404, "R003", "점수가 등록되어 있지 않습니다."),
    CANNOT_DELETE_RATING_IN_NEST(400, "R004", "둥지에 담긴 도서는 평점을 삭제할 수 없습니다."),
    IGNORED_BOOK_NOT_FOUND(404, "R005", "관심없음이 등록되지 않습니다."),

    // NEST
    BOOKNEST_NOT_FOUND(404, "N001", "둥지도서를 찾을 수 없습니다."),
    NEST_NOT_FOUND(404, "N002", "둥지가 등록되어 있지 않습니다."),
    ALREADY_BOOKMARKED(400, "N003", "이미 찜이 되어있습니다."),
    BOOKMARK_NOT_FOUND(404, "N004", "찜이 등록되어 있지 않습니다."),

    //Fast API
    FASTAPI_REQUEST_FAILED(500, "F001", "FastAPI 서버 호출에 실패했습니다."),

    // AGEGROUP & GENDER
    GENDER_NOT_SELECTED(400, "G001", "성별 정보가 설정되지 않아 연령대+성별 추천이 불가능합니다."),
    AGE_GENDER_BOOK_NOT_FOUND(404, "G002", "해당 연령대와 성별에 맞는 추천 도서를 찾을 수 없습니다."),

    // CRITIC
    CRITIC_NOT_FOUND(404, "C101", "해당 평론가 정보를 찾을 수 없습니다."),
    CRITIC_BOOK_NOT_FOUND(404, "C102", "해당 평론가의 추천 도서를 찾을 수 없습니다."),

    // ELASTICSEARCH
    ELASTICSEARCH_ERROR(500, "E001", "엘라스틱서치 오류 발생");



    private final int status;
    private final String code;
    private final String message;
}
