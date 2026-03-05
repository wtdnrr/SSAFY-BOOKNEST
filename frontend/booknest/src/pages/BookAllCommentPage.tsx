import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import api from '../api/axios';
import { Review } from '../components/ReviewList';
import { useAuthStore } from '../store/useAuthStore';
import { FaHeart, FaRegHeart, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
`;

const ReviewCard = styled.div<{ isUserReview?: boolean }>`
  padding: 16px;
  border: 1px solid ${props => props.isUserReview ? '#4CAF50' : '#dee2e6'};
  border-radius: 8px;
  margin-bottom: 16px;
  background-color: ${props => props.isUserReview ? '#f8fff8' : '#fff'};
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ReviewInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ReviewerName = styled.span`
  font-weight: bold;
  color: #495057;
`;

const ReviewDate = styled.span`
  color: #868e96;
  font-size: 14px;
`;

const ReviewContent = styled.div`
  margin-bottom: 8px;
  color: #495057;
`;

const LikeButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #868e96;
  font-size: 14px;
  transition: color 0.2s;

  &:hover {
    color: #ff6b6b;
  }

  &.liked {
    color: #ff6b6b;
  }
`;

const LoadMoreButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  color: #495057;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin: 16px 0;

  &:hover:not(:disabled) {
    background-color: #e9ecef;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Modal components
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

const ModalMessage = styled.p`
  margin-bottom: 1.5rem;
  color: #555;
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
  background-color: ${props => props.isPrimary ? '#00c437' : '#f1f3f5'};
  color: ${props => props.isPrimary ? 'white' : '#495057'};
  
  &:hover {
    background-color: ${props => props.isPrimary ? '#00b368' : '#e9ecef'};
  }
`;

// Modal type definition
type ModalType = 'info' | 'error' | null;

interface BookDetailResponse {
  success: boolean;
  data: {
    bookId: number;
    reviews: {
      content: Review[];
      pageNumber: number;
      totalPages: number;
      totalElements: number;
      pageSize: number;
      first: boolean;
      last: boolean;
    };
  };
}

const BookAllCommentPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { userDetail } = useAuthStore();
  const [likeLoading, setLikeLoading] = useState<{[key: number]: boolean}>({});

  // Modal state
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalMessage, setModalMessage] = useState('');
  
  // Modal functions
  const openModal = (type: ModalType, message: string) => {
    setModalType(type);
    setModalMessage(message);
  };
  
  const closeModal = () => {
    setModalType(null);
    setModalMessage('');
  };

  const fetchReviews = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await api.get<BookDetailResponse>(`/api/book/${bookId}?page=${pageNum}&size=10`);
      
      if (response.data.success) {
        if (pageNum === 0) {
          setReviews(response.data.data.reviews.content);
        } else {
          setReviews(prev => [...prev, ...response.data.data.reviews.content]);
        }
        setHasMore(!response.data.data.reviews.last);
      }
    } catch (error) {
      console.error('리뷰 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(0);
  }, [bookId]);

  const handleLikeToggle = async (reviewId: number) => {
    if (!userDetail) {
      openModal('info', '로그인이 필요한 기능입니다.');
      return;
    }
    
    if (likeLoading[reviewId]) return;
    
    setLikeLoading(prev => ({ ...prev, [reviewId]: true }));
    
    try {
      const review = reviews.find(r => r.reviewId === reviewId);
      if (!review) return;
      
      if (review.myLiked) {
        await api.delete(`/api/book/review/${reviewId}/like`);
      } else {
        await api.post(`/api/book/review/${reviewId}/like`);
      }
      
      // 리뷰 목록 새로고침
      fetchReviews(0);
    } catch (err) {
      console.error('좋아요 처리 실패:', err);
      openModal('error', '좋아요 처리에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLikeLoading(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchReviews(nextPage);
    }
  };

  return (
    <PageContainer>
      {/* Modal component */}
      {modalType && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>
              {modalType === 'error' ? (
                <><FaExclamationCircle color="#dc2626" /> 오류</>
              ) : (
                <><FaInfoCircle color="#00c437" /> 안내</>
              )}
            </ModalTitle>
            <ModalMessage>{modalMessage}</ModalMessage>
            <ModalButtons>
              <ModalButton isPrimary onClick={closeModal}>
                확인
              </ModalButton>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}
      
      <PageTitle>전체 리뷰</PageTitle>
      {reviews.map((review) => {
        const isUserReview = userDetail?.userId === review.reviewerId;
        return (
          <ReviewCard key={review.reviewId} isUserReview={isUserReview}>
            <ReviewHeader>
              <ReviewInfo>
                <ReviewerName>{review.reviewerName}</ReviewerName>
                <ReviewDate>
                  {new Date(review.updatedAt).toLocaleDateString()}
                </ReviewDate>
              </ReviewInfo>
            </ReviewHeader>
            <ReviewContent>{review.content}</ReviewContent>
            <LikeButton 
              onClick={() => handleLikeToggle(review.reviewId)}
              className={review.myLiked ? 'liked' : ''}
              disabled={likeLoading[review.reviewId]}
            >
              {review.myLiked ? <FaHeart /> : <FaRegHeart />}
              <span>좋아요 {review.likes}개</span>
            </LikeButton>
          </ReviewCard>
        );
      })}
      {hasMore && (
        <LoadMoreButton 
          onClick={loadMore}
          disabled={loading}
        >
          {loading ? '로딩 중...' : '더보기'}
        </LoadMoreButton>
      )}
    </PageContainer>
  );
};

export default BookAllCommentPage;
