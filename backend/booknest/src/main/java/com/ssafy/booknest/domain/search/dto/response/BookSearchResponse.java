package com.ssafy.booknest.domain.search.dto.response;

import com.ssafy.booknest.domain.search.record.SearchedBook;
import lombok.Builder;

import java.util.List;

@Builder
public record BookSearchResponse(
        Integer bookId,
        String title,
        String imageURL,
        List<String> authors,
        List<String> tags
) {
    public static BookSearchResponse of(SearchedBook book) {
        return BookSearchResponse.builder()
                .bookId(book.getBookId())
                .title(book.getTitle())
                .imageURL(book.getImageURL())
                .authors(book.getAuthors())
                .tags(book.getTags())
                .build();
    }
}