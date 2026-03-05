package com.ssafy.booknest.domain.book.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingRequest {

    @NotNull
    private Double score;

}
