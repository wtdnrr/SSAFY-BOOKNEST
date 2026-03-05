package com.ssafy.booknest.domain.book.dto.response.recommendation;

import lombok.*;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TagBookResult {

    private String description;
    private List<TagBookResponse> books;

    public static TagBookResult of(List<TagBookResponse> tagBookResponses) {
        if (tagBookResponses == null || tagBookResponses.isEmpty()) {
            return new TagBookResult("랜덤 태그 추천 도서입니다.", List.of());
        }

        String tag = tagBookResponses.get(0).getTag();
        String description = "‘#" + tag + "’ 도서로 떠나는 여행";

        return new TagBookResult(description, tagBookResponses);
    }
}
