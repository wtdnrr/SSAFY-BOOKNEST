package com.ssafy.booknest.domain.nest.repository;

import com.ssafy.booknest.domain.nest.entity.BookNest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookNestRepository extends JpaRepository<BookNest, Integer> {

    // 특정 둥지에 있는 도서를 생성일 순으로 내림차순 정렬해 페이징 조회
    @Query("SELECT bn FROM BookNest bn WHERE bn.nest.id = :nestId ORDER BY bn.createdAt DESC")
    Page<BookNest> findByNestIdSorted(@Param("nestId") Integer nestId, Pageable pageable);

    // 특정 둥지에서 특정 도서에 해당하는 BookNest 엔티티를 조회
    Optional<BookNest> findByNestIdAndBookId(Integer id, Integer bookId);

    // 해당 사용자의 둥지에 해당 책이 있는지 여부
    boolean existsByNestUserIdAndBookId(Integer userId, Integer bookId);

}