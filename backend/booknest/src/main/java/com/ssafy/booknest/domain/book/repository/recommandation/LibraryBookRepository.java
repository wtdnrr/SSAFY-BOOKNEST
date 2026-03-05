package com.ssafy.booknest.domain.book.repository.recommandation;

import com.ssafy.booknest.domain.book.entity.recommendation.LibraryBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LibraryBookRepository extends JpaRepository<LibraryBook, Integer> {

    // 특정 년도에 해당하는 도서 순위 목록 조회
    @Query("SELECT lb FROM LibraryBook lb WHERE lb.year = :year ORDER BY lb.rank ASC")
    List<LibraryBook> findTopByYearOrderByRank(@Param("year") Integer year);


}
