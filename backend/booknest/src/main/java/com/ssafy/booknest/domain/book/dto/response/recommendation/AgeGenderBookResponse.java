package com.ssafy.booknest.domain.book.dto.response.recommendation;

import com.ssafy.booknest.domain.book.entity.recommendation.AgeGenderBook;
import com.ssafy.booknest.domain.book.enums.AgeGroup;
import com.ssafy.booknest.domain.user.enums.Gender;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgeGenderBookResponse {

    private int bookId;
    private String title;
    private String imageUrl;
    private AgeGroup ageGroup;
    private Gender gender;
    private String publishedDate;
    private List<String> authors;

    public static AgeGenderBookResponse of(AgeGenderBook entity) {
        return AgeGenderBookResponse.builder()
                .bookId(entity.getBook().getId())
                .title(entity.getBook().getTitle())
                .imageUrl(entity.getBook().getImageUrl())
                .ageGroup(entity.getAgeGroup())
                .gender(entity.getGender())
                .publishedDate(entity.getBook().getPublishedDate())
                .authors(entity.getBook().getBookAuthors().stream()
                        .map(bookAuthor -> bookAuthor.getAuthor().getName())
                        .collect(Collectors.toList()))
                .build();
    }
}
