package com.ssafy.booknest.domain.user.repository.tag;

import com.ssafy.booknest.domain.user.entity.User;
import com.ssafy.booknest.domain.user.entity.tag.UserTagAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserTagAnalysisRepository extends JpaRepository<UserTagAnalysis, Integer> {


    void deleteByUserId(Integer userId);

    // 유저 가장 좋아하는 태그 조회
    @Query("SELECT u.favoriteTag FROM UserTagAnalysis u WHERE u.userId = :userId")
    List<String> findTopTagsByUserId(@Param("userId") Integer userId);


}
