package com.ssafy.booknest.domain.book.dto.response.evaluation;

import com.ssafy.booknest.domain.book.entity.evaluation.Rating;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRatingResponse {
    private Integer bookId;
    private Integer ratingId;
    private String bookName;
    private String imageUrl;
    private Double rating;
    private List<String> authors;
    private LocalDateTime updatedAt;

    public static UserRatingResponse of(Rating rating){
        return UserRatingResponse.builder()
                .bookId(rating.getBook().getId())
                .ratingId(rating.getId())
                .bookName(rating.getBook().getTitle())
                .imageUrl(rating.getBook().getImageUrl())
                .rating(rating.getRating())
                .authors(
                        rating.getBook().getBookAuthors().stream()
                                .map(bookAuthor -> bookAuthor.getAuthor().getName())
                                .collect(Collectors.toList())
                )
                .updatedAt(rating.getUpdatedAt())
                .build();
    }
}
