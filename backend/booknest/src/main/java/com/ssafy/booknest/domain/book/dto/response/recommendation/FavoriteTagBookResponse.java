package com.ssafy.booknest.domain.book.dto.response.recommendation;

import com.ssafy.booknest.domain.book.entity.Book;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteTagBookResponse {

    private int bookId;
    private String title;
    private String imageUrl;
    private String publishedDate;
    private List<String> authors;
    private String tag;
    private List<String> categories;

    public static FavoriteTagBookResponse of(Book book, String tag) {
        return FavoriteTagBookResponse.builder()
                .bookId(book.getId())
                .title(book.getTitle())
                .imageUrl(book.getImageUrl())
                .publishedDate(book.getPublishedDate())
                .authors(book.getBookAuthors().stream()
                        .map(bookAuthor -> bookAuthor.getAuthor().getName())
                        .collect(Collectors.toList()))
                .tag(tag)
                .categories(book.getBookCategories().stream()
                        .map(bookCategory -> bookCategory.getCategory().getName())
                        .collect(Collectors.toList()))
                .build();
    }
}
