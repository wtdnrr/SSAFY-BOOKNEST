import React, { useState } from "react";
import styled from "@emotion/styled";
import SearchBar from "./SearchBar";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import api from "../api/axios";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  height: 80vh;
  overflow-y: auto;
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 16px;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const UserAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h3`
  margin: 0;
  font-size: 16px;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 20px;
  top: 20px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
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

interface UserSearchModalProps {
  onClose: () => void;
}

interface User {
  id: number;
  nickname: string;
  profileURL: string;
  isFollowing: boolean;
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  // 로컬 스토리지에서 userDetail 가져오기
  const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
  const userDetail = authStorage.state?.userDetail;

  const handleSearchResult = (data: any) => {
    // console.log("검색 결과 데이터:", data);

    if (!data) {
      // console.warn("데이터가 없습니다");
      setUsers([]);
      return;
    }

    // 페이지네이션 응답 구조 처리
    if (data.content && Array.isArray(data.content)) {
      // console.log("페이지네이션 데이터 처리:", data.content);
      setUsers(data.content);
    } else if (Array.isArray(data)) {
      // console.log("배열 데이터 처리:", data);
      setUsers(data);
    } else {
      // console.warn("처리할 수 없는 데이터 형식:", data);
      setUsers([]);
    }
  };

  const handleUserClick = (userId: number) => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  const handleFollowClick = async (e: React.MouseEvent, targetUserId: number) => {
    e.stopPropagation();
    try {
      const targetUser = users.find((u) => u.id === targetUserId);
      if (!targetUser) return;

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

      if (targetUser.isFollowing) {
        const response = await api.delete(`/api/follow?targetUserId=${targetUserId}`, { headers });
        if (response.data.success) {
          setUsers(users.map((user) => (user.id === targetUserId ? { ...user, isFollowing: false } : user)));
        }
      } else {
        const response = await api.post(`/api/follow?targetUserId=${targetUserId}`, {}, { headers });
        if (response.data.success) {
          setUsers(users.map((user) => (user.id === targetUserId ? { ...user, isFollowing: true } : user)));
        }
      }
    } catch (error) {
      // console.error("팔로우/언팔로우 작업 실패:", error);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClear={() => setSearchTerm("")}
          searchType="users"
          onSearchResult={handleSearchResult}
          placeholder="유저 검색"
          onUpdateSearchParams={(term) => setSearchTerm(term)}
        />
        <UserList>
          {users.map((user) => (
            <UserCard key={user.id}>
              <div
                onClick={() => handleUserClick(user.id)}
                style={{ cursor: "pointer", display: "flex", flex: 1, gap: "16px" }}
              >
                <UserAvatar src={user.profileURL} alt={user.nickname} />
                <UserInfo>
                  <UserName>{user.nickname}</UserName>
                </UserInfo>
              </div>
              {userDetail?.userId !== user.id && (
                <FollowButton isFollowing={user.isFollowing} onClick={(e) => handleFollowClick(e, user.id)}>
                  {user.isFollowing ? "팔로잉" : "팔로우"}
                </FollowButton>
              )}
            </UserCard>
          ))}
        </UserList>
      </ModalContent>
    </ModalOverlay>
  );
};

export default UserSearchModal;
