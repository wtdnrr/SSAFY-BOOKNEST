package com.ssafy.booknest.domain.book.dto.response.evaluation;

import com.ssafy.booknest.domain.book.entity.evaluation.Review;
import com.ssafy.booknest.domain.user.entity.User;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BestReviewResponse {

    private int reviewId;
    private int bookId;
    private String bookName;
    private String reviewerName;
    private String reviewerImgUrl;
    private String content;
    private Boolean myLiked;
    private int totalLikes;
    private int todayLikes;
    private int rank;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BestReviewResponse of(Review review, Integer currentUserId, int todayLikes, int rank) {
        User reviewer = review.getUser();
        String reviewerName = (reviewer.getDeletedAt() == null) ? reviewer.getNickname() : "탈퇴한 유저";
        boolean myLiked = review.getReviewLikes().stream()
                .anyMatch(like -> like.getUser().getId().equals(currentUserId));

        return BestReviewResponse.builder()
                .reviewId(review.getId())
                .bookId(review.getBook().getId())
                .bookName(review.getBook().getTitle())
                .reviewerName(reviewerName)
                .reviewerImgUrl(reviewer.getProfileUrl())
                .content(review.getContent())
                .myLiked(myLiked)
                .totalLikes(review.getLikes())
                .todayLikes(todayLikes)
                .rank(rank)
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
