package com.ssafy.booknest.domain.nest.repository;

import com.ssafy.booknest.domain.nest.entity.TodayBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TodayBookRepository extends JpaRepository<TodayBook, Integer> {
}
