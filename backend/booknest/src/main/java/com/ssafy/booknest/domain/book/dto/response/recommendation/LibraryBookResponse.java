package com.ssafy.booknest.domain.book.dto.response.recommendation;

import com.ssafy.booknest.domain.book.entity.recommendation.LibraryBook;
import com.ssafy.booknest.domain.book.entity.Book;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@AllArgsConstructor
public class LibraryBookResponse {

    private String imageUrl;
    private int bookId;
    private String title;
    private String publishedDate;
    private List<String> authors;
    private int rank;
    private int year;

    public static LibraryBookResponse of(LibraryBook libraryBook) {
        Book book = libraryBook.getBook();

        return LibraryBookResponse.builder()
                .bookId(book.getId())
                .title(book.getTitle())
                .imageUrl(book.getImageUrl())
                .publishedDate(book.getPublishedDate())
                .authors(book.getBookAuthors().stream()
                        .map(bookAuthor -> bookAuthor.getAuthor().getName())
                        .collect(Collectors.toList()))
                .rank(libraryBook.getRank())
                .year(libraryBook.getYear())
                .build();
    }
}
