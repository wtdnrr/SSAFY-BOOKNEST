import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { ROUTES } from "../constants/paths";

interface AddToNestButtonProps {
  bookId: number;
  currentRating: number;
  onAdd?: () => void;
}

interface UserInfo {
  userId: number;
  nestId: number;
  nickname: string;
  archetype: string;
  gender: string | null;
  birthDate: string | null;
  roadAddress: string;
  zipcode: string;
  profileURL: string;
  followers: number;
  followings: number;
  totalRatings: number;
  totalReviews: number;
}

const Button = styled.button`
  padding: 12px 24px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  width: 100%;

  &:hover {
    background-color: #357abd;
  }

  &:active {
    background-color: #2a5f9e;
  }
`;

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
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: center;
`;

const ModalTitle = styled.h3`
  margin: 0 0 16px 0;
  color: ${(props) => props.color || "#333"};
`;

const ModalButton = styled.button<{ $variant?: "primary" | "secondary" }>`
  padding: 8px 16px;
  margin: 8px;
  background-color: ${(props) => (props.$variant === "primary" ? "#4a90e2" : "#6c757d")};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${(props) => (props.$variant === "primary" ? "#357abd" : "#5a6268")};
  }
`;

const AddToNestButton: React.FC<AddToNestButtonProps> = ({ bookId, currentRating, onAdd }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 사용자 정보 조회
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api.get<{ success: boolean; data: UserInfo; error: null }>("/api/user/info");
        if (response.data.success && response.data.data) {
          setUserInfo(response.data.data);
          // console.log("User data fetched for nest:", response.data.data);
        }
      } catch (err) {
        // console.error("사용자 정보 조회 실패:", err);
      }
    };

    fetchUserInfo();
  }, []);

  const handleAddToNest = async () => {
    if (currentRating === 0) {
      alert("평점 등록은 필수입니다");
      return;
    }

    if (!userInfo || !userInfo.nestId) {
      alert("사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.");
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmAdd = async () => {
    setLoading(true);
    setShowConfirmModal(false);

    try {
      const requestData = {
        bookId: bookId,
        nestId: userInfo!.nestId,
        rating: currentRating.toString(),
      };

      // console.log("Sending request with data:", requestData);
      const response = await api.post("/api/nest", requestData);

      if (response.data.success) {
        if (onAdd) {
          onAdd();
        }
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      // console.error("Full error:", error);
      // console.error("Error details:", {
      //   status: error.response?.status,
      //   data: error.response?.data,
      //   headers: error.response?.headers,
      //   requestHeaders: error.config?.headers,
      //   message: error.message,
      // });

      if (error.response?.status === 409) {
        alert("이미 둥지에 등록된 도서입니다.");
      } else if (error.response?.status === 400) {
        // console.error("Request data that caused 400:", error.config?.data);
        alert("잘못된 요청입니다. 필수 정보를 확인해주세요.");
      } else if (error.response?.status === 401) {
        alert("로그인이 필요한 서비스입니다.");
        navigate(ROUTES.LOGIN);
      } else if (error.response?.status === 403) {
        // if (import.meta.env.DEV) {
        //   console.log("Development environment detected");
        //   console.log("Request URL:", error.config?.url);
        //   console.log("Request method:", error.config?.method);
        //   console.log("Request data:", error.config?.data);
        //   console.log("Complete request headers:", error.config?.headers);
        // }
        alert("권한이 없습니다. 인증 토큰을 확인해주세요.");
      } else {
        alert("둥지 등록 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoToNest = () => {
    navigate(ROUTES.NEST);
  };

  return (
    <>
      <Button onClick={handleAddToNest} disabled={loading}>
        {loading ? "처리 중..." : "내 둥지에 담기"}
      </Button>

      {showConfirmModal && (
        <ModalOverlay onClick={() => setShowConfirmModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>둥지에 등록하시겠습니까?</ModalTitle>
            <ModalButton $variant="primary" onClick={handleConfirmAdd}>
              등록하기
            </ModalButton>
            <ModalButton onClick={() => setShowConfirmModal(false)}>
              취소
            </ModalButton>
          </ModalContent>
        </ModalOverlay>
      )}

      {showSuccessModal && (
        <ModalOverlay onClick={() => setShowSuccessModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>둥지에 등록되었습니다</ModalTitle>
            <ModalButton $variant="primary" onClick={handleGoToNest}>
              둥지 바로가기
            </ModalButton>
            <ModalButton onClick={() => setShowSuccessModal(false)}>
              계속 둘러보기
            </ModalButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default AddToNestButton;
