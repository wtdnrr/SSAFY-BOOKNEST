import React, { useEffect, useState } from "react";
import styled from "styled-components";
import api from "../api/axios";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/paths";
import { theme } from "../styles/theme";

interface Book {
  book_id: number;
  image_url: string;
  published_date: string;
  index_content: string;
  publisher_review: string;
  title: string;
  isbn: string;
  publisher: string;
  pages: number;
  intro: string;
  authors: string;
  categories: string;
  tags: string;
}
const MainContainer = styled.div`
  top: ${theme.layout.headerHeight};
  width: 100vw;
  height: calc(100vh - ${theme.layout.headerHeight});
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  position: relative;
`;

const SlideContainer = styled.div`
  width: 100%;
  height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SlideCard = styled.div`
  width: 100%;
  height: 100%;
  justify-content: flex-end;
`;

const SlideImageContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 70vh;
  background-color: black;
  overflow: hidden;
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.5) 30%, rgba(0, 0, 0, 1) 100%);
    pointer-events: none;
  }
`;

const SlideImageBg = styled.img`
  position: absolute;
  width: 100%;
  height: 70vh;
  object-fit: cover;
  filter: blur(10px);
  transform: scale(1.1);
`;

const SlideImage = styled.img`
  position: absolute;
  width: auto;
  height: 70vh;
  background-color: black;
  left: 50%;
  transform: translateX(-50%);
`;

const SlideInfo = styled.div`
  position: absolute;
  width: 100%;
  height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  justify-content: flex-end;
  padding: 3.5%;
`;

const BookTitle = styled.h2`
  font-size: 30px;
  color: white;
`;
const AuthorButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const BookAuthor = styled.p`
  font-size: 16px;
  color: #cccccc;
`;

const BookDescription = styled.p`
  font-size: 1rem;
  color: white;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  color: #fff;
`;

const NavigationButton = styled.button<{ direction: "left" | "right" }>`
  position: absolute;
  ${(props) => props.direction}: 20px;
  top: 35%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const BasicInfo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DetailButton = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
`;

const EvaluateButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #f5f5f5;
  top: 2rem;
  padding: 1rem 2rem;
  color: #1a1a1a;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 93%;
  max-width: 400px;

  &:hover {
    background-color: #ebebeb;
  }
`;

const DetailInfo = styled.div<{ isVisible: boolean }>`
  display: ${(props) => (props.isVisible ? "block" : "none")};
  margin-top: 20px;
`;

// TodaysPage 컴포넌트 내부에 상태 추가
const TodaysPage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // 추가
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await api.get("/api/book/recent-keyword");
        if (response.data.success) {
          setBooks(response.data.data);
          setTimeout(() => {
            setIsLoading(false);
          }, 1000); // 1초 딜레이
        }
      } catch (error) {
        // console.error("추천 도서 목록을 불러오는데 실패했습니다:", error);
        setIsLoading(false);
        
        // Add error state to display the message
        if (error.response && error.response.status === 500) {
          setErrorMessage("오늘의 추천은 회원가입한 날에는 볼 수 없어요.");
        }
      }
    };

    fetchBooks();
  }, []);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : books.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < books.length - 1 ? prev + 1 : 0));
  };

  const EmptyContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: white;
  `;

  const EmptyImage = styled.img`
    height: 100%;
  `;
  
  const ErrorContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: white;
    padding: 24px;
    overflow-y: auto;
  `;
  
  const ErrorContent = styled.div`
    max-width: 500px;
    width: 90%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  `;
  
  const ErrorIcon = styled.div`
    font-size: 72px;
    margin-bottom: 24px;
    color: #7bc47f;
  `;
  
  const ErrorTitle = styled.h3`
    font-size: 24px;
    font-weight: 600;
    color: #333333;
    margin-bottom: 16px;
    width: 100%;
    word-break: keep-all;
    white-space: normal;
  `;
  
  const ErrorMessageText = styled.p`
    font-size: 18px;
    color: #666666;
    text-align: center;
    margin-bottom: 32px;
    width: 100%;
    line-height: 1.6;
    word-break: keep-all;
    white-space: normal;
  `;

  // Show error message if present
  if (errorMessage) {
    return (
      <ErrorContainer>
        <ErrorContent>
          <ErrorIcon>🌱</ErrorIcon>
          <ErrorTitle>내일부터 만나요!</ErrorTitle>
          <ErrorMessageText>{errorMessage}</ErrorMessageText>
          <EvaluateButton onClick={() => navigate(ROUTES.EVALUATE_BOOK)}>
            <p>
              더 많은 책을 평가하면 추천을 받을 수 있어요! <br /> ⭐ 평가하기
            </p>
          </EvaluateButton>
        </ErrorContent>
      </ErrorContainer>
    );
  }

  if (!books.length || isLoading) {
    return (
      <EmptyContainer>
        <EmptyImage src="/todays_empty.png" alt="오늘의 책 준비중" />
      </EmptyContainer>
    );
  }

  const currentBook = books[currentIndex];

  // 컴포넌트 return 부분 수정
  return (
    <MainContainer>
      {!books.length ? (
        <EmptyContainer>
          <EmptyImage src="/todays_empty.png" alt="오늘의 책 준비중" />
        </EmptyContainer>
      ) : (
        <>
          <SlideContainer>
            <SlideCard>
              <SlideImageContainer>
                <SlideImageBg src={currentBook.image_url} alt={currentBook.title} />
                <SlideImage src={currentBook.image_url} alt={currentBook.title} />
              </SlideImageContainer>
              <SlideInfo onClick={() => navigate(`/book-detail/${currentBook.book_id}`)}>
                <BasicInfo>
                  <DetailInfo isVisible={showDetail}>
                    <BookDescription>
                      {currentBook.intro || currentBook.publisher_review || "도서 설명이 없습니다."}
                    </BookDescription>
                  </DetailInfo>
                  <TagContainer>
                    {currentBook.tags?.split(",").map((tag, index) => <Tag key={index}>{tag.trim()}</Tag>) || []}
                  </TagContainer>
                  <BookTitle>{currentBook.title}</BookTitle>
                  <AuthorButtonWrapper>
                    <BookAuthor>{currentBook.authors}</BookAuthor>
                    <DetailButton
                      onClick={(e) => {
                        e.stopPropagation(); // 상위 요소로의 이벤트 전파 방지
                        setShowDetail(!showDetail);
                      }}
                    >
                      {showDetail ? "간단히 보기" : "상세 보기"}
                    </DetailButton>
                  </AuthorButtonWrapper>
                </BasicInfo>
              </SlideInfo>
            </SlideCard>
            <NavigationButton direction="left" onClick={handlePrevious}>
              <FaChevronLeft />
            </NavigationButton>
            <NavigationButton direction="right" onClick={handleNext}>
              <FaChevronRight />
            </NavigationButton>
          </SlideContainer>
          <EvaluateButton onClick={() => navigate(ROUTES.EVALUATE_BOOK)}>
            <p>
              더 다양한 추천을 보고싶다면? <br /> ⭐ 평가하기
            </p>
          </EvaluateButton>
        </>
      )}
    </MainContainer>
  );
};

export default TodaysPage;
