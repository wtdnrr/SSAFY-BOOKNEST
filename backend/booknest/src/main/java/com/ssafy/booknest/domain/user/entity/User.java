package com.ssafy.booknest.domain.user.entity;

import com.ssafy.booknest.domain.book.entity.evaluation.IgnoredBook;
import com.ssafy.booknest.domain.nest.entity.TodayBook;
import com.ssafy.booknest.domain.follow.entity.Follow;
import com.ssafy.booknest.domain.nest.entity.Nest;
import com.ssafy.booknest.domain.user.entity.category.UserCategoryAnalysis;
import com.ssafy.booknest.domain.user.entity.tag.UserTagAnalysis;
import com.ssafy.booknest.domain.user.enums.Gender;
import com.ssafy.booknest.domain.user.enums.Provider;
import com.ssafy.booknest.global.common.Entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.springframework.data.annotation.LastModifiedDate;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user")
@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@SQLDelete(sql = "UPDATE user SET deleted_at = DATE_ADD(NOW(), INTERVAL 9 HOUR) WHERE id = ?")
//@Where(clause = "deleted_at IS NULL")
public class User extends BaseEntity {

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private Provider provider;

    @Column(name = "provider_id", nullable = false)
    private String providerId;

    @Column(name = "archetype", nullable = false)
    private String archeType;

    @Column(length = 50)
    private String nickname;

    @Column
    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(length = 10)
    private String birthdate;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "profile_url")
    private String profileUrl;

    @OneToOne(mappedBy = "user")
    private Nest nest;

    @OneToOne(mappedBy = "user")
    private TodayBook todayBook;

    @OneToOne(mappedBy = "user")
    private Address address;

    @Builder.Default
    @OneToMany(mappedBy = "follower", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Follow> followingUsers = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "following", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Follow> followers = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<IgnoredBook> ignoredBooks = new ArrayList<>();

    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }

    public void updateGender(Gender gender) {
        this.gender = gender;
    }

    public void updateBirthdate(String birthdate) {
        this.birthdate = birthdate;
    }

    public void updateDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }

    public void updatedProfileUrl(String profileUrl) { this.profileUrl = profileUrl; }

    public void setAddress(Address address) {
        this.address = address;
    }

}
