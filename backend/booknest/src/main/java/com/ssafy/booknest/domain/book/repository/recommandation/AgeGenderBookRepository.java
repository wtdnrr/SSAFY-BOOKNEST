package com.ssafy.booknest.domain.book.repository.recommandation;

import com.ssafy.booknest.domain.book.entity.recommendation.AgeGenderBook;
import com.ssafy.booknest.domain.book.enums.AgeGroup;
import com.ssafy.booknest.domain.user.enums.Gender;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgeGenderBookRepository extends JpaRepository<AgeGenderBook, Integer> {

    // 성별과 나이대로 추천
    List<AgeGenderBook> findByAgeGroupAndGender(AgeGroup ageGroup, Gender gender);

    // 성별에서만 추천
    List<AgeGenderBook> findByGender(Gender gender);

    // 나이대에서만 추천
    List<AgeGenderBook> findByAgeGroup(AgeGroup ageGroup);

    // 성별이나 나이를 입력을 안하면 그냥 테이블에서 랜덤 추천
    @Query(value = "SELECT * FROM age_gender_book ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<AgeGenderBook> findRandomLimit(@Param("limit") int limit);

}