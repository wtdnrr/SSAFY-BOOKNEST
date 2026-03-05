package com.ssafy.booknest.domain.user.repository;

import com.ssafy.booknest.domain.user.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Integer> {

    // 특정 userId에 해당하는 주소 정보를 Optional로 조회합니다.
    Optional<Address> findByUserId(Integer userId);
}
