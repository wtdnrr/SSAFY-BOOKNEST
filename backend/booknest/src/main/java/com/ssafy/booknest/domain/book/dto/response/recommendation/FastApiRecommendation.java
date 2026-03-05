package com.ssafy.booknest.domain.book.dto.response.recommendation;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;


@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FastApiRecommendation {

    @JsonProperty("book_id")
    private Integer bookId;
    @JsonProperty("image_url")
    private String imageUrl;
    @JsonProperty("publisher_review")
    private String publisherReview;
    private String title;
    private String intro;
    private String authors;
    private String tags;

}
