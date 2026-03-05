import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaStar, FaStarHalf, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import api from '../api/axios';
import useRatingStore from '../store/useRatingStore';
import useNestStore from '../store/useNestStore';

interface RatingStarsProps {
  bookId: number;
  onRatingChange: (rating: number) => void;
}

// 모달 타입 정의
type ModalType = 'nestWarning' | 'confirm' | 'error' | null;

const StarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StarWrapper = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
  display: inline-block;
`;

const StarButton = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: ${(props) => (props.$active ? "#f8c41b" : "#ddd")};
  font-size: 24px;
  transition: color 0.2s ease;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #f8c41b;
  }
`;

const HalfStarButton = styled(StarButton)`
  width: 50%;
  overflow: hidden;
  z-index: 2;
`;

// 모달 관련 스타일
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-align: center;
`;

const ModalTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
`;

const ModalButton = styled.button<{ isPrimary?: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  background-color: ${props => props.isPrimary ? '#00c473' : '#f1f3f5'};
  color: ${props => props.isPrimary ? 'white' : '#495057'};
  
  &:hover {
    background-color: ${props => props.isPrimary ? '#00b368' : '#e9ecef'};
  }
`;

const RatingStars: React.FC<RatingStarsProps> = ({
  bookId,
  onRatingChange,
}) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const { userRatings, setUserRating } = useRatingStore();
  const { getNestStatus } = useNestStore();
  const currentRating = userRatings[bookId] || 0;
  
  // 모달 상태 관리
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const response = await api.get(`/api/book/${bookId}/rating`);
        if (response.data.success && response.data.data) {
          const { rating } = response.data.data;
          setUserRating(bookId, rating);
          // onRatingChange는 초기 로딩시에만 호출하거나 제거
        }
      } catch (error) {
        // console.error("Failed to fetch rating:", error);
        // 404 에러는 평점이 없는 경우이므로 무시
        if (error.response?.status !== 404) {
          // console.error("Error fetching rating:", error);
        }
      }
    };

    fetchRating();
  }, [bookId, setUserRating]); // onRatingChange 제거

  // 모달 열기 함수
  const openModal = (type: ModalType, message: string = '') => {
    setModalType(type);
    setModalMessage(message);
  };

  // 모달 닫기 함수
  const closeModal = () => {
    setModalType(null);
    setModalMessage('');
  };

  const handleStarClick = async (score: number) => {
    try {
      // Optimistic update
      setUserRating(bookId, score);
      onRatingChange(score);

      // console.log("Submitting rating:", {
      //   bookId,
      //   score,
      //   currentRating,
      //   method: currentRating > 0 ? "PUT" : "POST",
      // });

      const method = currentRating > 0 ? "put" : "post";
      const response = await api[method](`/api/book/${bookId}/rating`, {
        score: score,
      });

      // console.log("Rating response:", response.data);

      if (!response.data.success) {
        throw new Error(
          response.data.error?.message || `Failed to ${method} rating`
        );
      }
      
      // API 호출 성공 후 평균 평점 업데이트를 위해 onRatingChange 다시 호출
      onRatingChange(score);
    } catch (error) {
      // console.error(
      //   `Failed to ${currentRating > 0 ? "update" : "create"} rating:`,
      //   error
      // );
      setUserRating(bookId, currentRating);
      onRatingChange(currentRating);
    }
  };

  const proceedWithRatingCancel = async () => {
    try {
      // Optimistic update
      setUserRating(bookId, 0);
      onRatingChange(0);

      // 평점 삭제 API 호출
      const response = await api.delete(`/api/book/${bookId}/rating`);

      if (!response.data.success) {
        throw new Error(
          response.data.error?.message || "평점 삭제에 실패했습니다."
        );
      }

      // console.log("평점 삭제 성공:", response.data);

      // UI 즉시 업데이트를 위한 추가 처리
      // 1. 현재 평점 상태 초기화
      setUserRating(bookId, 0);
      // 2. 부모 컴포넌트에 평점 변경 알림
      onRatingChange(0);
      // 3. 호버 상태 초기화
      setHoveredRating(null);
      
      // 모달 닫기
      closeModal();
    } catch (error) {
      // console.error("평점 삭제 실패:", error);
      // 에러 발생 시 원래 상태로 복원
      setUserRating(bookId, currentRating);
      onRatingChange(currentRating);

      // 사용자에게 에러 메시지 표시
      openModal('error', "평점 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleCancelRating = async () => {
    try {
      // 서재에 담긴 책인지 확인
      const isInNest = getNestStatus(bookId);
      
      if (isInNest) {
        // 서재에 담긴 책인 경우 경고 모달 표시
        openModal('nestWarning', '둥지에 담긴 책은 평점을 취소할 수 없습니다.\n둥지에서 삭제 후 진행해주세요');
        return;
      }
      
      // 사용자에게 확인 메시지 표시
      openModal('confirm', "평점을 취소하시겠습니까?");
    } catch (error) {
      // console.error("평점 취소 처리 실패:", error);
      openModal('error', "오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleStarHover = (score: number) => {
    setHoveredRating(score);
  };

  const handleStarLeave = () => {
    setHoveredRating(null);
  };

  const renderStar = (index: number) => {
    const rating = hoveredRating || currentRating;
    const isFullStar = rating >= index;
    const isHalfStar = rating === index - 0.5;
    
    return (
      <StarWrapper
        key={index}
        onMouseLeave={handleStarLeave}
      >
        <StarButton
          $active={isFullStar || isHalfStar}
          onClick={() => handleStarClick(index)}
          onMouseEnter={() => handleStarHover(index)}
        >
          {isHalfStar ? <FaStarHalf /> : <FaStar />}
        </StarButton>
        <HalfStarButton
          $active={false}
          onClick={() => handleStarClick(index - 0.5)}
          onMouseEnter={() => handleStarHover(index - 0.5)}
          style={{ opacity: 0 }}  // 반별 클릭 영역만 유지하고 시각적으로는 숨김
        >
          <FaStar />
        </HalfStarButton>
      </StarWrapper>
    );
  };

  return (
    <>
      {/* 모달 컴포넌트 */}
      {modalType && (
        <ModalOverlay>
          <ModalContent>
            {modalType === 'nestWarning' && (
              <>
                <ModalTitle>
                  <FaExclamationCircle color="#dc2626" />
                  평점 취소 불가
                </ModalTitle>
                <p>{modalMessage}</p>
                <ModalButtons>
                  <ModalButton isPrimary onClick={closeModal}>
                    확인
                  </ModalButton>
                </ModalButtons>
              </>
            )}
            
            {modalType === 'confirm' && (
              <>
                <ModalTitle>
                  <FaInfoCircle color="#00c473" />
                  평점 취소
                </ModalTitle>
                <p>{modalMessage}</p>
                <ModalButtons>
                  <ModalButton onClick={closeModal}>
                    취소
                  </ModalButton>
                  <ModalButton isPrimary onClick={proceedWithRatingCancel}>
                    확인
                  </ModalButton>
                </ModalButtons>
              </>
            )}
            
            {modalType === 'error' && (
              <>
                <ModalTitle>
                  <FaExclamationCircle color="#dc2626" />
                  오류
                </ModalTitle>
                <p>{modalMessage}</p>
                <ModalButtons>
                  <ModalButton isPrimary onClick={closeModal}>
                    확인
                  </ModalButton>
                </ModalButtons>
              </>
            )}
          </ModalContent>
        </ModalOverlay>
      )}
      
      <StarContainer>
        {[1, 2, 3, 4, 5].map((index) => renderStar(index))}
        {currentRating > 0 && (
          <button
            onClick={handleCancelRating}
            style={{
              background: "none",
              border: "none",
              color: "#666",
              cursor: "pointer",
              marginLeft: "8px",
              fontSize: "14px",
            }}
          >
            취소
          </button>
        )}
      </StarContainer>
    </>
  );
};

export default RatingStars;