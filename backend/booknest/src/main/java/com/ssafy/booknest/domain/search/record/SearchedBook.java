package com.ssafy.booknest.domain.search.record;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.util.List;

@Document(indexName = "book")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class SearchedBook {

    @Id
    @JsonProperty("book_id")
    private Integer bookId;

    @Field(type = FieldType.Text)
    private String title;

    @Field(type = FieldType.Keyword, name = "image_url")
    @JsonProperty("image_url")
    private String imageURL;

    @Field(type = FieldType.Text)
    private List<String> authors;

    @Field(type = FieldType.Keyword)
    private List<String> tags;
}
