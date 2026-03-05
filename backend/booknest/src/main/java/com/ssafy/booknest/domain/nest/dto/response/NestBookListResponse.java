package com.ssafy.booknest.domain.nest.dto.response;

import com.ssafy.booknest.domain.book.entity.Book;
import com.ssafy.booknest.domain.book.entity.evaluation.Rating;
import com.ssafy.booknest.domain.book.entity.evaluation.Review;
import com.ssafy.booknest.domain.nest.entity.BookNest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class NestBookListResponse {

    private Integer bookId;
    private String title;
    private String authors;
    private String imageUrl;
    private LocalDateTime createdAt;
    private Double userRating; // 사용자가 매긴 평점
    private String userReview; // 사용자가 남긴 한줄평

    public static NestBookListResponse of(BookNest bookNest, Rating userRating, Review userReview) {
        Book book = bookNest.getBook();
        return NestBookListResponse.builder()
                .bookId(book.getId())
                .title(book.getTitle())
                .authors(book.getAuthors())
                .imageUrl(book.getImageUrl())
                .createdAt(bookNest.getCreatedAt())
                .userRating(userRating.getRating())
                .userReview(userReview != null ? userReview.getContent() : null) // 사용자의 한줄평 (없으면 null)
                .build();
    }
}


