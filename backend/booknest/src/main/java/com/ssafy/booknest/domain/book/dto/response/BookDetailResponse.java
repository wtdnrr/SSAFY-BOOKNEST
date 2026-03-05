package com.ssafy.booknest.domain.book.dto.response;

import com.ssafy.booknest.domain.book.dto.response.evaluation.ReviewResponse;
import com.ssafy.booknest.domain.book.entity.Book;
import com.ssafy.booknest.global.common.CustomPage;
import lombok.*;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookDetailResponse {

    private int bookId;
    private Boolean isBookMarked;
    private Double avgRating;
    private String title;
    private String publishedDate;
    private String isbn;
    private String publisher;
    private String pages;
    private String imageUrl;
    private String intro;
    private String index;
    private String publisherReview;

    private List<String> authors;
    private List<String> tags;
    private List<String> categories;

    private CustomPage<ReviewResponse> reviews;

    public static BookDetailResponse of(Book book, Double avgRating, Page<ReviewResponse> reviewPage, Boolean isBookMarked) {

        return BookDetailResponse.builder()
                .bookId(book.getId())
                .isBookMarked(isBookMarked)
                .avgRating(avgRating)
                .title(book.getTitle())
                .publishedDate(book.getPublishedDate())
                .isbn(book.getIsbn())
                .publisher(book.getPublisher())
                .pages(book.getPages())
                .imageUrl(book.getImageUrl())
                .intro(book.getIntro())
                .index(book.getBookIndex())
                .publisherReview(book.getPublisherReview())
                .authors(book.getBookAuthors().stream()
                        .map(bookAuthor -> bookAuthor.getAuthor().getName())
                        .collect(Collectors.toList()))
                .tags(book.getBookTags().stream()
                        .map(bookTag -> bookTag.getTag().getName())
                        .collect(Collectors.toList()))
                .categories(book.getBookCategories().stream()
                        .map(bookCategory -> bookCategory.getCategory().getName())
                        .collect(Collectors.toList()))
                .reviews(new CustomPage<>(reviewPage))
                .build();
    }
}
