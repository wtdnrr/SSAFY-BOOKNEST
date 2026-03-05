package com.ssafy.booknest.domain.book.entity.recommendation;

import com.ssafy.booknest.domain.book.entity.Book;
import com.ssafy.booknest.global.common.Entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "critic_book")
@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class CriticBook extends BaseEntity {

    @Column(name = "critic_name", length = 20, nullable = false)
    private String criticName;

    @Column(name = "endorsement", columnDefinition = "TEXT")
    private String endorsement;

    @Column(name = "rank")
    private Integer rank;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

}
