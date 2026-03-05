package com.ssafy.booknest.domain.search.record;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookEval {
    @JsonProperty("book_id")
    private Integer bookId;
    private String title;
    @JsonProperty("image_url")
    private String imageUrl;
    @JsonProperty("published_date")
    private String publishedDate;
    private List<String> authors;
    private Integer totalRatings;
}