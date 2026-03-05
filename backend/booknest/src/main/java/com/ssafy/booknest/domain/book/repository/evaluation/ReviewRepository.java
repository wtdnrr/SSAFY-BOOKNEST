package com.ssafy.booknest.domain.book.repository.evaluation;

import com.ssafy.booknest.domain.book.entity.Book;
import com.ssafy.booknest.domain.book.entity.evaluation.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {

    // 해당 유저가 해당 도서에 남긴 한줄평
    Optional<Review> findByUserIdAndBookId(Integer userId, Integer bookId);

    // 해당 유저가 해당 도서에 한줄평을 남겼는 지 여부
    boolean existsByUserIdAndBookId(Integer userId, Integer bookId);

    // 가장 최근 수정된 순으로 한줄평 목록 가져오기
    Page<Review> findByUserIdOrderByUpdatedAtDesc(Integer userId, Pageable pageable);

    // 도서 평점 평균
    @Query("SELECT COUNT(r) FROM Review r WHERE r.user.id = :userId")
    Integer countReviews(@Param("userId") Integer userId);

    // 도서 마다 한줄평 목록 가져오기 (내가 쓴 한줄평은 맨 위)
    @Query("""
    SELECT r
    FROM Review r
    WHERE r.book = :book
    ORDER BY
        CASE WHEN r.user.id = :userId THEN 0 ELSE 1 END,   
        r.updatedAt DESC
""")
    Page<Review> findByBookOrderByUserFirst(@Param("book") Book book,
                                            @Param("userId") Integer userId,
                                            Pageable pageable);

}