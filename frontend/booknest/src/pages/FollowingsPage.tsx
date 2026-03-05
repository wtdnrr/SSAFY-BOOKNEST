import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "@emotion/styled";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore"; // Add this

interface Following {
  userId: number;
  nickname: string;
  profileURL: string;
  archeType: string;
  totalRatings: number;
  isFollowing: boolean; // Add this
}

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
  gap: 15px;
  cursor: pointer; // 추가
  &:hover {
    // 추가
    background-color: #f5f5f5;
  }
`;

const ProfileImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const FollowButton = styled.button<{ isFollowing: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  background-color: ${(props) => (props.isFollowing ? "#f1f1f1" : "#7bc47f")};
  color: ${(props) => (props.isFollowing ? "#666" : "white")};
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.isFollowing ? "#e1e1e1" : "#6ab36e")};
  }
`;

const FollowingPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [followings, setFollowings] = useState<Following[]>([]);
  const currentUser = useAuthStore((state) => state.user);

  const handleFollowClick = async (e: React.MouseEvent, targetUserId: number) => {
    e.stopPropagation();
    try {
      const targetUser = followings.find((u) => u.userId === targetUserId);
      if (!targetUser) return;

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

      if (targetUser.isFollowing) {
        const response = await api.delete(`/api/follow?targetUserId=${targetUserId}`, { headers });
        if (response.data.success) {
          setFollowings(
            followings.map((user) => (user.userId === targetUserId ? { ...user, isFollowing: false } : user))
          );
        }
      } else {
        const response = await api.post(`/api/follow?targetUserId=${targetUserId}`, {}, { headers });
        if (response.data.success) {
          setFollowings(
            followings.map((user) => (user.userId === targetUserId ? { ...user, isFollowing: true } : user))
          );
        }
      }
    } catch (error) {
      // console.error("팔로우/언팔로우 작업 실패:", error);
    }
  };

  useEffect(() => {
    const fetchFollowings = async () => {
      try {
        const response = await api.get("/api/follow/following", {
          params: {
            targetUserId: userId,
            size: 100,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.data.success) {
          setFollowings(response.data.data.content);
        }
      } catch (error) {
        // console.error("Failed to fetch followings:", error);
      }
    };

    fetchFollowings();
  }, [userId]);

  return (
    <Container>
      <h1>팔로잉 목록</h1>
      {followings.map((following) => (
        <UserCard key={following.userId}>
          <div
            style={{ display: "flex", alignItems: "center", flex: 1, cursor: "pointer" }}
            onClick={() => navigate(`/profile/${following.userId}`)}
          >
            <ProfileImage src={following.profileURL} alt={following.nickname} />
            <UserInfo>
              <h3>{following.nickname}</h3>
              <p>{following.archeType}</p>
              <p>평가 {following.totalRatings}개</p>
            </UserInfo>
          </div>
          {currentUser?.id !== following.userId && (
            <FollowButton isFollowing={following.isFollowing} onClick={(e) => handleFollowClick(e, following.userId)}>
              {following.isFollowing ? "팔로잉" : "팔로우"}
            </FollowButton>
          )}
        </UserCard>
      ))}
    </Container>
  );
};

export default FollowingPage;
