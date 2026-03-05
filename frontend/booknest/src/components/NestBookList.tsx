import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import styled from "@emotion/styled";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { FaStar, FaStarHalfAlt, FaTrash, FaExclamationCircle, FaInfoCircle } from "react-icons/fa";
import { SortOption, ViewMode } from "../pages/NestPage";

interface NestBook {
  bookId: number;
  title: string;
  authors: string;
  imageUrl: string;
  createdAt: string;
  userRating: number;
  userReview: string;
}

interface PaginationInfo {
  pageNumber: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  first: boolean;
  last: boolean;
}

interface UserInfo {
  userId: number;
  nestId: number;
  nickname: string;
  archetype: string;
  gender: string;
  birthDate: string;
  roadAddress: string;
  zipcode: string;
  profileURL: string;
  followers: number;
  followings: number;
  totalRatings: number;
  totalReviews: number;
}

interface NestBookListProps {
  userId?: number;
  nestId?: number;
  sortOption?: SortOption;
  searchTerm?: string;
  viewMode?: ViewMode;
}

const Container = styled.div`
  width: 100%;
`;

const BookGrid = styled.div<{ viewMode: ViewMode }>`
  display: grid;
  grid-template-columns: ${props => props.viewMode === "cover" 
    ? "repeat(auto-fill, minmax(180px, 1fr))" 
    : "repeat(auto-fill, minmax(220px, 1fr))"};
  gap: ${props => props.viewMode === "cover" ? "16px" : "24px"};
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: ${props => props.viewMode === "cover" 
      ? "repeat(auto-fill, minmax(130px, 1fr))" 
      : "repeat(auto-fill, minmax(160px, 1fr))"};
    gap: ${props => props.viewMode === "cover" ? "12px" : "16px"};
  }
`;

const BookCard = styled.div<{ viewMode: ViewMode }>`
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
  background-color: white;
  position: relative;
  height: ${props => props.viewMode === "cover" ? "auto" : "auto"};

  &:hover {
    transform: translateY(-5px);
  }

  &:hover .delete-button {
    opacity: 1;
  }
  
  &:hover .cover-title {
    opacity: 1;
  }
`;

const BookCover = styled.div<{ viewMode: ViewMode }>`
  position: relative;
  height: ${props => props.viewMode === "cover" ? "240px" : "260px"};
  
  @media (max-width: 768px) {
    height: ${props => props.viewMode === "cover" ? "180px" : "220px"};
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const BookInfo = styled.div`
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const BookTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: none;
`;

const BookAuthor = styled.p`
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CreatedAtTag = styled.div`
  font-size: 12px;
  color: #888;
  margin-top: 4px;
  margin-bottom: 8px;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const StarContainer = styled.div`
  display: flex;
  color: #f8d254;
  margin-right: 8px;
`;

const RatingValue = styled.span`
  font-size: 14px;
  color: #444;
`;

const ReviewText = styled.p`
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #555;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
`;

const PageButton = styled.button<{ isActive?: boolean }>`
  background-color: ${(props) => (props.isActive ? "#00c473" : "white")};
  color: ${(props) => (props.isActive ? "white" : "#333")};
  border: 1px solid #ddd;
  padding: 8px 12px;
  margin: 0 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: ${(props) => (props.isActive ? "#00b368" : "#f5f5f5")};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: #666;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 48px;
  color: #666;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 48px;
  color: #e53935;
  background-color: #ffebee;
  border-radius: 8px;
`;

const LoginRequiredState = styled.div`
  text-align: center;
  padding: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eaeaea;
`;

const LoginButton = styled.button`
  background-color: #00c473;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #00b368;
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(220, 53, 69, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    background-color: rgb(220, 53, 69);
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
`;

const CoverOnlyTitle = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0;
  transition: opacity 0.2s;
`;

// 날짜 포맷 함수 추가
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `등록일: ${year}.${month}.${day}`;
};

const renderRatingStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const stars = [];

  for (let i = 0; i < fullStars; i++) {
    stars.push(<FaStar key={`full-${i}`} />);
  }

  if (hasHalfStar) {
    stars.push(<FaStarHalfAlt key="half" />);
  }

  return stars;
};

// 정렬 함수 추가
const sortBooks = (books: NestBook[], sortOption: SortOption): NestBook[] => {
  switch (sortOption) {
    case "latest":
      return [...books].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case "oldest":
      return [...books].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case "rating":
      return [...books].sort((a, b) => b.userRating - a.userRating);
    case "title":
      return [...books].sort((a, b) => a.title.localeCompare(b.title));
    default:
      return books;
  }
};

// 검색 필터링 함수 추가
const filterBooksByTitle = (books: NestBook[], searchTerm: string): NestBook[] => {
  if (!searchTerm || searchTerm.trim() === '') {
    return books;
  }
  
  const lowercasedSearch = searchTerm.toLowerCase();
  // 제목의 첫글자부터 연속으로 두글자 이상 일치하는 도서만 필터링
  return books.filter(book => 
    book.title.toLowerCase().includes(lowercasedSearch) && 
    book.title.toLowerCase().indexOf(lowercasedSearch) === 0
  );
};

// 모달 타입 정의
type ModalType = 'delete' | 'error' | null;

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

const ModalButton = styled.button<{ isPrimary?: boolean; isError?: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  background-color: ${props => {
    if (props.isError) return '#dc2626';
    if (props.isPrimary) return '#00c473';
    return '#f1f3f5';
  }};
  color: ${props => (props.isPrimary || props.isError) ? 'white' : '#495057'};
  
  &:hover {
    background-color: ${props => {
      if (props.isError) return '#c41d1d';
      if (props.isPrimary) return '#00b368';
      return '#e9ecef';
    }};
  }
`;

const NestBookList = forwardRef<{ fetchNestBooks: () => void }, NestBookListProps>(
  ({ userId: propUserId, nestId: propNestId, sortOption = "latest", searchTerm = "", viewMode = "full" }, ref) => {
    const [books, setBooks] = useState<NestBook[]>([]);
    const [sortedBooks, setSortedBooks] = useState<NestBook[]>([]);
    const [filteredBooks, setFilteredBooks] = useState<NestBook[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({
      pageNumber: 1,
      totalPages: 1,
      totalElements: 0,
      pageSize: 12,
      first: true,
      last: true,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthError, setIsAuthError] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    
    // 모달 상태 관리 추가
    const [modalType, setModalType] = useState<ModalType>(null);
    const [modalMessage, setModalMessage] = useState('');
    const [bookToDelete, setBookToDelete] = useState<number | null>(null);

    const navigate = useNavigate();

    // 모달 열기 함수
    const openModal = (type: ModalType, message: string = '') => {
      setModalType(type);
      setModalMessage(message);
    };

    // 모달 닫기 함수
    const closeModal = () => {
      setModalType(null);
      setModalMessage('');
      if (modalType === 'delete') {
        setBookToDelete(null);
      }
    };

    // 사용자 정보 조회
    const fetchUserInfo = async () => {
      try {
        // console.log("사용자 정보 조회 시작");
        const response = await api.get("/api/user/info");
        // console.log("사용자 정보 응답:", response.data);

        if (response.data.success && response.data.data) {
          setUserInfo(response.data.data);
          return response.data.data;
        }
        return null;
      } catch (err) {
        // console.error("사용자 정보 조회 실패:", err);
        return null;
      }
    };

    const fetchNestBooks = async (page = 1, currentUserId?: number, currentNestId?: number) => {
      try {
        setLoading(true);
        setError(null);
        setIsAuthError(false);

        // 디버그 정보 추가 - props로 전달된 값 확인
        // console.log("Props 값:", { propUserId, propNestId });
        // console.log("Current 값:", { currentUserId, currentNestId });

        // 우선순위: props로 전달된 값 > 사용자 정보에서 가져온 값
        const effectiveUserId = propUserId || currentUserId;
        // nestId가 없는 경우 userId를 사용 (백엔드 API 요구사항)
        const effectiveNestId = propNestId || currentNestId || effectiveUserId;

        // 디버그 정보 추가 - 유효한 값 확인
        // console.log("Effective 값:", { effectiveUserId, effectiveNestId });

        // API 스펙에 맞게 Query Parameter 수정
        const params: Record<string, any> = {
          page: page,
          size: 12,
        };

        // userId와 nestId 값이 있는 경우만 파라미터에 추가
        if (effectiveUserId !== undefined && effectiveUserId !== null) {
          params.userId = effectiveUserId;
        }

        if (effectiveNestId !== undefined && effectiveNestId !== null) {
          params.nestId = effectiveNestId;
        }

        // 디버깅 정보 출력
        // console.log("API 요청 파라미터:", params);
        // console.log("토큰:", localStorage.getItem("token"));

        // axios 인터셉터가 토큰을 자동으로 추가하므로 명시적 헤더 설정 제거
        const response = await api.get("/api/nest", { params });

        // console.log("API 응답:", response.data);

        if (response.data.success) {
          if (response.data.data && response.data.data.content) {
            setBooks(response.data.data.content);
            setPagination({
              pageNumber: response.data.data.pageNumber,
              totalPages: response.data.data.totalPages,
              totalElements: response.data.data.totalElements,
              pageSize: response.data.data.pageSize,
              first: response.data.data.first,
              last: response.data.data.last,
            });
          } else if (response.data.data && Array.isArray(response.data.data)) {
            // 다른 형태의 응답인 경우 처리 (배열로 직접 오는 경우)
            setBooks(response.data.data);
            setPagination({
              pageNumber: 1,
              totalPages: 1,
              totalElements: response.data.data.length,
              pageSize: response.data.data.length,
              first: true,
              last: true,
            });
          } else {
            // 데이터가 없는 경우
            setBooks([]);
            setPagination({
              pageNumber: 1,
              totalPages: 1,
              totalElements: 0,
              pageSize: 12,
              first: true,
              last: true,
            });
          }
        } else {
          throw new Error(response.data.error?.message || "데이터를 불러오는데 실패했습니다.");
        }
      } catch (err: any) {
        // console.error("Failed to fetch nest books:", err);
        // console.error("Error details:", err.response?.data || err.message);
        // console.error("Error status:", err.response?.status);

        // 403 에러 (인증 관련) 처리
        if (err.response && (err.response.status === 403 || err.response.status === 401)) {
          setIsAuthError(true);
          setError("로그인이 필요한 서비스입니다.");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("둥지 도서 목록을 불러오는데 실패했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    // 정렬된 도서 목록 업데이트 useEffect 추가
    useEffect(() => {
      const sorted = sortBooks(books, sortOption);
      setSortedBooks(sorted);
    }, [books, sortOption]);
    
    // 검색어로 필터링된 도서 목록 업데이트
    useEffect(() => {
      const filtered = filterBooksByTitle(sortedBooks, searchTerm);
      setFilteredBooks(filtered);
    }, [sortedBooks, searchTerm]);

    // 컴포넌트 마운트 시에 nestId 값이 존재하는지 로그로 확인
    useEffect(() => {
      // console.log("NestBookList 마운트 - Props 확인:", { propUserId, propNestId });
    }, [propUserId, propNestId]);

    // 컴포넌트 마운트 시 사용자 정보를 먼저 조회하고, 그 후 도서 목록 조회
    useEffect(() => {
      const initializeData = async () => {
        // console.log("initializeData 실행 - 현재 props:", { propUserId, propNestId });
        
        // props로 userId나 nestId가 전달되지 않은 경우 사용자 정보 조회
        if (!propUserId && !propNestId) {
          const userInfoData = await fetchUserInfo();
          if (userInfoData) {
            // 조회한 사용자 정보로 도서 목록 요청
            await fetchNestBooks(currentPage, userInfoData.userId, userInfoData.nestId);
          } else {
            // 사용자 정보 조회 실패 시 그냥 페이지네이션으로만 요청
            await fetchNestBooks(currentPage);
          }
        } else {
          // props로 전달된 값이 있는 경우 그대로 사용
          await fetchNestBooks(currentPage, propUserId, propNestId);
        }
      };

      initializeData();
    }, [currentPage, propUserId, propNestId]);

    const handlePageChange = (newPage: number) => {
      setCurrentPage(newPage);
    };

    const handleLoginClick = () => {
      // 현재 URL을 저장하고 로그인 페이지로 리다이렉트
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      navigate("/login");
    };

    const handleDeleteBook = async (bookId: number, event: React.MouseEvent) => {
      // 이벤트 버블링 방지 (Link 컴포넌트의 클릭 이벤트가 발생하지 않도록)
      event.preventDefault();
      event.stopPropagation();

      // 삭제 확인 모달 열기
      setBookToDelete(bookId);
      openModal('delete', "정말로 이 책을 둥지에서 삭제하시겠습니까?");
    };
    
    // 실제 삭제 처리 함수
    const confirmDeleteBook = async () => {
      if (!bookToDelete) return;
      
      try {
        setLoading(true);

        // 현재 사용자 정보 또는 prop으로 전달된 정보로 요청
        const effectiveNestId = propNestId || userInfo?.nestId;

        // API 요청 바디 구성
        const requestBody = {
          nestId: effectiveNestId,
          bookId: bookToDelete,
        };

        // DELETE 요청 보내기 (데이터를 바디에 포함)
        const response = await api.delete("/api/nest", {
          data: requestBody,
        });

        if (response.data.success) {
          // 삭제 성공 후 도서 목록에서 해당 도서 제거
          const updatedBooks = books.filter((book) => book.bookId !== bookToDelete);
          setBooks(updatedBooks);

          // 화면에 표시할 도서가 없어진 경우 목록 다시 불러오기
          if (updatedBooks.length === 0 && pagination.pageNumber > 1) {
            setCurrentPage(pagination.pageNumber - 1);
          } else if (updatedBooks.length === 0) {
            // 첫 페이지에서 마지막 항목이 삭제된 경우
            fetchNestBooks(currentPage, propUserId, effectiveNestId);
          }
          
          // 모달 닫기
          closeModal();
        } else {
          throw new Error(response.data.error?.message || "도서 삭제에 실패했습니다.");
        }
      } catch (err: any) {
        // console.error("Failed to delete book from nest:", err);
        // console.error("Error details:", err.response?.data || err.message);

        // 오류 메시지 모달 표시
        openModal('error', err.response?.data?.error?.message || "도서 삭제에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    // 페이지네이션 버튼 생성
    const renderPagination = () => {
      const pageButtons = [];
      const maxVisibleButtons = 5;

      let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
      let endPage = Math.min(pagination.totalPages, startPage + maxVisibleButtons - 1);

      // 표시되는 페이지 버튼 수 조정
      if (endPage - startPage + 1 < maxVisibleButtons && startPage > 1) {
        startPage = Math.max(1, endPage - maxVisibleButtons + 1);
      }

      // 이전 페이지 버튼
      pageButtons.push(
        <PageButton key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={pagination.first}>
          이전
        </PageButton>
      );

      // 페이지 번호 버튼
      for (let i = startPage; i <= endPage; i++) {
        pageButtons.push(
          <PageButton key={i} isActive={i === currentPage} onClick={() => handlePageChange(i)}>
            {i}
          </PageButton>
        );
      }

      // 다음 페이지 버튼
      pageButtons.push(
        <PageButton key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={pagination.last}>
          다음
        </PageButton>
      );

      return pageButtons;
    };

    // ref를 통해 외부에서 접근할 수 있는 메서드 정의
    useImperativeHandle(ref, () => ({
      fetchNestBooks: () => {
        if (userInfo) {
          fetchNestBooks(currentPage, userInfo.userId, userInfo.nestId);
        } else {
          fetchNestBooks(currentPage);
        }
      },
    }));

    // 다른 사람의 둥지인지 확인하는 로직 추가
    const isOtherUserNest = propUserId !== undefined && userInfo?.userId !== propUserId;

    if (loading && books.length === 0) {
      return <LoadingState>둥지 도서 목록을 불러오는 중...</LoadingState>;
    }

    if (isAuthError) {
      return (
        <LoginRequiredState>
          <div>로그인이 필요한 서비스입니다.</div>
          <LoginButton onClick={handleLoginClick}>로그인 하기</LoginButton>
        </LoginRequiredState>
      );
    }

    if (error && !isAuthError) {
      return <ErrorState>{error}</ErrorState>;
    }

    // 검색 결과가 없는 경우
    if (books.length > 0 && filteredBooks.length === 0 && searchTerm) {
      return <EmptyState>검색 결과가 없습니다.</EmptyState>;
    }

    if (books.length === 0) {
      return <EmptyState>둥지에 추가한 도서가 없습니다.</EmptyState>;
    }

    return (
      <Container>
        {/* 모달 컴포넌트 */}
        {modalType && (
          <ModalOverlay>
            <ModalContent>
              {modalType === 'delete' && (
                <>
                  <ModalTitle>
                    <FaExclamationCircle color="#dc2626" />
                    도서 삭제
                  </ModalTitle>
                  <p>{modalMessage}</p>
                  <ModalButtons>
                    <ModalButton onClick={closeModal}>취소</ModalButton>
                    <ModalButton 
                      isError 
                      onClick={confirmDeleteBook}
                    >
                      삭제
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
        
        <BookGrid viewMode={viewMode}>
          {filteredBooks.map((book) => (
            <BookCard key={`${book.bookId}-${book.createdAt}`} viewMode={viewMode}>
              {!isOtherUserNest && (
                <DeleteButton
                  onClick={(e) => handleDeleteBook(book.bookId, e)}
                  title="둥지에서 삭제"
                  className="delete-button"
                >
                  <FaTrash size={14} />
                </DeleteButton>
              )}
              <StyledLink to={`/book-detail/${book.bookId}`}>
                <BookCover viewMode={viewMode}>
                  <img src={book.imageUrl} alt={book.title} />
                  {viewMode === "cover" && (
                    <CoverOnlyTitle className="cover-title">{book.title}</CoverOnlyTitle>
                  )}
                </BookCover>
                {viewMode === "full" && (
                  <BookInfo>
                    <BookTitle>{book.title}</BookTitle>
                    <BookAuthor>{book.authors}</BookAuthor>
                    <RatingContainer>
                      <StarContainer>{renderRatingStars(book.userRating)}</StarContainer>
                      <RatingValue>{book.userRating.toFixed(1)}</RatingValue>
                    </RatingContainer>
                    <CreatedAtTag>{formatDate(book.createdAt)}</CreatedAtTag>
                    {book.userReview && <ReviewText>{book.userReview}</ReviewText>}
                  </BookInfo>
                )}
              </StyledLink>
            </BookCard>
          ))}
        </BookGrid>

        {pagination.totalPages > 1 && <PaginationContainer>{renderPagination()}</PaginationContainer>}
      </Container>
    );
  }
);

export default NestBookList;
