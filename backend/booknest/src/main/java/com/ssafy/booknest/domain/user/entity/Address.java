package com.ssafy.booknest.domain.user.entity;

import com.ssafy.booknest.global.common.Entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "address")
@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Address extends BaseEntity {

    @Column(name = "road_address", nullable = false)
    private String roadAddress;

    @Column(name = "old_address", nullable = false)
    private String oldAddress;

    @Column(name = "zipcode", nullable = false, length = 10)
    private String zipcode;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "district", nullable = false, length = 100)
    private String district;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id")
    private User user;

    public void updateAddress(String roadAddress, String oldAddress, String zipcode, String city, String district) {
        this.roadAddress = roadAddress;
        this.oldAddress = oldAddress;
        this.zipcode = zipcode;
        this.city = city;
        this.district = district;
    }
}