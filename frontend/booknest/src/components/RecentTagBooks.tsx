import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { ROUTES } from '../constants/paths';

interface Book {
  book_id: number;
  title: string;
  published_date: string;
  image_url: string;
  authors: string;
  categories: string;
  tags: string;
}

interface RecentTagResponse {
  success: boolean;
  data: Book[];
  error: null | string;
}

const Container = styled.div`
  padding: 16px;
  position: relative;
  
  @media (min-width: 768px) {
    padding: 20px;
  }
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  line-height: 1.4;
  
  @media (min-width: 768px) {
    font-size: 22px;
    margin-bottom: 20px;
    gap: 6px;
  }
`;

const TagHighlight = styled.span`
  color: #00c473;
  font-weight: bold;
`;

const NicknameHighlight = styled.span`
  color: #00c473;
  font-weight: bold;
`;

const BookListContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  margin: 0 -16px;
  padding: 0 16px;
  -webkit-overflow-scrolling: touch; /* Better iOS scrolling */
  overscroll-behavior-x: contain; /* Prevent overscroll on Android */
  
  @media (min-width: 768px) {
    margin: 0;
    padding: 0;
  }
`;

const BookList = styled.div`
  display: flex;
  gap: 12px;
  transition: transform 0.3s ease;
  padding: 10px 0;
  touch-action: pan-x; /* Optimize for horizontal touch */
  will-change: transform; /* Optimize performance on Android */
  
  @media (min-width: 768px) {
    gap: 20px;
  }
`;

const BookCard = styled.div`
  flex: 0 0 140px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  @media (min-width: 768px) {
    flex: 0 0 200px;
  }
`;

const BookImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  background-color: #f5f5f5;
  
  @media (min-width: 768px) {
    height: 280px;
  }
`;

const BookInfo = styled.div`
  padding: 12px;
  
  @media (min-width: 768px) {
    padding: 15px;
  }
`;

const BookTitle = styled.h3`
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 6px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  max-height: 2.8em; /* Approximately 2 lines */
  line-height: 1.4;
  
  /* Let short titles appear on one line */
  &:not(.force-two-lines) {
    white-space: normal;
  }
  
  /* Titles that don't overflow will naturally stay on one line */
  
  @media (min-width: 768px) {
    font-size: 16px;
    margin-bottom: 8px;
    max-height: 1.5em; /* One line for wider screens */
    -webkit-line-clamp: 1;
    line-clamp: 1;
    white-space: nowrap;
  }
`;

const BookAuthor = styled.p`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  @media (min-width: 768px) {
    font-size: 14px;
    margin-bottom: 5px;
  }
`;

const BookDate = styled.p`
  font-size: 11px;
  color: #999;
  
  @media (min-width: 768px) {
    font-size: 12px;
  }
`;

const NavigationButton = styled.button<{ direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${props => props.direction === 'left' ? 'left: 4px;' : 'right: 4px;'}
  transform: translateY(-50%);
  width: 40px;
  height: 60px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s ease-in-out;

  @media (min-width: 768px) {
    ${props => props.direction === 'left' ? 'left: -18px;' : 'right: -18px;'}
    width: 60px;
    height: 80px;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transform: translateY(-50%) scale(1.05);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }

  &:disabled {
    opacity: 0;
    cursor: default;
    pointer-events: none;
  }

  &::before {
    content: '';
    width: 16px;
    height: 16px;
    border-top: 3px solid #555;
    border-right: 3px solid #555;
    transform: ${props => props.direction === 'left' ? 'rotate(-135deg) translateX(2px)' : 'rotate(45deg) translateX(-2px)'};
    transition: border-color 0.2s ease;
  }

  &:hover::before {
    border-color: #333;
  }
`;

const ErrorMessage = styled.div`
  color: #ff0000;
  padding: 16px;
  text-align: center;
  background-color: #fff3f3;
  border-radius: 8px;
  margin: 16px 0;
  font-size: 14px;
  
  @media (min-width: 768px) {
    padding: 20px;
    margin: 20px 0;
    font-size: 16px;
  }
`;

// Replace with nicer error UI
const FriendlyErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  margin: 16px 0;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
  width: 100%;
  
  @media (min-width: 768px) {
    padding: 40px 24px;
    margin: 24px 0;
  }
`;

const ErrorContent = styled.div`
  max-width: 500px;
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ErrorIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  color: #7bc47f;
`;

const ErrorTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8px;
  width: 100%;
  word-break: keep-all;
  white-space: normal;
  
  @media (min-width: 768px) {
    font-size: 20px;
  }
`;

const ErrorText = styled.p`
  font-size: 16px;
  color: #666666;
  margin-bottom: 24px;
  width: 100%;
  line-height: 1.5;
  word-break: keep-all;
  white-space: normal;
  padding: 0 8px;
`;

const ActionButton = styled.button`
  background-color: #7bc47f;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: #6ab36e;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 32px;
  color: #666;
  font-size: 14px;
  
  @media (min-width: 768px) {
    padding: 40px;
    font-size: 16px;
  }
`;

const RecentTagBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const bookListRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { userDetail } = useAuthStore();
  
  // Add touch state for mobile swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const SCROLL_AMOUNT = window.innerWidth < 768 ? 300 : 400;

  const handleScroll = (direction: 'left' | 'right') => {
    if (!bookListRef.current) return;

    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - SCROLL_AMOUNT)
      : Math.min(
          bookListRef.current.scrollWidth - bookListRef.current.clientWidth,
          scrollPosition + SCROLL_AMOUNT
        );

    setScrollPosition(newPosition);
    bookListRef.current.style.transform = `translateX(-${newPosition}px)`;
  };
  
  // Add touch event handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.innerWidth < 768) {
      setTouchStart(e.targetTouches[0].clientX);
      setIsScrolling(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart !== null && window.innerWidth < 768) {
      setTouchEnd(e.targetTouches[0].clientX);
      
      // Calculate how far we've moved
      const diff = touchStart - e.targetTouches[0].clientX;
      
      // If significant movement, prevent default scrolling in some cases
      if (Math.abs(diff) > 10) {
        // Check if we're at the boundaries
        if (bookListRef.current) {
          const { scrollWidth, clientWidth } = bookListRef.current;
          const maxScroll = scrollWidth - clientWidth;
          
          // Only prevent default if we're not at the boundaries
          if ((diff > 0 && scrollPosition < maxScroll) || 
              (diff < 0 && scrollPosition > 0)) {
            e.preventDefault();
            setIsScrolling(true);
          }
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;  // Swiping left (scrolls content right)
    const isRightSwipe = distance < -50; // Swiping right (scrolls content left)
    
    if (isLeftSwipe) {
      handleScroll('right');
    }
    
    if (isRightSwipe) {
      handleScroll('left');
    }
    
    // Reset touch states
    setTouchStart(null);
    setTouchEnd(null);
    setIsScrolling(false);
  };

  // Add passive event listener for better performance on Android
  useEffect(() => {
    const bookList = bookListRef.current;
    if (!bookList) return;

    // Add passive event listeners for better performance
    const options = { passive: true };
    
    const handleTouchStartPassive = (e: TouchEvent) => {
      if (window.innerWidth < 768) {
        setTouchStart(e.touches[0].clientX);
        setIsScrolling(false);
      }
    };
    
    const handleTouchMovePassive = (e: TouchEvent) => {
      if (touchStart !== null && window.innerWidth < 768) {
        setTouchEnd(e.touches[0].clientX);
      }
    };
    
    bookList.addEventListener('touchstart', handleTouchStartPassive, options);
    bookList.addEventListener('touchmove', handleTouchMovePassive, options);
    
    return () => {
      bookList.removeEventListener('touchstart', handleTouchStartPassive);
      bookList.removeEventListener('touchmove', handleTouchMovePassive);
    };
  }, [touchStart]);

  const handleBookClick = (book_id: number) => {
    navigate(`/book-detail/${book_id}`);
  };

  useEffect(() => {
    const fetchRecentTagBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get<RecentTagResponse>('/api/book/today', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });
        
        if (response.data.success && response.data.data) {
          setBooks(response.data.data);
        } else {
          setError('최근 키워드 기반 추천 도서 정보를 불러오는데 실패했습니다.');
          setBooks([]);
        }
      } catch (err) {
        console.error('API Error:', err);
        // 500 에러일 경우 회원가입 당일 메시지 표시
        if (err.response && err.response.status === 500) {
          setError('오늘의 추천은 회원가입한 날에는 볼 수 없어요. 내일 만나요!');
        } else {
          setError('서버 오류가 발생했습니다.');
        }
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTagBooks();
  }, []);

  if (loading) {
    return <LoadingMessage>최근 태그 기반 추천 도서 목록을 불러오는 중...</LoadingMessage>;
  }

  if (error) {
    // Check if it's the signup day message
    const isSignupDayMessage = error.includes('회원가입한 날에는 볼 수 없어요');
    
    return (
      <FriendlyErrorContainer>
        <ErrorContent>
          <ErrorIcon>
            {isSignupDayMessage ? '🌱' : '📚'}
          </ErrorIcon>
          <ErrorTitle>
            {isSignupDayMessage ? '내일부터 만나요!' : '잠시 문제가 발생했어요'}
          </ErrorTitle>
          <ErrorText>{error}</ErrorText>
          {isSignupDayMessage && (
            <ActionButton onClick={() => navigate(ROUTES.EVALUATE_BOOK)}>
              평가하러 가기
            </ActionButton>
          )}
        </ErrorContent>
      </FriendlyErrorContainer>
    );
  }

  if (!books.length) {
    return null;
  }

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = bookListRef.current 
    ? scrollPosition < bookListRef.current.scrollWidth - bookListRef.current.clientWidth
    : false;

  // 태그 추출 (첫 번째 책의 태그 사용)
  const tags = books.length > 0 && books[0]?.tags 
    ? books[0].tags.split(',').slice(0, 3) 
    : [];

  return (
    <Container>
      <Title>
        <NicknameHighlight>{userDetail?.nickname}</NicknameHighlight>님의 취향이 가득한 오늘의 도서
      </Title>
      <BookListContainer>
        {canScrollLeft && (
          <NavigationButton 
            direction="left" 
            onClick={() => handleScroll('left')}
          />
        )}
        <BookList 
          ref={bookListRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {books.map((book) => (
            <BookCard 
              key={book.book_id}
              onClick={() => handleBookClick(book.book_id)}
            >
              <BookImage 
                src={book.image_url || '/images/default-book.png'} 
                alt={book.title}
              />
              <BookInfo>
                <BookTitle>{book.title}</BookTitle>
                <BookAuthor>{book.authors}</BookAuthor>
                <BookDate>{book.published_date}</BookDate>
              </BookInfo>
            </BookCard>
          ))}
        </BookList>
        {canScrollRight && (
          <NavigationButton 
            direction="right" 
            onClick={() => handleScroll('right')}
          />
        )}
      </BookListContainer>
    </Container>
  );
};

export default RecentTagBooks; 