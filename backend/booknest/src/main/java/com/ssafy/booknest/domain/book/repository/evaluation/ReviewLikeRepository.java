package com.ssafy.booknest.domain.book.repository.evaluation;

import com.ssafy.booknest.domain.book.entity.evaluation.Review;
import com.ssafy.booknest.domain.book.entity.evaluation.ReviewLike;
import com.ssafy.booknest.domain.user.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Integer> {

    // 특정 유저가 해당 한줄평을 남겼는지 여부
    boolean existsByUserAndReview(User user, Review review);

    // 특정 유저의 해당 한줄평에 좋아요
    Optional<ReviewLike> findByUserAndReview(User user, Review review);

    // 오늘 좋아요 많이 받은 한줄평 3개 조회
    @Query("SELECT rl.review.id, COUNT(rl.id) " +
            "FROM ReviewLike rl " +
            "WHERE rl.createdAt >= :start AND rl.createdAt < :end " +
            "GROUP BY rl.review.id " +
            "ORDER BY COUNT(rl.id) DESC")
    List<Object[]> findTop3ReviewIdsLikedToday(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable
    );

}
