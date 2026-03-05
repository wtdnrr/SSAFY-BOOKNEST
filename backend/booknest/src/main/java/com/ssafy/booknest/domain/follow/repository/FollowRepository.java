package com.ssafy.booknest.domain.follow.repository;

import com.ssafy.booknest.domain.follow.entity.Follow;
import com.ssafy.booknest.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Integer> {

    // 언팔로우
    void deleteByFollowerAndFollowing(User follower, User following);

    // 특정 사용자를 팔로우하는 사람(팔로워) 수 조회
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.following.id = :userId")
    Integer countFollowers(@Param("userId") Integer userId);

    // 특정 사용자가 팔로우하는 사람(팔로잉) 수 조회
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.follower.id = :userId")
    Integer countFollowings(@Param("userId") Integer userId);

    // 팔로잉 목록 조회
    @Query("SELECT f.following FROM Follow f WHERE f.follower.id = :userId")
    Page<User> findFollowingUsers(@Param("userId") Integer userId, Pageable pageable);

    // 팔로우 목록 조회
    @Query("SELECT f.follower FROM Follow f WHERE f.following.id = :userId")
    Page<User> findFollwerUsers(@Param("userId") Integer userId, Pageable pageable);

    // 팔로우 여부 조회
    boolean existsByFollowerIdAndFollowingId(Integer followerId, Integer followingId);

    // 팔로잉유저 Id 목록 조회
    @Query("SELECT f.following.id FROM Follow f WHERE f.follower.id = :followerId AND f.following.id IN :followingIds")
    List<Integer> findFollowingIds(@Param("followerId") Integer followerId, @Param("followingIds") List<Integer> followingIds);

    // 특정 유저가 팔로우하거나 팔로우당한 모든 관계를 삭제
    @Modifying
    @Query("DELETE FROM Follow f WHERE f.follower.id = :userId OR f.following.id = :userId")
    void deleteAllByUserId(@Param("userId") Integer userId);
}
