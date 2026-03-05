package com.ssafy.booknest.domain.book.dto.response.recommendation;

import com.ssafy.booknest.domain.book.enums.AgeGroup;
import com.ssafy.booknest.domain.user.entity.User;
import com.ssafy.booknest.domain.user.enums.Gender;
import com.ssafy.booknest.domain.user.repository.UserRepository;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AgeGenderBookResult {

    private String description;
    private List<AgeGenderBookResponse> books;

    public static AgeGenderBookResult of(Integer userId, List<AgeGenderBookResponse> responses, UserRepository userRepository) {
        if (responses == null || responses.isEmpty()) {
            return new AgeGenderBookResult("책 목록 리스트를 가져오지 못했습니다.", List.of());
        }

        User user = userRepository.findById(userId).orElse(null);

        AgeGroup ageGroup = null;
        Gender gender = null;

        if (user != null) {
            gender = user.getGender();

            String birthdateStr = user.getBirthdate();
            if (birthdateStr != null && birthdateStr.length() >= 4) {
                try {
                    int birthYear = Integer.parseInt(birthdateStr.substring(0, 4));
                    int age = LocalDate.now().getYear() - birthYear + 1;
                    ageGroup = AgeGroup.fromAge(age);
                } catch (NumberFormatException ignored) {
                }
            }
        }

        String description = generateDescription(ageGroup, gender);
        return new AgeGenderBookResult(description, responses);
    }

    private static String generateDescription(AgeGroup ageGroup, Gender gender) {
        boolean isValidGender = gender == Gender.M || gender == Gender.F;

        if (ageGroup != null && isValidGender) {
            return ageGroup.getLabel() + " " + convertGenderToKorean(gender) + "이 좋아하는 도서";
        } else if (ageGroup != null) {
            return ageGroup.getLabel() + " 연령대가 좋아하는 도서";
        } else if (isValidGender) {
            return convertGenderToKorean(gender) + "이 좋아하는 도서";
        } else {
            return "전 세대와 성별을 아우르는 인기 도서";
        }
    }

    private static String convertGenderToKorean(Gender gender) {
        return switch (gender) {
            case M -> "남성";
            case F -> "여성";
            case O, N -> "";
        };
    }
}
