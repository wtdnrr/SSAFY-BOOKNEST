package com.ssafy.booknest.domain.book.entity;

import com.ssafy.booknest.domain.book.entity.evaluation.IgnoredBook;
import com.ssafy.booknest.domain.book.entity.evaluation.Review;
import com.ssafy.booknest.domain.book.entity.recommendation.BestSeller;
import com.ssafy.booknest.domain.nest.entity.BookMark;
import com.ssafy.booknest.global.common.Entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;


import java.util.*;
import java.util.stream.Collectors;

@Entity
@Table(name = "book")
@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Book extends BaseEntity {

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "published_date")
    private String publishedDate;

    @Column(name="isbn", length = 20)
    private String isbn;

    @Column(name="publisher", length = 100)
    private String publisher;

    @Column(name="pages")
    private String pages;

    @Column(name="image_url")
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String intro;

    @Column(name="book_index", columnDefinition = "MEDIUMTEXT")
    private String bookIndex;

    @Column(columnDefinition = "TEXT")
    private String publisherReview;

    @Column(name = "total_ratings", columnDefinition = "INT DEFAULT 0")
    private Integer totalRatings = 0;

    @Builder.Default
    @OneToMany(mappedBy = "book", fetch = FetchType.LAZY, orphanRemoval = true)
    private List<BookCategory> bookCategories = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "book", fetch = FetchType.LAZY, orphanRemoval = true)
    private List<BookAuthor> bookAuthors = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "book", fetch = FetchType.LAZY, orphanRemoval = true)
    private List<BookTag> bookTags = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "book", fetch = FetchType.LAZY, orphanRemoval = true)
    private List<BestSeller> bestSellers = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "book", fetch = FetchType.LAZY, orphanRemoval = true)
    private List<Review> reviews = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "book", fetch = FetchType.LAZY, orphanRemoval = true)
    private List<IgnoredBook> ignoredBooks = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "book", fetch = FetchType.LAZY, orphanRemoval = true)
    private List<BookMark> BookMarks = new ArrayList<>();

    public String getAuthors() {
        return bookAuthors.stream()
                .map(bookAuthor -> bookAuthor.getAuthor().getName()) // 저자 이름 가져오기
                .collect(Collectors.joining(", "));
    }

    public List<String> getTagNames() {
        return Optional.ofNullable(this.bookTags)
                .orElse(Collections.emptyList())
                .stream()
                .map(BookTag::getTag)
                .filter(Objects::nonNull)
                .map(Tag::getName)
                .filter(Objects::nonNull)
                .toList();
    }

}
