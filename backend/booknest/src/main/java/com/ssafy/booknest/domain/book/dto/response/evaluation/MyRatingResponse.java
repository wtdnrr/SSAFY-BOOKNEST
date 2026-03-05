package com.ssafy.booknest.domain.book.dto.response.evaluation;

import com.ssafy.booknest.domain.book.entity.evaluation.Rating;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyRatingResponse {

    private Integer bookId;
    private Double rating;

    public static MyRatingResponse of(Rating rating, Integer bookId) {
        if (rating == null || rating.getBook() == null) {
            return MyRatingResponse.builder()
                    .bookId(bookId)
                    .rating(0.0)
                    .build();
        }
        return MyRatingResponse.builder()
                .bookId(rating.getBook().getId())
                .rating(rating.getRating())
                .build();
    }
}

