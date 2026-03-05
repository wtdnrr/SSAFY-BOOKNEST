import React, { useState } from "react";
import styled from "styled-components";
import api from "../api/axios";
import { useAuthStore } from "../store/useAuthStore";
import RatingStars from "./RatingStars";
import useNestStore from "../store/useNestStore";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTimes, FaCheckCircle } from "react-icons/fa";

interface BookSearchModalProps {
  onClose: () => void;
  onBookAdded?: () => void;
}

interface Book {
  bookId: number;
  title: string;
  imageURL: string;
  authors: string;
}

interface SearchResponse {
  content: Book[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

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
  max-width: 700px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  position: relative;
`;

const ModalTitle = styled.h2`
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  text-align: center;
`;

const SearchInputContainer = styled.div`
  position: relative;
  margin-bottom: 25px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 40px 12px 50px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: all 0.2s;
  background-color: #f9f9f9;
  
  &:focus {
    border-color: #00c473;
    box-shadow: 0 0 0 3px rgba(0, 196, 115, 0.1);
    background-color: white;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
`;

const SearchButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  padding: 6px 12px;
  background-color: #00c473;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #00b368;
  }
`;

const BookGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
`;

const BookCard = styled.div`
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
`;

const BookCardContent = styled.div`
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const BookTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.3;
  color: #333;
`;

const BookAuthor = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  line-height: 1.3;
  margin-top: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #777;
  font-size: 18px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
    color: #333;
  }
`;

const RatingModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
`;

const RatingContent = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const RatingTitle = styled.h3`
  margin-bottom: 20px;
  color: #333;
  font-weight: 600;
`;

const RatingContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
`;

const ConfirmButton = styled(Button)`
  background-color: #00c473;
  color: white;
  border: none;

  &:hover {
    background-color: #00b368;
  }
`;

const CancelButton = styled(Button)`
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #e0e0e0;

  &:hover {
    background-color: #e5e5e5;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
`;

const PageButton = styled.button<{ active?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#00c473' : '#f5f5f5'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 1px solid ${props => props.active ? '#00c473' : '#e0e0e0'};
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.active ? '#00b368' : '#e5e5e5'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NavButton = styled(PageButton)`
  background-color: white;
  color: #333;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const TotalResults = styled.div`
  text-align: center;
  margin-bottom: 16px;
  font-size: 14px;
  color: #666;
`;

const NoResultsMessage = styled.div`
  text-align: center;
  padding: 40px 0;
  color: #666;
  font-size: 16px;
`;

const SuccessModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
`;

const SuccessContent = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SuccessIcon = styled.div`
  color: #00c473;
  font-size: 48px;
  margin-bottom: 16px;
`;

const SuccessTitle = styled.h3`
  margin-bottom: 16px;
  color: #333;
  font-weight: 600;
`;

const SuccessButton = styled(Button)`
  background-color: #00c473;
  color: white;
  border: none;
  width: 100%;
  max-width: 200px;
  margin-top: 16px;

  &:hover {
    background-color: #00b368;
  }
`;

const BookSearchModal: React.FC<BookSearchModalProps> = ({ onClose, onBookAdded }) => {
  const { userDetail } = useAuthStore();
  const { setNestStatus } = useNestStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedBook, setAddedBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const navigate = useNavigate();
  
  const BOOKS_PER_PAGE = 9;

  const searchBooks = async (page = 1) => {
    try {
      const response = await api.get("/api/search/book", {
        params: {
          title: searchTerm,
          page: page,
          size: BOOKS_PER_PAGE,
        },
      });
      
      if (response.data.success) {
        const searchData: SearchResponse = response.data.data;
        setBooks(searchData.content);
        setTotalPages(searchData.totalPages);
        setTotalElements(searchData.totalElements);
        setCurrentPage(page);
      }
    } catch (error) {
      // console.error("도서 검색 실패:", error);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      searchBooks(newPage);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchBooks(1);
    }
  };

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setShowRatingModal(true);
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleConfirmRating = async () => {
    if (rating === 0) {
      alert("평점을 선택해주세요.");
      return;
    }

    if (!selectedBook) return;

    try {
      // 평점은 이미 RatingStars 컴포넌트에서 등록되었으므로 바로 둥지에 추가
      if (!userDetail?.nestId) {
        alert("사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.");
        return;
      }

      const requestData = {
        bookId: selectedBook.bookId.toString(),
        nestId: userDetail.nestId.toString(),
        rating: Math.round(rating).toString(),
        review: null,
      };
      // console.log("Request Data:", requestData);

      const response = await api.post("/api/nest", requestData);

      if (response.data.success) {
        // 서재 등록 상태 업데이트
        if (selectedBook) {
          setNestStatus(selectedBook.bookId, true);
        }
        
        // 별점 모달만 닫고 성공 모달 표시
        setShowRatingModal(false);
        setAddedBook(selectedBook);
        setShowSuccessModal(true);
        
        // onBookAdded 콜백을 호출하여 외부 컴포넌트에 알림
        if (onBookAdded) {
          onBookAdded();
        }
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
      } else if (error.response?.status === 403) {
        alert("권한이 없습니다. 인증 토큰을 확인해주세요.");
      } else {
        const errorMessage = error.response?.data?.message || "둥지 등록 중 오류가 발생했습니다.";
        alert(errorMessage);
      }
    }
  };

  const handleCancelRating = () => {
    setShowRatingModal(false);
    setSelectedBook(null);
    setRating(0);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setAddedBook(null);
  };

  // 페이지 버튼 렌더링 함수
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxButtons = 5; // 한 번에 보이는 페이지 버튼 수
    const halfMaxButtons = Math.floor(maxButtons / 2);
    
    let startPage = Math.max(1, currentPage - halfMaxButtons);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    // 이전 페이지 버튼
    pages.push(
      <PageButton 
        key="prev" 
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &lt;
      </PageButton>
    );
    
    // 페이지 번호 버튼
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PageButton 
          key={i} 
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </PageButton>
      );
    }
    
    // 다음 페이지 버튼
    pages.push(
      <PageButton 
        key="next" 
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &gt;
      </PageButton>
    );
    
    return pages;
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalTitle>도서 검색</ModalTitle>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>

        <SearchInputContainer>
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="도서 제목을 입력하세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <SearchButton onClick={handleSearch}>검색</SearchButton>
        </SearchInputContainer>

        {totalElements > 0 && (
          <TotalResults>총 {totalElements}개의 검색 결과</TotalResults>
        )}

        {books.length > 0 ? (
          <BookGrid>
            {books.map((book) => (
              <BookCard key={book.bookId} onClick={() => handleBookSelect(book)}>
                <img src={book.imageURL} alt={book.title} />
                <BookCardContent>
                  <BookTitle>{book.title}</BookTitle>
                  <BookAuthor>{book.authors}</BookAuthor>
                </BookCardContent>
              </BookCard>
            ))}
          </BookGrid>
        ) : searchTerm ? (
          <NoResultsMessage>검색 결과가 없습니다.</NoResultsMessage>
        ) : null}

        {totalPages > 1 && (
          <Pagination>
            <NavButton
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              &laquo;
            </NavButton>
            <NavButton
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lsaquo;
            </NavButton>
            {renderPagination()}
            <NavButton
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &rsaquo;
            </NavButton>
            <NavButton
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              &raquo;
            </NavButton>
          </Pagination>
        )}

        {showRatingModal && selectedBook && (
          <RatingModal>
            <RatingContent>
              <RatingTitle>"{selectedBook.title}" 책에 별점을 주세요</RatingTitle>
              <RatingContainer>
                <RatingStars
                  bookId={selectedBook.bookId} 
                  onRatingChange={handleRatingChange}
                />
              </RatingContainer>
              <ButtonGroup>
                <ConfirmButton onClick={handleConfirmRating}>확인</ConfirmButton>
                <CancelButton onClick={handleCancelRating}>취소</CancelButton>
              </ButtonGroup>
            </RatingContent>
          </RatingModal>
        )}

        {showSuccessModal && addedBook && (
          <SuccessModal>
            <SuccessContent>
              <SuccessIcon>
                <FaCheckCircle />
              </SuccessIcon>
              <SuccessTitle>둥지에 책이 추가되었습니다!</SuccessTitle>
              <BookTitle>"{addedBook.title}"</BookTitle>
              <SuccessButton onClick={handleCloseSuccessModal}>
                확인
              </SuccessButton>
            </SuccessContent>
          </SuccessModal>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default BookSearchModal;
