package com.ssafy.booknest.domain.book.repository.evaluation;

import com.ssafy.booknest.domain.book.entity.Book;
import com.ssafy.booknest.domain.book.entity.evaluation.IgnoredBook;
import com.ssafy.booknest.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IgnoredBookRepository extends JpaRepository<IgnoredBook, Integer> {

    // 이미 유저가 해당 책을 관심없음을 표시했는지
    boolean existsByUserAndBook(User user, Book book);

    // 특정 사용자와 도서에 대한 '관심 없음' 등록 여부 조회
    Optional<IgnoredBook> findByUserAndBook(User user, Book book);

}
