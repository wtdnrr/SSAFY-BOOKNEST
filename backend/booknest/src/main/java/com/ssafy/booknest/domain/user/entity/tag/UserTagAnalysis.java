package com.ssafy.booknest.domain.user.entity.tag;

import com.ssafy.booknest.domain.book.entity.Book;
import com.ssafy.booknest.domain.user.entity.User;
import com.ssafy.booknest.global.common.Entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_tag_analysis")
@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class UserTagAnalysis extends BaseEntity {

    @Column(name = "favorite_tag")
    private String favoriteTag;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void update(String favoriteTag) {
        this.favoriteTag = favoriteTag;
    }
}
