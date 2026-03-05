package com.ssafy.booknest.domain.book.dto.response.recommendation;

import com.ssafy.booknest.domain.book.entity.Book;

import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TagBookResponse {

    private int bookId;
    private String title;
    private String imageUrl;
    private String publishedDate;
    private List<String> authors;
    private String tag;

    public static TagBookResponse of(Book book, String tag) {
        return TagBookResponse.builder()
                .bookId(book.getId())
                .title(book.getTitle())
                .imageUrl(book.getImageUrl())
                .publishedDate(book.getPublishedDate())
                .authors(book.getBookAuthors().stream()
                        .map(bookAuthor -> bookAuthor.getAuthor().getName())
                        .collect(Collectors.toList()))
                .tag(tag)
                .build();
    }
}
