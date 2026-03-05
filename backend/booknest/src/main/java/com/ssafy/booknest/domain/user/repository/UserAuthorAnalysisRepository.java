package com.ssafy.booknest.domain.user.repository;

import com.ssafy.booknest.domain.user.entity.User;
import com.ssafy.booknest.domain.user.entity.UserAuthorAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface UserAuthorAnalysisRepository extends JpaRepository<UserAuthorAnalysis, Integer> {

    // 특정 userId에 해당하는 사용자의 선호 작가 이름 목록을 조회합니다.
    @Query("SELECT u.favoriteAuthor FROM UserAuthorAnalysis u WHERE u.userId= :userId")
    List<String> findAuthorNamesByUserId(@Param("userId") Integer userId);

    // 특정 userId에 해당하는 작가 분석 데이터를 모두 조회합니다.
    List<UserAuthorAnalysis> findByUserId(Integer targetUserId);

    // 특정 userId에 해당하는 작가 분석 데이터를 삭제합니다.
    void deleteByUserId(Integer userId);

}
