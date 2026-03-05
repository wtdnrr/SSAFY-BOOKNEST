import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../constants/paths';
import { FaStar } from 'react-icons/fa';

interface RatedBook {
  bookId: number;
  ratingId: number;
  bookName: string;
  imageUrl: string;
  rating: number;
  authors: string[];
  updatedAt: string;
}

interface ApiResponse {
  content: RatedBook[];
  pageNumber: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  first: boolean;
  last: boolean;
}

const Container = styled.div`
  max-width: 768px;
  margin: 0 auto;
  padding: 20px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
  text-align: center;
`;

const BookList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const BookCard = styled.div`
  display: flex;
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const BookCover = styled.img`
  width: 100px;
  height: 140px;
  object-fit: cover;
  border-radius: 8px;
`;

const BookInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
`;

const BookTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.3;
`;

const Authors = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  width: 100%;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const RatingValue = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #f39c12;
`;

const StarIcon = styled(FaStar)`
  color: #f39c12;
  font-size: 18px;
`;

const RatingDate = styled.div`
  font-size: 14px;
  color: #999;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
`;

const PageButton = styled.button<{ active?: boolean }>`
  padding: 8px 12px;
  border: 1px solid ${props => props.active ? '#007bff' : '#ddd'};
  background: ${props => props.active ? '#007bff' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:disabled {
    background: #f5f5f5;
    color: #999;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: ${props => props.active ? '#0056b3' : '#f8f9fa'};
  }
`;

const MyEvaluatedBookPage = () => {
  const { targetId } = useParams();
  const [books, setBooks] = useState<RatedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchRatedBooks = async (page: number) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        size: '10'
      });
      
      if (targetId && targetId !== 'undefined') {
        params.append('targetId', targetId);
      }

      const response = await api.get<{ success: boolean; data: ApiResponse; error: null }>(
        `/api/book/rating?${params.toString()}`
      );

      // console.log('API Response:', response.data);

      if (response.data.success) {
        setBooks(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
      } else {
        setError('평가한 책 목록을 불러오는데 실패했습니다.');
      }
    } catch (error: any) {
      // console.error('Failed to fetch rated books:', error);
      
      if (error.response?.status === 401) {
        alert('로그인이 필요한 서비스입니다.');
        navigate(ROUTES.LOGIN);
        return;
      }
      
      if (error.response?.status === 403) {
        alert('접근 권한이 없습니다. 다시 로그인해주세요.');
        navigate(ROUTES.LOGIN);
        return;
      }

      setError('평가한 책 목록을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatedBooks(currentPage);
  }, [currentPage, targetId, navigate]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <Container>로딩 중...</Container>;
  }

  if (error) {
    return <Container>{error}</Container>;
  }

  if (!books || books.length === 0) {
    return (
      <Container>
        <PageTitle>{targetId ? '사용자의 평가한 책' : '내가 평가한 책'}</PageTitle>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          아직 평가한 책이 없습니다.
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <PageTitle>{targetId ? '사용자의 평가한 책' : '내가 평가한 책'}</PageTitle>
      <BookList>
        {books.map((book) => (
          <BookCard 
            key={book.ratingId}
            onClick={() => navigate(`/book-detail/${book.bookId}`)}
          >
            <BookCover src={book.imageUrl} alt={book.bookName} />
            <BookInfo>
              <div>
                <BookTitle>{book.bookName}</BookTitle>
                <Authors>
                  {book.authors.length <= 1 
                    ? book.authors.join(', ')
                    : book.authors.length <= 2
                      ? book.authors.join(', ')
                      : `${book.authors[0]} 외 ${book.authors.length - 1}명`
                  }
                </Authors>
                <RatingContainer>
                  <StarIcon />
                  <RatingValue>{book.rating.toFixed(1)}</RatingValue>
                </RatingContainer>
              </div>
              <RatingDate>{formatDate(book.updatedAt)}</RatingDate>
            </BookInfo>
          </BookCard>
        ))}
      </BookList>
      <Pagination>
        <PageButton
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          이전
        </PageButton>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <PageButton
            key={page}
            active={page === currentPage}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </PageButton>
        ))}
        <PageButton
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          다음
        </PageButton>
      </Pagination>
    </Container>
  );
};

export default MyEvaluatedBookPage; 