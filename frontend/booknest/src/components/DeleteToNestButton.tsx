import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { ROUTES } from "../constants/paths";

interface DeleteToNestButtonProps {
  bookId: number;
  nestId: number;
  onDelete?: () => void;
}

const Button = styled.button`
  padding: 12px 24px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  width: 100%;

  &:hover {
    background-color: #5a6268;
  }

  &:active {
    background-color: #545b62;
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
  color: #333;
`;

const ModalButton = styled.button<{ $variant?: "primary" | "secondary" }>`
  padding: 8px 16px;
  margin: 8px;
  background-color: ${(props) => (props.$variant === "primary" ? "#dc3545" : "#6c757d")};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${(props) => (props.$variant === "primary" ? "#c82333" : "#5a6268")};
  }
`;

const DeleteToNestButton: React.FC<DeleteToNestButtonProps> = ({ bookId, nestId, onDelete }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDeleteFromNest = async () => {
    setLoading(true);
    try {
      const response = await api.delete("/api/nest", {
        data: {
          nestId: nestId,
          bookId: bookId
        }
      });

      if (response.data.success) {
        setShowConfirmModal(false);
        if (onDelete) {
          onDelete();
        }
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      // console.error("Delete from nest error:", error);
      if (error.response?.status === 401) {
        alert("로그인이 필요한 서비스입니다.");
      } else {
        alert("둥지에서 도서 삭제 중 오류가 발생했습니다.");
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
      <Button onClick={() => setShowConfirmModal(true)} disabled={loading}>
        {loading ? "처리 중..." : "둥지에서 삭제"}
      </Button>

      {showConfirmModal && (
        <ModalOverlay onClick={() => setShowConfirmModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>둥지에서 삭제하시겠습니까?</ModalTitle>
            <ModalButton $variant="primary" onClick={handleDeleteFromNest}>
              삭제
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
            <ModalTitle>둥지에서 삭제되었습니다</ModalTitle>
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

export default DeleteToNestButton; 