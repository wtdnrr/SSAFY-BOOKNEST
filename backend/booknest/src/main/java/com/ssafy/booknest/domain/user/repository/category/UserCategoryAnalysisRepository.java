package com.ssafy.booknest.domain.user.repository.category;

import com.ssafy.booknest.domain.user.entity.User;
import com.ssafy.booknest.domain.user.entity.category.UserCategoryAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserCategoryAnalysisRepository extends JpaRepository<UserCategoryAnalysis, Integer> {

    // 특정 userId를 가진 사용자의 카테고리 분석 데이터를 삭제합니다.
    void deleteByUserId(Integer userId);

    // 특정 userId에 해당하는 사용자의 선호 카테고리 이름 목록을 조회합니다.
    @Query("SELECT u.favoriteCategory FROM UserCategoryAnalysis u WHERE u.userId = :userId")
    List<String> findTopCategoryNamesByUserId(@Param("userId") Integer userId);

}
