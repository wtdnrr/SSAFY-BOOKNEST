package com.ssafy.booknest.domain.nest.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AddBookNestResponse {
    private Integer bookId;
    private Integer nestId;
    private Double rating;
    private LocalDateTime createdAt;

    public static AddBookNestResponse of (Integer bookId){
        return AddBookNestResponse.builder()
                .bookId(bookId)
                .build();
    }
}
