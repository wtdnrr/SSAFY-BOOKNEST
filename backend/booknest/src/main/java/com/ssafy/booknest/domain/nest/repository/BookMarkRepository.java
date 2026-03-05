package com.ssafy.booknest.domain.nest.repository;

import com.ssafy.booknest.domain.nest.entity.BookMark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookMarkRepository extends JpaRepository<BookMark, Integer> {

    // 둥지 내에 해당 도서가 존재하는지 여부
    boolean existsByNestIdAndBookId(Integer id, Integer bookId);

    // 특정 유저의 둥지에 해당 도서가 찜되어 있는지 여부 확인
    @Query("SELECT COUNT(bm) > 0 FROM BookMark bm " +
            "WHERE bm.book.id = :bookId AND bm.nest.id IN " +
            "(SELECT n.id FROM Nest n WHERE n.user.id = :userId)")
    boolean existsByBookIdAndUserId(@Param("bookId") Integer bookId, @Param("userId") Integer userId);

    // 특정 둥지 안에 특정 도서가 찜되어 있는지 조회
    Optional<BookMark> findByNestIdAndBookId(Integer id, Integer bookId);


}
