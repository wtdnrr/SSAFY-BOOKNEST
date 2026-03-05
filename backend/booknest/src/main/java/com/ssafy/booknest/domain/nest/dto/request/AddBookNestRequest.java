package com.ssafy.booknest.domain.nest.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AddBookNestRequest {
    @NotNull
    private Integer bookId;
    @NotNull
    private Integer nestId;

    private Double rating;
}
