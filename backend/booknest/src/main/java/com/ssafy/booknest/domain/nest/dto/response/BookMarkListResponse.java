package com.ssafy.booknest.domain.nest.dto.response;

import com.ssafy.booknest.domain.book.entity.Book;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@AllArgsConstructor
public class BookMarkListResponse {

    private Integer bookId;
    private String title;
    private List<String> authors;
    private String imageUrl;
    private LocalDateTime createdAt;

    public static BookMarkListResponse of(Book book, LocalDateTime createdAt) {
        return BookMarkListResponse.builder()
                .bookId(book.getId())
                .title(book.getTitle())
                .authors(
                        book.getBookAuthors().stream()
                                .map(bookAuthor -> bookAuthor.getAuthor().getName())
                                .collect(Collectors.toList())
                )
                .imageUrl(book.getImageUrl())
                .createdAt(createdAt)
                .build();
    }
}
