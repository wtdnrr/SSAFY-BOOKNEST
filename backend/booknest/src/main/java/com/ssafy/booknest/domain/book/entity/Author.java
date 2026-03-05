package com.ssafy.booknest.domain.book.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.util.List;

@Entity
@Table(name = "Author")
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Author {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name="name" , columnDefinition = "TEXT")
    private String name;

    @Column(name="image_url" , columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name="author_score", columnDefinition = "INT DEFAULT 0")
    private Integer authorScore = 0;

    @OneToMany(mappedBy = "author", fetch = FetchType.LAZY)
    private List<BookAuthor> bookAuthors;

}
