import { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useBookStore } from '../store/useBookStore';

interface Book {
  bookId: number;
  title: string;
  publishedDate: string;
  imageUrl: string;
  authors: string[];
  tag: string;
}

interface TagBooksResponse {
  success: boolean;
  data: {
    description: string;
    books: Book[];
  };
  error: null | {
    code: string;
    message: string;
  };
}

const TagBooksContainer = styled.div`
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
  
  @media (min-width: 768px) {
    font-size: 22px;
    margin-bottom: 20px;
  }
`;

const HighlightTag = styled.span`
  color: #00c473;
  font-weight: bold;
`;

const TagHighlight = styled.span`
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
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.3;
  height: 2.6em;
  
  @media (min-width: 768px) {
    font-size: 16px;
    margin-bottom: 8px;
  }
`;

const BookAuthor = styled.p`
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  margin-bottom: 4px;
  
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

const BookTag = styled.span`
  display: inline-block;
  padding: 2px 8px;
  background-color: #f0f8f1;
  color: #00c473;
  border-radius: 12px;
  font-size: 11px;
  margin-top: 4px;
  
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
  z-index: 1;
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

const TagBooks = () => {
  const [tagBooks, setTagBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [tag, setTag] = useState<string>('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const bookListRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
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

  const handleBookClick = (bookId: number) => {
    navigate(`/book-detail/${bookId}`);
  };

  const extractTagFromBooks = (books: Book[]) => {
    return books.length > 0 ? books[0].tag : '';
  };

  // 저자 표시 형식 변환
  const formatAuthors = (authors: string[]) => {
    if (!authors || !Array.isArray(authors)) return '작가 미상';
    
    if (authors.length <= 1) return authors.join(', ');
    if (authors.length <= 2) return authors.join(', ');
    return `${authors[0]} 외 ${authors.length - 1}명`;
  };

  useEffect(() => {
    const fetchTagBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get<TagBooksResponse>('/api/book/tag', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        });
        
        if (response.data.success && response.data.data) {
          setTagBooks(response.data.data.books);
          setDescription(response.data.data.description);
          const extractedTag = extractTagFromBooks(response.data.data.books);
          setTag(extractedTag);
        } else {
          setError('태그별 추천 도서 정보를 불러오는데 실패했습니다.');
          setTagBooks([]);
        }
      } catch (err) {
        // console.error('API Error:', err);
        setError('서버 오류가 발생했습니다.');
        setTagBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTagBooks();
  }, []);

  if (loading) {
    return <LoadingMessage>태그별 추천 도서 목록을 불러오는 중...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (!tagBooks || tagBooks.length === 0) {
    return <ErrorMessage>태그별 추천 도서 목록이 없습니다.</ErrorMessage>;
  }

  const extractedTag = extractTagFromBooks(tagBooks);
  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = bookListRef.current 
    ? scrollPosition < bookListRef.current.scrollWidth - bookListRef.current.clientWidth
    : false;

  return (
    <TagBooksContainer>
      <Title>
        <TagHighlight>#{extractedTag}</TagHighlight> 도서는 어떠세요?
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
          {tagBooks.map((book) => (
            <BookCard 
              key={book.bookId}
              onClick={() => handleBookClick(book.bookId)}
            >
              <BookImage 
                src={book.imageUrl || '/images/default-book.png'} 
                alt={book.title}
              />
              <BookInfo>
                <BookTitle>{book.title}</BookTitle>
                <BookAuthor>{formatAuthors(book.authors)}</BookAuthor>
                <BookDate>{book.publishedDate}</BookDate>
                <BookTag>#{book.tag}</BookTag>
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
    </TagBooksContainer>
  );
};

export default TagBooks; 