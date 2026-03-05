package com.ssafy.booknest.domain.book.repository;

import com.ssafy.booknest.domain.book.entity.BookTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookTagRepository extends JpaRepository<BookTag, Integer> {

}
