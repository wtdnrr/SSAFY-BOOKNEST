import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuthStore } from "../store/useAuthStore";
import { FaList, FaTh, FaSort, FaChevronDown } from "react-icons/fa";


interface BookmarkItem {
  bookId: number;
  title: string;
  authors: string[];
  imageUrl: string;
  createdAt: string;
}

interface PaginationInfo {
  pageNumber: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  first: boolean;
  last: boolean;
}

const Container = styled.div`
  width: 100%;
`;

const BookGrid = styled.div<{ viewMode?: "full" | "cover" }>`
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

const BookCard = styled.div<{ viewMode?: "full" | "cover" }>`
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
  
  &:hover .cover-title {
    opacity: 1;
  }
`;

const BookCover = styled.div<{ viewMode?: "full" | "cover" }>`
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

const CreatedAt = styled.p`
  margin: 0;
  font-size: 12px;
  color: #888;
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

const ControlsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
  gap: 10px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    justify-content: flex-end;
    gap: 6px;
  }
`;

const ViewModeButton = styled.button<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background-color: ${(props) => (props.isActive ? "#00c473" : "white")};
  color: ${(props) => (props.isActive ? "white" : "#333")};
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.isActive ? "#00b368" : "#f5f5f5")};
  }
  
  @media (max-width: 768px) {
    padding: 6px;
    font-size: 12px;
  }
`;

const SortContainer = styled.div`
  position: relative;
`;

const SortButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f5f5f5;
  }
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    gap: 4px;
    font-size: 12px;
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: ${(props) => (props.isOpen ? "block" : "none")};
  z-index: 10;
`;

const DropdownItem = styled.button<{ isActive: boolean }>`
  display: block;
  width: 100%;
  padding: 8px 16px;
  text-align: left;
  border: none;
  background-color: ${(props) => (props.isActive ? "#f5f5f5" : "white")};
  cursor: pointer;
  font-size: 14px;
  color: #333;

  &:hover {
    background-color: #f5f5f5;
  }
`;

// Add styled Link component
const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
`;

// 페이지네이션 관련 스타일 추가
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

// BookmarkListProps 인터페이스에 viewMode 속성 추가
interface BookmarkListProps {
  userId?: number;
  viewMode?: "full" | "cover";
  sortOption?: "latest" | "oldest" | "rating" | "title";
}

// 표지만 보기 모드를 위한 타이틀 오버레이 추가
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

const BookmarkList: React.FC<BookmarkListProps> = ({ userId, viewMode: initialViewMode = "full", sortOption: initialSortOption = "latest" }) => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"full" | "cover">(initialViewMode);
  const [sortOption, setSortOption] = useState<"latest" | "oldest" | "rating" | "title">(initialSortOption);
  const [pagination, setPagination] = useState<PaginationInfo>({
    pageNumber: 1,
    totalPages: 1,
    totalElements: 0,
    pageSize: 12,
    first: true,
    last: true,
  });
  const { userDetail } = useAuthStore();
  const navigate = useNavigate();

  // 정렬 옵션에 따른 API 파라미터 반환
  const getSortParameter = (option: string) => {
    switch (option) {
      case "latest":
        return "createdAt,desc";
      case "oldest":
        return "createdAt,asc";
      case "rating":
        return "rating,desc";
      case "title":
        return "title,asc";
      default:
        return "createdAt,desc";
    }
  };

  const fetchBookmarks = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      setIsAuthError(false);

      // console.log("북마크 목록 조회 시작");
      const response = await api.get("/api/nest/bookmark", {
        params: {
          page: page - 1,
          size: 12,
          sort: getSortParameter(sortOption)
        }
      });
      // console.log("북마크 목록 응답:", response.data);

      if (response.data.success) {
        // API 응답 형식에 따라 다르게 처리
        if (response.data.data && response.data.data.content) {
          // 페이지네이션이 적용된 API 응답 형식
          setBookmarks(response.data.data.content);
          setPagination({
            pageNumber: response.data.data.pageNumber,
            totalPages: response.data.data.totalPages,
            totalElements: response.data.data.totalElements,
            pageSize: response.data.data.pageSize,
            first: response.data.data.first,
            last: response.data.data.last,
          });
        } else if (Array.isArray(response.data.data)) {
          // 데이터가 단순 배열로 오는 경우 - 클라이언트 사이드 페이지네이션 적용
          const allBookmarks = response.data.data;
          const pageSize = 12;
          const totalPages = Math.ceil(allBookmarks.length / pageSize);
          const startIndex = (page - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          const paginatedBookmarks = allBookmarks.slice(startIndex, endIndex);

          setBookmarks(paginatedBookmarks);
          setPagination({
            pageNumber: page,
            totalPages: totalPages,
            totalElements: allBookmarks.length,
            pageSize: pageSize,
            first: page === 1,
            last: page === totalPages,
          });
        } else {
          // 데이터가 없는 경우
          setBookmarks([]);
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
        throw new Error(response.data.error?.message || "북마크 목록을 불러오는데 실패했습니다.");
      }
    } catch (err: any) {
      // console.error("Failed to fetch bookmarks:", err);
      // console.error("Error details:", err.response?.data || err.message);
      // console.error("Error status:", err.response?.status);

      // 403 에러 (인증 관련) 처리
      if (err.response && (err.response.status === 403 || err.response.status === 401)) {
        setIsAuthError(true);
        setError("로그인이 필요한 서비스입니다.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("북마크 목록을 불러오는데 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 클라이언트 측 정렬 함수
  const sortBookmarks = (books: BookmarkItem[]) => {
    return [...books].sort((a, b) => {
      switch (sortOption) {
        case "latest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  };

  useEffect(() => {
    fetchBookmarks(currentPage);
  }, [userDetail, currentPage, sortOption]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && !(event.target as Element).closest(".sort-container")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLoginClick = () => {
    // 현재 URL을 저장하고 로그인 페이지로 리다이렉트
    localStorage.setItem("redirectAfterLogin", window.location.pathname);
    navigate("/login");
  };

  const formatAuthors = (authors: string[]) => {
    return authors.join(", ");
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0); // 페이지 변경 시 상단으로 스크롤
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

  const toggleViewMode = (mode: "full" | "cover") => {
    setViewMode(mode);
  };

  const toggleSortDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSortChange = (option: "latest" | "oldest" | "rating" | "title") => {
    setSortOption(option);
    setIsDropdownOpen(false);
  };

  const getSortLabel = () => {
    switch (sortOption) {
      case "latest":
        return "최신순";
      case "oldest":
        return "오래된순";
      case "rating":
        return "평점순";
      case "title":
        return "제목순";
      default:
        return "최신순";
    }
  };

  if (loading && bookmarks.length === 0) {
    return <LoadingState>북마크 목록을 불러오는 중...</LoadingState>;
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

  if (bookmarks.length === 0) {
    return <EmptyState>찜한 도서가 없습니다.</EmptyState>;
  }

  const sortedBookmarks = sortBookmarks(bookmarks);

  return (
    <Container>
      <ControlsContainer>
        <div style={{ display: 'flex', gap: '4px' }}>
          <ViewModeButton 
            isActive={viewMode === "full"} 
            onClick={() => toggleViewMode("full")}
            aria-label="전체 보기"
          >
            <FaList />
          </ViewModeButton>
          <ViewModeButton 
            isActive={viewMode === "cover"} 
            onClick={() => toggleViewMode("cover")}
            aria-label="표지만 보기"
          >
            <FaTh />
          </ViewModeButton>
        </div>
        
        <SortContainer className="sort-container">
          <SortButton onClick={toggleSortDropdown}>
            <FaSort />
            {getSortLabel()}
            <FaChevronDown />
          </SortButton>
          <DropdownMenu isOpen={isDropdownOpen}>
            <DropdownItem 
              isActive={sortOption === "latest"} 
              onClick={() => handleSortChange("latest")}
            >
              최신순
            </DropdownItem>
            <DropdownItem 
              isActive={sortOption === "oldest"} 
              onClick={() => handleSortChange("oldest")}
            >
              오래된순
            </DropdownItem>
            <DropdownItem 
              isActive={sortOption === "rating"} 
              onClick={() => handleSortChange("rating")}
            >
              평점순
            </DropdownItem>
            <DropdownItem 
              isActive={sortOption === "title"} 
              onClick={() => handleSortChange("title")}
            >
              제목순
            </DropdownItem>
          </DropdownMenu>
        </SortContainer>
      </ControlsContainer>
      
      <BookGrid viewMode={viewMode}>
        {sortedBookmarks.map((book) => (
          <BookCard key={`${book.bookId}-${book.createdAt}`} viewMode={viewMode}>
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
                  <BookAuthor>{formatAuthors(book.authors)}</BookAuthor>
                  <CreatedAt>찜한 날짜: {new Date(book.createdAt).toLocaleDateString()}</CreatedAt>
                </BookInfo>
              )}
            </StyledLink>
          </BookCard>
        ))}
      </BookGrid>
      
      {pagination.totalPages > 1 && (
        <PaginationContainer>
          {renderPagination()}
        </PaginationContainer>
      )}
    </Container>
  );
};

export default BookmarkList;
