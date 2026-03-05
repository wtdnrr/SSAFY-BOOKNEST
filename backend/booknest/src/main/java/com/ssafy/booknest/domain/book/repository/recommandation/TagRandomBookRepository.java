package com.ssafy.booknest.domain.book.repository.recommandation;

import com.ssafy.booknest.domain.book.entity.recommendation.TagRandomBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TagRandomBookRepository extends JpaRepository<TagRandomBook,Integer> {

    // 태그 목록 전체 가져오기
    @Query(value = "SELECT DISTINCT tag FROM tag_random_book", nativeQuery = true)
    List<String> findAllTags();

    // 태그에 해당하는 책 중 랜덤 15권
    @Query(value = "SELECT * FROM tag_random_book WHERE tag = :tag ORDER BY RAND() LIMIT 15", nativeQuery = true)
    List<TagRandomBook> findRandomBooksByTag(@Param("tag") String tag);
}
