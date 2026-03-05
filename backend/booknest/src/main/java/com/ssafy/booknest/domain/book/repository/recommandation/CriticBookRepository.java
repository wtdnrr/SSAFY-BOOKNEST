package com.ssafy.booknest.domain.book.repository.recommandation;

import com.ssafy.booknest.domain.book.entity.recommendation.CriticBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CriticBookRepository extends JpaRepository<CriticBook, Integer> {

    // 평론가의 추천책 가져오기
    @Query("SELECT cb FROM CriticBook cb " +
            "JOIN FETCH cb.book b " +
            "LEFT JOIN FETCH b.bookAuthors ba " +
            "LEFT JOIN FETCH ba.author " +
            "WHERE cb.criticName = :criticName")
    List<CriticBook> findByCriticNameWithBookAndAuthors(@Param("criticName") String criticName);


    // 평론가 테이블의 모든 평론가 이름 가져오기 (랜덤 돌리기 위해)
    @Query("SELECT DISTINCT c.criticName FROM CriticBook c")
    List<String> findAllCriticNames();
}
