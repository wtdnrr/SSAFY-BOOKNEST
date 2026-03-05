package com.ssafy.booknest.domain.user.repository.tag;

import com.ssafy.booknest.domain.user.entity.User;
import com.ssafy.booknest.domain.user.entity.tag.UserTagRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserTagRecommendationRepository extends JpaRepository<UserTagRecommendation, Integer> {

    List<UserTagRecommendation> findByUserId(Integer userId);


}
