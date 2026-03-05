package com.ssafy.booknest.domain.nest.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class DeleteBookNestRequest {
    @NotNull
    private Integer nestId;
    @NotNull
    private Integer bookId;
}
