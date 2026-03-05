import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "@emotion/styled";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore"; // Add this at the top

interface Follower {
  userId: number;
  nickname: string;
  profileURL: string;
  archeType: string;
  totalRatings: number;
  isFollowing: boolean; // 추가
}

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
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

const UserCard = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
  gap: 15px;
  &:hover {
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

const FollowersPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const currentUser = useAuthStore((state) => state.user); // Add this

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const response = await api.get("/api/follow/follower", {
          params: {
            targetUserId: userId,
            size: 100,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.data.success) {
          setFollowers(response.data.data.content);
        }
      } catch (error) {
        // console.error("팔로워 목록 가져오기 실패:", error);
      }
    };

    if (userId) {
      fetchFollowers();
    }
  }, [userId]);

  const handleFollowClick = async (
    e: React.MouseEvent,
    targetUserId: number
  ) => {
    e.stopPropagation();
    try {
      const targetUser = followers.find((u) => u.userId === targetUserId);
      if (!targetUser) return;

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

      if (targetUser.isFollowing) {
        // 언팔로우 요청
        const response = await api.delete(
          `/api/follow?targetUserId=${targetUserId}`,
          { headers }
        );
        if (response.data.success) {
          setFollowers(
            followers.map((user) =>
              user.userId === targetUserId
                ? { ...user, isFollowing: false }
                : user
            )
          );
        }
      } else {
        // 팔로우 요청
        const response = await api.post(
          `/api/follow?targetUserId=${targetUserId}`,
          {},
          { headers }
        );
        if (response.data.success) {
          setFollowers(
            followers.map((user) =>
              user.userId === targetUserId
                ? { ...user, isFollowing: true }
                : user
            )
          );
        }
      }
    } catch (error) {
      // console.error("팔로우/언팔로우 작업 실패:", error);
    }
  };

  return (
    <Container>
      <h1>팔로워 목록</h1>
      {followers.map((follower) => (
        <UserCard key={follower.userId}>
          <div
            onClick={() => navigate(`/profile/${follower.userId}`)}
            style={{ cursor: "pointer", display: "flex", flex: 1, gap: "15px" }}
          >
            <ProfileImage src={follower.profileURL} alt={follower.nickname} />
            <UserInfo>
              <h3>{follower.nickname}</h3>
              <p>{follower.archeType}</p>
              <p>평가 {follower.totalRatings}개</p>
            </UserInfo>
          </div>
          {currentUser?.id !== follower.userId && (
            <FollowButton
              isFollowing={follower.isFollowing}
              onClick={(e) => handleFollowClick(e, follower.userId)}
            >
              {follower.isFollowing ? "팔로잉" : "팔로우"}
            </FollowButton>
          )}
        </UserCard>
      ))}
    </Container>
  );
};

export default FollowersPage;
