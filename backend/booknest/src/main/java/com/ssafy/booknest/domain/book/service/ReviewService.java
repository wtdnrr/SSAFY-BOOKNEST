package com.ssafy.booknest.domain.book.service;

import com.ssafy.booknest.domain.book.dto.request.ReviewRequest;
import com.ssafy.booknest.domain.book.dto.response.evaluation.BestReviewResponse;
import com.ssafy.booknest.domain.book.dto.response.evaluation.UserReviewResponse;
import com.ssafy.booknest.domain.book.entity.*;
import com.ssafy.booknest.domain.book.entity.evaluation.Rating;
import com.ssafy.booknest.domain.book.entity.evaluation.Review;
import com.ssafy.booknest.domain.book.entity.evaluation.ReviewLike;
import com.ssafy.booknest.domain.book.repository.BookRepository;
import com.ssafy.booknest.domain.book.repository.evaluation.RatingRepository;
import com.ssafy.booknest.domain.book.repository.evaluation.ReviewLikeRepository;
import com.ssafy.booknest.domain.book.repository.evaluation.ReviewRepository;
import com.ssafy.booknest.domain.user.entity.User;
import com.ssafy.booknest.domain.user.repository.UserRepository;
import com.ssafy.booknest.global.common.CustomPage;
import com.ssafy.booknest.global.error.ErrorCode;
import com.ssafy.booknest.global.error.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final RatingRepository ratingRepository;
    private final ReviewLikeRepository reviewLikeRepository;

    // 한줄평 등록
    @Transactional
    public void saveReview(Integer userId, Integer bookId, ReviewRequest dto) {
        // 입력값 검증 (Fail-Fast)
        if (dto.getContent() == null || dto.getContent().isBlank()) {
            throw new CustomException(ErrorCode.EMPTY_REVIEW_CONTENT);
        }

        // 중복 체크
        if (reviewRepository.existsByUserIdAndBookId(userId, bookId)) {
            throw new CustomException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        // 필수 객체 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new CustomException(ErrorCode.BOOK_NOT_FOUND));

        // 평점이 있으면 포함해서 빌더에 설정
        Optional<Rating> ratingOptional = ratingRepository.getRatingByUserIdAndBookId(userId, bookId);

        Review review = Review.builder()
                .user(user)
                .book(book)
                .content(dto.getContent())
                .rating(ratingOptional.map(Rating::getRating).orElse(null))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        reviewRepository.save(review);
    }



    // 한줄평 수정
    @Transactional
    public void updateReview(Integer userId, Integer reviewId, ReviewRequest dto) {
        if (dto.getContent() == null || dto.getContent().isBlank()) {
            throw new CustomException(ErrorCode.EMPTY_REVIEW_CONTENT);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new CustomException(ErrorCode.REVIEW_NOT_FOUND));

        if (!review.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN_ACCESS);
        }

        review.updateContent(dto.getContent());

    }

    // 한줄평 삭제
    @Transactional
    public void deleteReview(Integer userId, Integer reviewId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new CustomException(ErrorCode.REVIEW_NOT_FOUND));

        // 현재 사용자와 작성자가 다르면 접근 금지
        if (!review.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN_ACCESS);
        }

        reviewRepository.delete(review);
    }


    // 사용자 한줄평 목록
    @Transactional(readOnly = true)
    public CustomPage<UserReviewResponse> getReviews(Integer userId, Integer targetId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (!userRepository.existsById(targetId)) {
            throw new CustomException(ErrorCode.USER_NOT_FOUND);
        }

        Page<Review> reviewPage = reviewRepository.findByUserIdOrderByUpdatedAtDesc(targetId, pageable);
        Page<UserReviewResponse> responsePage = reviewPage.map(UserReviewResponse::of);
        return new CustomPage<>(responsePage);
    }

    // 한줄평 좋아요
    @Transactional
    public void likeReview(Integer userId, Integer reviewId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new CustomException(ErrorCode.REVIEW_NOT_FOUND));

        if (reviewLikeRepository.existsByUserAndReview(user, review)) {
            throw new CustomException(ErrorCode.REVIEW_ALREADY_LIKED);
        }

        reviewLikeRepository.save(
                ReviewLike.builder()
                        .user(user)
                        .review(review)
                        .build()
        );
        review.incrementLikes();
    }

    // 한줄평 좋아요 취소
    @Transactional
    public void unlikeReview(Integer userId, Integer reviewId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new CustomException(ErrorCode.REVIEW_NOT_FOUND));

        ReviewLike reviewLike = reviewLikeRepository.findByUserAndReview(user, review)
                .orElseThrow(() -> new CustomException(ErrorCode.REVIEW_LIKE_NOT_FOUND));

        reviewLikeRepository.delete(reviewLike);
        review.decrementLikes();
    }

    // 오늘의 베스트 리뷰
    @Transactional(readOnly = true)
    public List<BestReviewResponse> getBestReviews(Integer userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = startOfToday.plusDays(1);

        Pageable topThree = PageRequest.of(0, 3);
        List<Object[]> reviewIdAndLikeCountList = reviewLikeRepository.findTop3ReviewIdsLikedToday(startOfToday, endOfToday, topThree);

        // 좋아요 수 매핑 + 순서 유지를 위해 LinkedHashMap 사용
        Map<Integer, Integer> reviewLikeCountMap = new LinkedHashMap<>();
        for (Object[] row : reviewIdAndLikeCountList) {
            Integer reviewId = (Integer) row[0];
            Integer likeCount = ((Long) row[1]).intValue();
            reviewLikeCountMap.put(reviewId, likeCount);
        }

        // 리뷰 ID만 추출
        List<Integer> reviewIds = new ArrayList<>(reviewLikeCountMap.keySet());

        // 리뷰들 조회 → Map으로 저장
        List<Review> reviews = reviewRepository.findAllById(reviewIds);
        Map<Integer, Review> reviewMap = reviews.stream()
                .collect(Collectors.toMap(Review::getId, r -> r));

        // 순서대로 DTO 생성
        List<BestReviewResponse> resultList = new ArrayList<>();
        int rank = 1;
        for (Integer reviewId : reviewIds) {
            Review review = reviewMap.get(reviewId);
            int todayLikes = reviewLikeCountMap.get(reviewId);
            BestReviewResponse response = BestReviewResponse.of(review, userId, todayLikes, rank++);
            resultList.add(response);
        }

        return resultList;
    }
}
