package com.ssafy.booknest.domain.book.repository;

import com.ssafy.booknest.domain.book.entity.recommendation.BestSeller;
import com.ssafy.booknest.domain.book.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Integer> {

    // 베스트 셀러
    @Query(value = "SELECT * FROM best_seller LIMIT 15", nativeQuery = true)
    List<BestSeller> findBestSellers();

    // 책 평균 평가 점수 구하기
    @Query("SELECT ROUND(AVG(r.rating), 2) FROM Rating r WHERE r.book.id = :bookId")
    Optional<Double> findAverageRatingByBookId(@Param("bookId") int bookId);

    // 특정 도서와 관련 한줄평 조회
    @Query("""
    SELECT b FROM Book b
    LEFT JOIN FETCH b.reviews r
    LEFT JOIN FETCH r.user
    WHERE b.id = :bookId
""")
    Optional<Book> findBookDetailById(@Param("bookId") Integer bookId);

    // 화제의 작가의 도서들 조회
    @Query("""
        SELECT b FROM Book b
        JOIN b.bookAuthors ba
        JOIN ba.author a
        WHERE a.name LIKE %:author%
        ORDER BY b.createdAt DESC
    """)
    List<Book> findBooksByAuthorNameLike(@Param("author") String author, Pageable pageable);


    // 평가가 등록된 도서 중 제외할 ID 리스트를 뺀 후, 평점 개수 기준으로 내림차순 정렬하여 페이징 조회
    @Query("""
    SELECT b 
    FROM Book b 
    WHERE b.id NOT IN :excludedIds AND
          (SELECT COUNT(r) FROM Rating r WHERE r.book = b) > 0
    ORDER BY (SELECT COUNT(r) FROM Rating r WHERE r.book = b) DESC
    """)
    Page<Book> findMostRatedBooksExcluding(@Param("excludedIds") List<Integer> excludedIds, Pageable pageable);

    // 제외할 ID 리스트를 제외한 도서 중 최근 출간일 순으로 정렬하여 페이징 조회
    @Query("SELECT b FROM Book b WHERE b.id NOT IN :excludedIds ORDER BY b.publishedDate DESC")
    Page<Book> findRecentBooksExcluding(@Param("excludedIds") List<Integer> excludedIds, Pageable pageable);

    // 제외할 ID 리스트를 제외한 도서 중 무작위 순서로 페이징 조회
    @Query("SELECT b FROM Book b WHERE b.id NOT IN :excludedIds ORDER BY function('RAND')")
    Page<Book> findRandomBooksExcluding(@Param("excludedIds") List<Integer> excludedIds, Pageable pageable);


    // 주어진 태그를 가진 도서들 중 무작위로 선택하여 일정 개수만 조회 (태그별 인기 도서 부족 시 대체용)
    @Query("""
    SELECT b FROM Book b
    JOIN b.bookTags bt
    JOIN bt.tag t
    WHERE t.name = :tag
    ORDER BY function('RAND')
""")
    List<Book> findRandomBooksByTag(@Param("tag") String tag, Pageable pageable);


    // 지정된 카테고리 이름에 해당하는 도서 중 랜덤으로 도서 목록 조회 (페이징 지원)
    @Query("""
    SELECT b FROM Book b
    JOIN b.bookCategories bc
    JOIN bc.category c
    WHERE c.name = :category
    ORDER BY function('RAND')
""")
    List<Book> findRandomBooksByCategory(@Param("category") String category, Pageable pageable);

}