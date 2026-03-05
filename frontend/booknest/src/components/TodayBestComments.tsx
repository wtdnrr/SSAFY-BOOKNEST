import React, { useState, useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { FaHeart, FaRegHeart, FaCaretUp, FaExclamationCircle } from "react-icons/fa";
import { RiMedalFill, RiMedalLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

interface BestReview {
  reviewId: number;
  bookId: number;
  bookName: string;
  reviewerName: string;
  reviewerProfileUrl: string;
  reviewerImgUrl: string;
  content: string;
  myLiked: boolean;
  totalLikes: number;
  todayLikes: number;
  rank: number;
  createdAt: string;
  updatedAt: string;
}

const TodayBestContainer = styled.div`
  background-image: url("/bg2.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 20px;
  border-radius: 16px;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 16px;
    z-index: 0;
  }

  & > * {
    position: relative;
    z-index: 1;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 16px;
  justify-content: flex-start;
  padding-top: 24px;
  border-radius: 16px;
  overflow-x: auto;
  position: relative;

  @media (min-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
    overflow-x: hidden;
  }
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const HighlightText = styled.span`
  color: #00c473;
  font-weight: bold;
`;

const ReviewCard = styled.div`
  flex: 0 0 300px;
  height: 250px;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  background-color: #fff;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  }

  @media (min-width: 768px) {
    width: calc(50% - 16px);
  }

  @media (min-width: 1024px) {
    width: calc(33.33% - 16px);
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-right: 100px;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const RankBadge = styled.div<{ rank: number }>`
  margin-right: 8px;
  color: ${(props) => {
    switch (props.rank) {
      case 1:
        return "#FFB800";
      case 2:
        return "#A3A3A3";
      case 3:
        return "#C77B30";
      default:
        return "#6c757d";
    }
  }};
  font-size: 24px;
  display: flex;
  align-items: center;
`;

const ReviewerName = styled.span`
  font-weight: 600;
  font-size: 16px;
  color: #1a1a1a;
`;

const ReviewContent = styled.p`
  margin: 0 0 32px 0;
  margin-top: 16px;
  color: #333;
  font-size: 16px;
  line-height: 1.6;
  letter-spacing: -0.3px;
  max-height: 48px; /* Fixed height for 3 lines */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const BookInfo = styled.div`
  margin-top: 32px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
`;

const BookTitle = styled.span`
  font-size: 14px;
  color: #666;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  max-width: 100%;
`;

const InteractionBar = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  position: absolute;
  right: 20px;
`;

const LikeButton = styled.button<{ isLiked: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${(props) => (props.isLiked ? "#ff4b4b" : "#868e96")};
  font-size: 16px;
  transition: all 0.2s ease;
  padding: 4px 8px;

  &:hover {
    opacity: 0.8;
  }

  svg {
    font-size: 16px;
  }
`;

const TodayLikes = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #00c473;
  font-size: 16px;
  padding: 4px 8px;
  opacity: 0.8;

  svg {
    font-size: 22px;
    height: 38px;
    width: 18px;
    transform: scaleY(1.3);
  }
`;

// 모달 타입 정의
type ModalType = "error" | null;

// 모달 스타일 컴포넌트 추가
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
  background-color: ${(props) => (props.isPrimary ? "#00c473" : "#f1f3f5")};
  color: ${(props) => (props.isPrimary ? "white" : "#495057")};

  &:hover {
    background-color: ${(props) => (props.isPrimary ? "#00b368" : "#e9ecef")};
  }
`;

const TodayBestComments: React.FC = () => {
  const navigate = useNavigate();
  const [bestReviews, setBestReviews] = useState<BestReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState<{ [key: number]: boolean }>({});
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 모달 상태 관리
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalMessage, setModalMessage] = useState("");

  // 모달 열기 함수
  const openModal = (type: ModalType, message: string = "") => {
    setModalType(type);
    setModalMessage(message);
  };

  // 모달 닫기 함수
  const closeModal = () => {
    setModalType(null);
    setModalMessage("");
  };

  const handleScroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;

    const scrollAmount = 300;
    const newPosition = direction === "left" ? scrollPosition - scrollAmount : scrollPosition + scrollAmount;

    setScrollPosition(newPosition);
    containerRef.current.scrollTo({ left: newPosition, behavior: "smooth" });
  };

  const fetchBestReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/book/best-reviews");
      if (response.data.success) {
        setBestReviews(response.data.data);
      }
    } catch (error) {
      // console.error("베스트 리뷰 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로딩 시에만 데이터 가져오기
  useEffect(() => {
    fetchBestReviews();
  }, []);

  const handleLikeToggle = async (reviewId: number) => {
    if (likeLoading[reviewId]) return;

    setLikeLoading((prev) => ({ ...prev, [reviewId]: true }));

    try {
      const review = bestReviews.find((r) => r.reviewId === reviewId);
      if (!review) return;

      // 낙관적 UI 업데이트 (먼저 UI 업데이트)
      const updatedReviews = bestReviews.map((r) => {
        if (r.reviewId === reviewId) {
          // 좋아요 상태를 토글하고 좋아요 수를 조정
          const newTotalLikes = r.myLiked ? r.totalLikes - 1 : r.totalLikes + 1;
          const newTodayLikes = r.myLiked ? r.todayLikes - 1 : r.todayLikes + 1;
          return {
            ...r,
            myLiked: !r.myLiked,
            totalLikes: newTotalLikes,
            todayLikes: newTodayLikes >= 0 ? newTodayLikes : 0,
          };
        }
        return r;
      });

      setBestReviews(updatedReviews);

      // API 호출
      if (review.myLiked) {
        await api.delete(`/api/book/review/${reviewId}/like`);
      } else {
        await api.post(`/api/book/review/${reviewId}/like`);
      }

      // 더 이상 fetchBestReviews()를 호출하지 않음
    } catch (err) {
      // console.error("좋아요 처리 실패:", err);

      // 에러 발생 시 원래 상태로 롤백
      const rollbackReviews = bestReviews.map((r) => {
        if (r.reviewId === reviewId) {
          const originalReview = bestReviews.find((orig) => orig.reviewId === reviewId);
          return originalReview || r;
        }
        return r;
      });

      setBestReviews(rollbackReviews);
      openModal("error", "좋아요 처리에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLikeLoading((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  const handleReviewClick = (bookId: number, event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }
    navigate(`/book-detail/${bookId}`);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <RiMedalFill />;
      case 2:
        return <RiMedalFill />;
      case 3:
        return <RiMedalFill />;
      default:
        return <RiMedalLine />;
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <TodayBestContainer>
      {/* 모달 컴포넌트 */}
      {modalType && (
        <ModalOverlay>
          <ModalContent>
            {modalType === "error" && (
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

      <Title>
        <HighlightText>오늘의</HighlightText> BEST <HighlightText>한줄평</HighlightText>
      </Title>
      <Container ref={containerRef}>
        {bestReviews.map((review) => (
          <ReviewCard key={review.reviewId} onClick={(e) => handleReviewClick(review.bookId, e)}>
            <ReviewHeader>
              <RankBadge rank={review.rank}>{getRankIcon(review.rank)}</RankBadge>
              <InteractionBar>
                <LikeButton
                  isLiked={review.myLiked}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikeToggle(review.reviewId);
                  }}
                  disabled={likeLoading[review.reviewId]}
                >
                  {review.myLiked ? <FaHeart /> : <FaRegHeart />}
                  {review.totalLikes}
                </LikeButton>
                {review.todayLikes > 0 && (
                  <TodayLikes>
                    <FaCaretUp />
                    {review.todayLikes}
                  </TodayLikes>
                )}
              </InteractionBar>
            </ReviewHeader>
            <UserProfile>
              <ProfileImage src={review.reviewerImgUrl || "/default-profile.png"} alt={review.reviewerName} />
              <ReviewerName>{review.reviewerName}</ReviewerName>
            </UserProfile>

            <ReviewContent>{review.content}</ReviewContent>

            <BookInfo>
              <BookTitle>『{review.bookName}』</BookTitle>
            </BookInfo>
          </ReviewCard>
        ))}
      </Container>
    </TodayBestContainer>
  );
};

export default TodayBestComments;
