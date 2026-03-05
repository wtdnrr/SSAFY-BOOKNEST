import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import api from "../api/axios";

interface IgnoreButtonProps {
  bookId: number;
}

const Button = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

interface BanIconProps {
  isIgnored: boolean;
}

const BanIcon = styled.svg<BanIconProps>`
  width: 24px;
  height: 24px;
  stroke: ${(props) => (props.isIgnored ? "#ff4444" : "#E0E0E0")};
  transition: stroke 0.2s ease;
`;

const IgnoreButton: React.FC<IgnoreButtonProps> = ({ bookId }) => {
  const [isIgnored, setIsIgnored] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 초기 관심없음 상태 조회
  useEffect(() => {
    const fetchIgnoreStatus = async () => {
      try {
        const response = await api.get(`/api/book/${bookId}/ignore`);
        if (response.data.success) {
          setIsIgnored(response.data.data);
        }
      } catch (error) {
        // console.error("Failed to fetch ignore status:", error);
      }
    };

    fetchIgnoreStatus();
  }, [bookId]);

  const handleIgnoreClick = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const nextState = !isIgnored;

      // Optimistic update
      setIsIgnored(nextState);

      if (nextState) {
        // 관심없음 추가 (POST)
        await api.post(`/api/book/${bookId}/ignore`);
      } else {
        // 관심없음 삭제 (DELETE)
        await api.delete(`/api/book/${bookId}/ignore`);
      }
    } catch (error) {
      // console.error("Failed to update ignore status:", error);
      // Revert optimistic update on error
      setIsIgnored(isIgnored);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleIgnoreClick} disabled={isLoading} aria-label={isIgnored ? "관심없음 취소" : "관심없음"}>
      <BanIcon isIgnored={isIgnored} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </BanIcon>
    </Button>
  );
};

export default IgnoreButton;
