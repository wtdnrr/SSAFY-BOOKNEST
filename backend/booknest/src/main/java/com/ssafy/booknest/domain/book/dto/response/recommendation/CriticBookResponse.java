package com.ssafy.booknest.domain.book.dto.response.recommendation;

import com.ssafy.booknest.domain.book.entity.Book;
import com.ssafy.booknest.domain.book.entity.recommendation.CriticBook;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CriticBookResponse {

    private Integer bookId;
    private String imageUrl;
    private String title;
    private String publishedDate;
    private List<String> authors;
    private String criticName;
    private String endorsement;
    private Integer rank;

    public static CriticBookResponse of(CriticBook criticBook) {
        Book book = criticBook.getBook();
        return CriticBookResponse.builder()
                .bookId(book.getId())
                .imageUrl(book.getImageUrl())
                .title(book.getTitle())
                .publishedDate(book.getPublishedDate())
                .authors(book.getBookAuthors().stream()
                        .map(bookAuthor -> bookAuthor.getAuthor().getName())
                        .collect(Collectors.toList()))
                .criticName(criticBook.getCriticName())
                .endorsement(criticBook.getEndorsement())
                .rank(criticBook.getRank())
                .build();
    }
}
