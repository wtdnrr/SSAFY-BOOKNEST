package com.ssafy.booknest.domain.book.dto.response.evaluation;

import com.ssafy.booknest.domain.book.entity.evaluation.Review;
import com.ssafy.booknest.domain.user.entity.User;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {

    private int reviewId;
    private String profileURL;
    private Double rating;
    private String reviewerName;
    private String content;
    private Boolean myLiked;
    private int likes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ReviewResponse of(Review review, Integer currentUserId) {
        User reviewer = review.getUser();

        // User가 없을 경우 기본 처리
        String profileURl;
        String reviewerName;
        if(reviewer.getDeletedAt() == null){
            profileURl = reviewer.getProfileUrl();
            reviewerName = reviewer.getNickname();
        } else{
            profileURl = "https://res.cloudinary.com/gominsushi/image/upload/v1744269066/ChatGPT_Image_2025%EB%85%84_4%EC%9B%94_10%EC%9D%BC_%EC%98%A4%ED%9B%84_04_07_47_bwil4d.png";
            reviewerName = "탈퇴한 유저";
        }

        boolean myLiked = review.getReviewLikes().stream()
                .anyMatch(like -> like.getUser().getId().equals(currentUserId));

        return ReviewResponse.builder()
                .reviewId(review.getId())
                .profileURL(profileURl)
                .rating(review.getRating())
                .reviewerName(reviewerName)
                .content(review.getContent())
                .myLiked(myLiked)
                .likes(review.getLikes())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }

}
