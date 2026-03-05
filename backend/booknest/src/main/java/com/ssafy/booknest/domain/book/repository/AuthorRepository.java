package com.ssafy.booknest.domain.book.repository;

import com.ssafy.booknest.domain.book.entity.Author;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuthorRepository extends JpaRepository<Author, Integer> {

    // 작가 이름 목록 조회
    Optional<Author> findByName(String name);
}
