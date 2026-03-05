package com.ssafy.booknest.domain.book.dto.response.recommendation;

import lombok.*;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FastApiResponse {

    private String db_status;
    private List<FastApiRecommendation> result;

}

