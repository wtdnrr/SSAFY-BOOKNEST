package com.ssafy.booknest.domain.book.repository.recommandation;

import com.ssafy.booknest.domain.book.entity.recommendation.PopularAuthorBook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PopularAuthorBookRepository extends JpaRepository<PopularAuthorBook, Integer> {

    // 인기 작가 도서 순위 목록을 페이지 단위로 조회
    @Query("SELECT p FROM PopularAuthorBook p ORDER BY p.rank ASC")
    Page<PopularAuthorBook> findTopRankedAuthors(Pageable pageable);

}
