import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { theme } from "../styles/theme";

import styled from "@emotion/styled";
import axios from "axios";
import api from "../api/axios";
import PurchaseModal from "../components/PurchaseModal";
import CommentForm from "../components/CommentForm";
import RatingStars from "../components/RatingStars";
import { useBookStore } from "../store/useBookStore";
import useRatingStore from "../store/useRatingStore";
import BookmarkButton from "../components/BookmarkButton";
import AddToNestButton from "../components/AddToNestButton";
import DeleteToNestButton from "../components/DeleteToNestButton";
import ReviewList, { Review, ReviewsPage } from "../components/ReviewList";
import { FaHeart, FaRegHeart, FaShoppingCart, FaHome, FaTrash, FaBookmark } from "react-icons/fa";
import useNestStore from "../store/useNestStore";
import { ROUTES } from "../constants/paths";

interface BookDetail {
  bookId: number;
  isBookMarked: boolean;
  isInNest: boolean;
  avgRating: number;
  title: string;
  publishedDate: string;
  isbn: string;
  publisher: string;
  pages: number;
  imageUrl: string;
  intro: string;
  index: string;
  publisherReview: string;
  authors: string[];
  tags: string[];
  categories: string[];
  reviews: ReviewsPage;
  nestId?: number;
}

interface PurchaseUrls {
  aladinUrl: string;
  kyoboUrl: string;
  yes24Url: string;
}

interface LibraryBook {
  libraryName: string;
  availability: string;
  link: string;
}

interface UserInfo {
  userId: number;
  nickname: string;
  gender: string | null;
  birthDate: string | null;
  roadAddress: string;
  zipcode: string;
  followers: number;
  followings: number;
  totalRatings: number;
  totalReviews: number;
  nestId: number;
}

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const TopSection = styled.div`
  display: flex;
  gap: 40px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 24px;
  }
`;

const ImageSection = styled.div`
  flex: 0 0 300px;

  @media (max-width: 768px) {
    flex: none;
    text-align: center;
  }
`;

const BookImage = styled.img`
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const InfoSection = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 16px;
  color: #333;
`;

const RatingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const RatingLabel = styled.span`
  font-size: 16px;
  color: #666;
  min-width: 80px;
`;

const RatingText = styled.span`
  font-size: 20px;
  color: #333;
`;

const AuthorInfo = styled.div`
  margin-bottom: 16px;
  color: #666;
`;

const BasicInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.span`
  font-size: 14px;
  color: #666;
`;

const Value = styled.span`
  font-size: 16px;
  color: #333;
`;

const TagsContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
`;

const Tag = styled.span`
  padding: 4px 12px;
  background-color: #e9ecef;
  border-radius: 16px;
  font-size: 14px;
  color: #495057;
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const MoreButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
  padding: 1rem 0;
  display: block;
  margin-left: auto;

  &:hover {
    text-decoration: underline;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 16px;
  color: #333;
  display: inline;
  position: relative;
  
  &::before {
    content: "";
    position: absolute;
    left: 0;
    bottom: 2px;
    width: 100%;
    height: 10px;
    background-color: rgba(0, 196, 115, 0.4);
    z-index: -1;
    transform: skewX(-4deg);
  }
`;

const Content = styled.p<{ isExpanded?: boolean }>`
  line-height: 1.6;
  color: #495057;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: ${(props) => (props.isExpanded ? "none" : "3")};
  -webkit-box-orient: vertical;
  margin-bottom: 8px;
  white-space: pre-line;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #dc3545;
  background-color: #fff3f3;
  border-radius: 8px;
  margin: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;
  margin-top: 24px;
  justify-content: center;
`;

const CircleButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  padding: 0;

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const IconCircle = styled.div<{ bgColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${props => props.bgColor};
  color: white;
  margin-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;

  svg {
    font-size: 24px;
  }

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transform: scale(1.05);
  }
`;

const ButtonText = styled.span`
  font-size: 14px;
  color: #495057;
  text-align: center;
`;

const BookHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const BookTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const ReviewSection = styled.div`
  margin-top: 40px;
`;

const ReviewCard = styled.div<{ isUserReview?: boolean }>`
  padding: 16px;
  border: 1px solid ${(props) => (props.isUserReview ? "#4CAF50" : "#dee2e6")};
  border-radius: 8px;
  margin-bottom: 16px;
  background-color: ${(props) => (props.isUserReview ? "#f8fff8" : "#fff")};
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

const ReviewContent = styled.div`
  margin-bottom: 8px;
  color: #495057;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
`;

const ReviewText = styled.span`
  flex: 1;
`;

const ReviewActions = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;
`;

const ActionButton = styled.button`
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background-color: #e9ecef;
  color: #495057;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #dee2e6;
  }

  &.delete {
    background-color: #fee2e2;
    color: #dc2626;

    &:hover {
      background-color: #fecaca;
    }
  }
`;

const ReviewerName = styled.span`
  font-weight: bold;
  color: #495057;
`;

const ReviewDate = styled.span`
  color: #868e96;
  font-size: 14px;
`;

const ReviewRating = styled.span`
  color: #f59f00;
  font-weight: bold;
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

const EmptyReviews = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
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

const ReviewPagination = styled.div`
  text-align: center;
  color: #6c757d;
  font-size: 14px;
  margin-top: 8px;
`;

// Add modal components
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

const ModalTitle = styled.h3<{ color?: string }>`
  margin: 0 0 16px 0;
  color: ${(props) => props.color || "#333"};
`;

const ModalButton = styled.button<{ $variant?: "primary" | "secondary" }>`
  padding: 8px 16px;
  margin: 8px;
  background-color: ${(props) => (props.$variant === "primary" ? "#00c473" : "#6c757d")};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${(props) => (props.$variant === "primary" ? "#00b369" : "#5a6268")};
  }
`;

const BookDetailPage = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [contentHeights, setContentHeights] = useState<{
    [key: string]: boolean;
  }>({});
  const introRef = useRef<HTMLParagraphElement>(null);
  const indexRef = useRef<HTMLParagraphElement>(null);
  const publisherReviewRef = useRef<HTMLParagraphElement>(null);
  const reviewListRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Zustand store
  const {
    purchaseUrls,
    loading: storeLoading,
    error: storeError,
    setPurchaseUrls,
    setLoading: setStoreLoading,
    setError: setStoreError,
  } = useBookStore();

  // 모달 상태
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { userRatings } = useRatingStore();
  const { setNestStatus, getNestStatus } = useNestStore();

  // Modal states
  const [showAddConfirmModal, setShowAddConfirmModal] = useState(false);
  const [showAddSuccessModal, setShowAddSuccessModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // New alert modal state
  const [alertModal, setAlertModal] = useState({
    open: false,
    message: '',
    title: '', 
    onConfirm: () => {},
    isError: false
  });

  // Function to show alert modal
  const showAlertModal = (message: string, title: string = '알림', onConfirm = () => {}, isError = false) => {
    setAlertModal({
      open: true,
      message,
      title,
      onConfirm,
      isError
    });
  };

  // Function to close alert modal
  const closeAlertModal = () => {
    setAlertModal(prev => ({...prev, open: false}));
    alertModal.onConfirm();
  };

  useEffect(() => {
    // URL에 fromReviews 파라미터가 있으면 리뷰 섹션으로 스크롤
    if (location.search.includes("fromReviews") && reviewListRef.current) {
      const headerHeight = 70; // 4rem = 64px (1rem = 16px)
      const yOffset = -headerHeight;
      const element = reviewListRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [location, book]);

  useEffect(() => {
    const checkContentHeight = (element: HTMLElement | null, key: string) => {
      if (!element) return;
      const lineHeight = parseInt(window.getComputedStyle(element).lineHeight);
      const height = element.scrollHeight;
      const lines = height / lineHeight;
      setContentHeights((prev) => ({ ...prev, [key]: lines > 3 }));
    };
    // book 데이터가 있을 때만 높이 체크
    if (book) {
      checkContentHeight(introRef.current, "intro");
      checkContentHeight(indexRef.current, "index");
      checkContentHeight(publisherReviewRef.current, "publisherReview");
    }
  }, [book]); // book 데이터가 변경될 때만 실행

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api.get<{
          success: boolean;
          data: UserInfo;
          error: null;
        }>("/api/user/info");
        if (response.data.success && response.data.data) {
          setUserInfo(response.data.data);
        }
      } catch (err) {
        console.error("사용자 정보 조회 실패:", err);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    const fetchBookDetail = async () => {
      if (!bookId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/api/book/${bookId}`);

        if (response.data.success) {
          const bookData = response.data.data;
          setBook(bookData);

          // 서재 등록 상태를 store에 저장 (API 응답 값이 있을 때만)
          if (typeof bookData.isInNest === "boolean") {
            setNestStatus(Number(bookId), bookData.isInNest);
          }
        } else {
          setError("도서 정보를 불러오는데 실패했습니다.");
        }
      } catch (err) {
        console.error("API Error:", err);
        setError("서버 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetail();
  }, [bookId, setNestStatus]);

  useEffect(() => {
    if (book) {
      setIsBookmarked(book.isBookMarked);
    }
  }, [book]);

  const handlePurchaseClick = async () => {
    try {
      setStoreLoading("purchaseUrls", true);
      setStoreError("purchaseUrls", null);
      setIsPurchaseModalOpen(true);

      const response = await api.get(`/api/book/${bookId}/purchase`);

      if (response.data.success) {
        setPurchaseUrls(response.data.data);
      } else {
        setStoreError("purchaseUrls", "구매 링크를 불러오는데 실패했습니다.");
      }
    } catch (err) {
      console.error("Purchase API Error:", err);
      setStoreError("purchaseUrls", "서버 오류가 발생했습니다.");
    } finally {
      setStoreLoading("purchaseUrls", false);
    }
  };

  const handlePurchaseModalClose = () => {
    setIsPurchaseModalOpen(false);
    setPurchaseUrls(null);
  };

  const handleCommentSubmit = async () => {
    try {
      const response = await api.get(`/api/book/${bookId}?page=1&size=5`);

      if (response.data.success) {
        setBook(response.data.data);
      }
    } catch (err) {
      console.error("Book API Error:", err);
    }
  };

  const handleRatingChange = async (newRating: number) => {
    if (!book) return;
    
    try {
      // 이전 평점과 현재 평점이 다를 경우에만 UI 업데이트
      const oldUserRating = userRatings[book.bookId] || 0;
      
      // 사용자에게 즉각적인 피드백을 주기 위해 UI를 먼저 업데이트
      // 평점이 변경되었음을 시각적으로 표시하기 위해 별점 컴포넌트 상태 업데이트
      if (oldUserRating !== newRating) {
        // 모든 평점 정보를 가져오는 API 호출
      const response = await api.get(`/api/book/${bookId}`);

      if (response.data.success) {
          // 새로운 평균 평점으로 즉시 UI 업데이트
        setBook(response.data.data);
      } else {
        throw new Error("Failed to fetch updated book data");
        }
      }
    } catch (err) {
      console.error("Error updating rating:", err);
      setError("평점 업데이트에 실패했습니다.");
    }
  };

  const handleNestUpdate = () => {
    if (book) {
      const newStatus = !getNestStatus(book.bookId);
      setNestStatus(book.bookId, newStatus);

      // 서재에 등록되면 북마크는 자동으로 해제됨
      if (newStatus) {
        setBook((prev) => (prev ? { ...prev, isBookMarked: false } : null));
      }

      // 상태 변경 후 책 정보 다시 불러오기
      const fetchUpdatedBookDetail = async () => {
        try {
          const response = await api.get(`/api/book/${bookId}`);
          if (response.data.success) {
            setBook(response.data.data);
          }
        } catch (err) {
          console.error("Failed to fetch updated book details:", err);
        }
      };

      fetchUpdatedBookDetail();
    }
  };

  const handleAddToNest = () => {
    if (userRatings[Number(bookId)] === 0) {
      showAlertModal("평점 등록은 필수입니다", "평점 필요", undefined, true);
      return;
    }

    if (!userInfo || !userInfo.nestId) {
      showAlertModal("사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.", "사용자 정보 오류", undefined, true);
      return;
    }

    setShowAddConfirmModal(true);
  };

  const handleConfirmAdd = async () => {
    setIsProcessing(true);
    setShowAddConfirmModal(false);

    try {
      const requestData = {
        bookId: Number(bookId),
        nestId: userInfo!.nestId,
        rating: userRatings[Number(bookId)].toString(),
      };

      const response = await api.post("/api/nest", requestData);

      if (response.data.success) {
        handleNestUpdate();
        setShowAddSuccessModal(true);
      }
    } catch (error: any) {
      console.error("Error adding to nest:", error);
      
      if (error.response?.status === 409) {
        showAlertModal("이미 둥지에 등록된 도서입니다.", "중복 등록", undefined, true);
      } else if (error.response?.status === 400) {
        showAlertModal("잘못된 요청입니다. 필수 정보를 확인해주세요.", "요청 오류", undefined, true);
      } else if (error.response?.status === 401) {
        showAlertModal("로그인이 필요한 서비스입니다.", "인증 오류", () => navigate(ROUTES.LOGIN), true);
      } else {
        showAlertModal("둥지 등록 중 오류가 발생했습니다.", "등록 오류", undefined, true);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteFromNest = () => {
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsProcessing(true);
    try {
      const response = await api.delete("/api/nest", {
        data: {
          nestId: userInfo?.nestId,
          bookId: Number(bookId)
        }
      });

      if (response.data.success) {
        setShowDeleteConfirmModal(false);
        handleNestUpdate();
        setShowDeleteSuccessModal(true);
      }
    } catch (error: any) {
      console.error("Delete from nest error:", error);
      if (error.response?.status === 401) {
        showAlertModal("로그인이 필요한 서비스입니다.", "인증 오류", () => navigate(ROUTES.LOGIN), true);
      } else {
        showAlertModal("둥지에서 도서 삭제 중 오류가 발생했습니다.", "삭제 오류", undefined, true);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToNest = () => {
    navigate(ROUTES.NEST);
  };

  const handleBookmarkClick = async () => {
    if (!book) return;
    
    try {
      // Optimistic update
      setIsBookmarked(!isBookmarked);
      const newIsBookmarked = !isBookmarked;
      
      // Also update the book state optimistically
      setBook(prevBook => {
        if (!prevBook) return null;
        return { ...prevBook, isBookMarked: newIsBookmarked };
      });

      const requestData = {
        bookId: book.bookId.toString(),
      };

      let response;
      if (isBookmarked) {
        // 찜 해제
        response = await api.delete("/api/nest/bookmark", {
          data: requestData,
        });
      } else {
        // 찜하기
        response = await api.post("/api/nest/bookmark", requestData);
      }

      if (!response.data.success) {
        throw new Error("Failed to toggle bookmark");
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
      // 에러 발생 시 상태 되돌리기
      setIsBookmarked(!isBookmarked);
      
      // Also revert the book state
      setBook(prevBook => {
        if (!prevBook) return null;
        return { ...prevBook, isBookMarked: isBookmarked };
      });
    }
  };

  if (loading) {
    return <LoadingMessage>도서 정보를 불러오는 중...</LoadingMessage>;
  }

  if (error || !book) {
    return <ErrorMessage>{error || "도서 정보를 찾을 수 없습니다."}</ErrorMessage>;
  }

  return (
    <Container>
      {book && (
        <>
          <BookHeader>
          </BookHeader>
          <TopSection>
            <ImageSection>
              <BookImage src={book.imageUrl} alt={book.title} />
              <ButtonContainer>
                {getNestStatus(book.bookId) ? (
                  <CircleButton onClick={handleDeleteFromNest} disabled={isProcessing}>
                    <IconCircle bgColor="#6c757d">
                      <FaTrash />
                    </IconCircle>
                    <ButtonText>둥지제거</ButtonText>
                  </CircleButton>
                ) : (
                  <CircleButton onClick={handleAddToNest} disabled={isProcessing}>
                    <IconCircle bgColor="#00c473">
                      <FaBookmark />
                    </IconCircle>
                    <ButtonText>둥지담기</ButtonText>
                  </CircleButton>
                )}
                <CircleButton onClick={handleBookmarkClick}>
                  <IconCircle bgColor={isBookmarked ? '#FF6B6B' : '#E9ECEF'}>
                    <FaHeart style={{color: 'white'}} />
                  </IconCircle>
                  <ButtonText>찜하기</ButtonText>
                </CircleButton>
                <CircleButton onClick={handlePurchaseClick}>
                  <IconCircle bgColor="#3F51B5">
                    <FaShoppingCart />
                  </IconCircle>
                  <ButtonText>구매하기</ButtonText>
                </CircleButton>
              </ButtonContainer>
            </ImageSection>
            <InfoSection>
              <Title>{book.title}</Title>
              <RatingContainer>
                <RatingRow>
                  <RatingLabel>평균 평점</RatingLabel>
                  <RatingText>{book.avgRating.toFixed(1)}</RatingText>
                </RatingRow>
                <RatingRow>
                  <RatingLabel>내 평점</RatingLabel>
                  <RatingStars bookId={book.bookId} onRatingChange={handleRatingChange} />
                  <RatingText>{userRatings[book.bookId]?.toFixed(1) || "0.0"}</RatingText>
                </RatingRow>
              </RatingContainer>
              <AuthorInfo>저자: {book.authors.join(", ")}</AuthorInfo>
              <BasicInfo>
                <InfoItem>
                  <Label>출판사</Label>
                  <Value>{book.publisher}</Value>
                </InfoItem>
                <InfoItem>
                  <Label>출판일</Label>
                  <Value>{book.publishedDate}</Value>
                </InfoItem>
                <InfoItem>
                  <Label>ISBN</Label>
                  <Value>{book.isbn}</Value>
                </InfoItem>
                <InfoItem>
                  <Label>페이지</Label>
                  <Value>{book.pages}쪽</Value>
                </InfoItem>
              </BasicInfo>
              <TagsContainer>
                {book.tags.map((tag, index) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
              </TagsContainer>
            </InfoSection>
          </TopSection>

          {/* 책 소개 섹션 */}
          {book.intro && (
            <Section>
              <SectionTitle>책 소개</SectionTitle>
              <Content ref={introRef} isExpanded={expandedSections["intro"]}>
                {book.intro}
              </Content>
              {contentHeights["intro"] && (
                <MoreButton
                  onClick={() =>
                    setExpandedSections((prev) => ({
                      ...prev,
                      intro: !prev.intro,
                    }))
                  }
                >
                  {expandedSections["intro"] ? "접기" : "더보기"}
                </MoreButton>
              )}
            </Section>
          )}

          {/* 목차 섹션 */}
          {book.index && (
            <Section>
              <SectionTitle>목차</SectionTitle>
              <Content ref={indexRef} isExpanded={expandedSections["index"]}>
                {book.index}
              </Content>
              {contentHeights["index"] && (
                <MoreButton
                  onClick={() =>
                    setExpandedSections((prev) => ({
                      ...prev,
                      index: !prev.index,
                    }))
                  }
                >
                  {expandedSections["index"] ? "접기" : "더보기"}
                </MoreButton>
              )}
            </Section>
          )}

          {/* 출판사 서평 섹션 */}
          {book.publisherReview && (
            <Section>
              <SectionTitle>출판사 서평</SectionTitle>
              <Content ref={publisherReviewRef} isExpanded={expandedSections["publisherReview"]}>
                {book.publisherReview}
              </Content>
              {contentHeights["publisherReview"] && (
                <MoreButton
                  onClick={() =>
                    setExpandedSections((prev) => ({
                      ...prev,
                      publisherReview: !prev.publisherReview,
                    }))
                  }
                >
                  {expandedSections["publisherReview"] ? "접기" : "더보기"}
                </MoreButton>
              )}
            </Section>
          )}

          <SectionTitle>한줄평</SectionTitle>

          <CommentForm bookId={Number(bookId)} onCommentSubmit={handleCommentSubmit} />
          <div ref={reviewListRef}>
            <ReviewList
              bookId={Number(bookId)}
              reviews={book.reviews}
              onReviewChange={handleCommentSubmit}
              currentUserId={userInfo?.nickname || null}
            />
          </div>

          {/* Add Modals at the bottom */}
          {showAddConfirmModal && (
            <ModalOverlay onClick={() => setShowAddConfirmModal(false)}>
              <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalTitle>둥지에 등록하시겠습니까?</ModalTitle>
                <ModalButton $variant="primary" onClick={handleConfirmAdd}>
                  등록하기
                </ModalButton>
                <ModalButton onClick={() => setShowAddConfirmModal(false)}>
                  취소
                </ModalButton>
              </ModalContent>
            </ModalOverlay>
          )}

          {showAddSuccessModal && (
            <ModalOverlay onClick={() => setShowAddSuccessModal(false)}>
              <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalTitle>둥지에 등록되었습니다</ModalTitle>
                <ModalButton $variant="primary" onClick={handleGoToNest}>
                  둥지 바로가기
                </ModalButton>
                <ModalButton onClick={() => setShowAddSuccessModal(false)}>
                  계속 둘러보기
                </ModalButton>
              </ModalContent>
            </ModalOverlay>
          )}

          {showDeleteConfirmModal && (
            <ModalOverlay onClick={() => setShowDeleteConfirmModal(false)}>
              <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalTitle>둥지에서 삭제하시겠습니까?</ModalTitle>
                <ModalButton $variant="primary" onClick={handleConfirmDelete}>
                  삭제
                </ModalButton>
                <ModalButton onClick={() => setShowDeleteConfirmModal(false)}>
                  취소
                </ModalButton>
              </ModalContent>
            </ModalOverlay>
          )}

          {showDeleteSuccessModal && (
            <ModalOverlay onClick={() => setShowDeleteSuccessModal(false)}>
              <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalTitle>둥지에서 삭제되었습니다</ModalTitle>
                <ModalButton $variant="primary" onClick={handleGoToNest}>
                  둥지 바로가기
                </ModalButton>
                <ModalButton onClick={() => setShowDeleteSuccessModal(false)}>
                  계속 둘러보기
                </ModalButton>
              </ModalContent>
            </ModalOverlay>
          )}

          {/* Alert Modal */}
          {alertModal.open && (
            <ModalOverlay onClick={closeAlertModal}>
              <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalTitle color={alertModal.isError ? "#dc3545" : "#00c473"}>
                  {alertModal.title}
                </ModalTitle>
                <div style={{ marginBottom: '20px' }}>{alertModal.message}</div>
                <ModalButton $variant="primary" onClick={closeAlertModal}>
                  확인
                </ModalButton>
              </ModalContent>
            </ModalOverlay>
          )}

          <PurchaseModal
            isOpen={isPurchaseModalOpen}
            onClose={handlePurchaseModalClose}
            purchaseUrls={purchaseUrls}
            isLoading={storeLoading.purchaseUrls}
            error={storeError.purchaseUrls}
          />
        </>
      )}
    </Container>
  );
};

export default BookDetailPage;
