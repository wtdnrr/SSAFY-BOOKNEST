import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import api from "../api/axios";
import { theme } from "../styles/theme";
import RatingStars from "../components/RatingStars";
import BookmarkButton from "../components/BookmarkButton";
import IgnoreButton from "../components/IgnoreButton";

interface Book {
  bookId: number;
  title: string;
  publishedDate: string;
  imageUrl: string;
  authors: string[];
}

interface PaginatedResponse {
  content: Book[];
  pageNumber: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  first: boolean;
  last: boolean;
}

const EvaluateBookPage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"RANDOM" | "POPULAR" | "RECENT">("RANDOM");
  const [totalRatings, setTotalRatings] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsedStorage = JSON.parse(authStorage);
      const userTotalRatings = parsedStorage?.state?.userDetail?.totalRatings || 0;
      setTotalRatings(userTotalRatings);
    }
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/api/search/eval", {
          params: {
            keyword: sortBy,
            page: page,
            size: 10,
          },
        });

        if (!response.data.success) {
          throw new Error("책 목록을 불러오는데 실패했습니다.");
        }

        const paginatedData = response.data.data as PaginatedResponse;
        setBooks(paginatedData.content);
        setTotalPages(paginatedData.totalPages);
      } catch (error) {
        // console.error("데이터를 불러오는데 실패했습니다:", error);
        setError("데이터를 불러오는데 실패했습니다. 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [page, sortBy]);

  // Add these new styled components
  const ProgressContainer = styled.div`
    position: fixed;
    top: ${theme.layout.headerHeight};
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    background-color: white;
    z-index: 10;
    border-bottom: 1px solid #eee;
    width: 100%;
    padding: 0 3.5%;

    @media (min-width: ${theme.breakpoints.desktop}) {
      width: 640px;
      padding: 0;
      border-left: 1px solid #eee;
      border-right: 1px solid #eee;
    }
  `;

  const CountContainer = styled.div`
    display: flex;
    justify-content: center;
    position: relative;
    width: 100%;
    margin-bottom: 10px;
  `;

  const ProgressNumber = styled.div`
    font-size: 48px;
    font-weight: bold;
    text-align: center;
  `;

  const NextButton = styled.button`
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: #00c473;
    font-size: 14px;
  `;

  const ProgressBar = styled.div`
    width: 100%;
    height: 8px;
    background-color: #f0f0f0;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 10px;
  `;

  const ProgressFill = styled.div<{ width: number }>`
    height: 100%;
    width: ${(props) => props.width}%;
    background-color: #00c473;
    border-radius: 4px;
    transition: width 0.3s ease;
  `;

  const ProgressText = styled.div`
    color: #666;
    font-size: 14px;
    margin-bottom: 20px;
  `;

  const EvaluateContainer = styled.div`
    background-color: #ffffff;
    padding: 0 3.5%;

    @media (min-width: ${theme.breakpoints.desktop}) {
      border-left: 1px solid #dddddd;
      border-right: 1px solid #dddddd;
      width: 640px;
      margin: 0 auto;
    }
  `;

  const SortButtonGroup = styled.div`
    display: flex;
    width: 100%;
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;
    margin-top: 8.2rem; // Add margin to account for fixed ProgressContainer height
  `;

  const SortButton = styled.button<{ isActive: boolean }>`
    flex: 1;
    padding: 16px;
    border: none;
    background-color: transparent;
    color: ${(props) => (props.isActive ? "#000" : "#666")};
    cursor: pointer;
    font-size: 16px;
    font-weight: ${(props) => (props.isActive ? "600" : "400")};
    position: relative;

    &::after {
      content: "";
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: ${(props) => (props.isActive ? "#69b578" : "transparent")};
      transition: background-color 0.2s;
    }
  `;

  const PaginationContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: 8px;
    margin: 20px 0;
  `;

  const PageButton = styled.button<{ isActive?: boolean }>`
    padding: 8px 12px;
    border: 1px solid ${(props) => (props.isActive ? "#69b578" : "#ddd")};
    background-color: ${(props) => (props.isActive ? "#69b578" : "white")};
    color: ${(props) => (props.isActive ? "white" : "#666")};
    cursor: pointer;
    border-radius: 4px;

    &:hover {
      background-color: ${(props) => (props.isActive ? "#69b578" : "#f5f5f5")};
    }
  `;

  const [ratedBooks, setRatedBooks] = useState<Set<number>>(new Set());

  // 마지막 호출 시간을 추적하기 위한 ref 추가
  const lastRatingChangeRef = useRef<{ [key: number]: number }>({});

  const handleRatingChange = (bookId: number, rating: number) => {
    // 동일한 bookId에 대해 짧은 시간 내에 중복 호출 방지
    const now = Date.now();
    const lastCallTime = lastRatingChangeRef.current[bookId] || 0;

    if (now - lastCallTime < 300) {
      // 300ms 내 중복 호출 무시
      return;
    }

    lastRatingChangeRef.current[bookId] = now;
    // console.log(`Book ${bookId} rated: ${rating}`);

    // 로컬 스토리지에서 auth-storage 가져오기
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsedStorage = JSON.parse(authStorage);

      // 평점이 0이면 취소로 간주하고 해당 책을 ratedBooks에서 제거
      if (rating === 0) {
        setRatedBooks((prev) => {
          const newSet = new Set(prev);
          // 이미 평가한 책인 경우에만 totalRatings 감소
          if (prev.has(bookId) && parsedStorage?.state?.userDetail?.totalRatings > 0) {
            // totalRatings 감소
            parsedStorage.state.userDetail.totalRatings -= 0.5;
            localStorage.setItem("auth-storage", JSON.stringify(parsedStorage));
            // 상태 업데이트
            setTotalRatings(parsedStorage.state.userDetail.totalRatings);
          }
          newSet.delete(bookId);
          return newSet;
        });
      } else {
        // 평점이 있으면 ratedBooks에 추가
        setRatedBooks((prev) => {
          const newSet = new Set(prev);
          // 새로 평가한 책인 경우에만 totalRatings 증가
          if (!prev.has(bookId)) {
            // totalRatings 증가
            parsedStorage.state.userDetail.totalRatings += 0.5;
            localStorage.setItem("auth-storage", JSON.stringify(parsedStorage));
            // 상태 업데이트
            setTotalRatings(parsedStorage.state.userDetail.totalRatings);
          }
          newSet.add(bookId);
          return newSet;
        });
      }
    }
  };

  const getProgressMessage = (count: number) => {
    if (count === 0) return "책 평가를 통해 당신만을 위한 맞춤 추천을 받아보세요!";
    if (count <= 1) return "좋아요! 첫 발걸음을 내디뎠어요.";
    if (count <= 4) return "잘하고 있어요! 취향이 조금씩 보이기 시작해요.";
    if (count <= 6) return "절반을 넘었어요! 당신의 취향이 더 명확해지고 있어요.";
    if (count <= 8) return "거의 다 왔어요! 조금만 더 평가해주세요.";
    if (count === 9) return "마지막 한 권만 더! 당신을 위한 추천이 준비되고 있어요.";
    return "완료! 당신을 위한 맞춤 추천이 준비되었어요.";
  };

  // Then in the return statement, replace the SortButtonGroup and NextButton with:
  return (
    <EvaluateContainer>
      <ProgressContainer>
        <CountContainer>
          <ProgressNumber>{totalRatings}</ProgressNumber>
          <NextButton onClick={() => navigate("/home")}>건너뛰기</NextButton>
        </CountContainer>
        <ProgressBar>
          <ProgressFill width={(totalRatings / 10) * 100} />
        </ProgressBar>
        <ProgressText>{getProgressMessage(totalRatings)}</ProgressText>
      </ProgressContainer>

      <SortButtonGroup>
        <SortButton isActive={sortBy === "RANDOM"} onClick={() => setSortBy("RANDOM")}>
          랜덤
        </SortButton>
        <SortButton isActive={sortBy === "POPULAR"} onClick={() => setSortBy("POPULAR")}>
          인기순
        </SortButton>
        <SortButton isActive={sortBy === "RECENT"} onClick={() => setSortBy("RECENT")}>
          최신순
        </SortButton>
      </SortButtonGroup>
      {books.map((book) => (
        <div
          key={book.bookId}
          style={{
            display: "flex",
            padding: "15px",
            borderBottom: "1px solid #eee",
            gap: "20px",
          }}
        >
          <img
            src={book.imageUrl}
            alt={book.title}
            style={{
              width: "120px",
              height: "180px",
              objectFit: "cover",
            }}
          />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: "0 0 8px 0" }}>{book.title}</h2>
            <p style={{ color: "#666", margin: "0 0 16px 0" }}>{book.authors.join(", ")}</p>
            <div style={{ display: "flex", gap: "5px", color: "#ffd700" }}>
              <RatingStars bookId={book.bookId} onRatingChange={(rating) => handleRatingChange(book.bookId, rating)} />
            </div>
            <div
              style={{
                display: "flex",
                gap: "20px",
                marginTop: "20px",
                color: "#666",
              }}
            >
              <BookmarkButton bookId={book.bookId} />
              <IgnoreButton bookId={book.bookId} />
            </div>
          </div>
        </div>
      ))}
      <PaginationContainer>
        <PageButton onClick={() => setPage(1)} disabled={page === 1}>
          처음
        </PageButton>
        <PageButton onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1}>
          이전
        </PageButton>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p >= Math.max(1, page - 2) && p <= Math.min(totalPages, page + 2))
          .map((p) => (
            <PageButton key={p} isActive={p === page} onClick={() => setPage(p)}>
              {p}
            </PageButton>
          ))}
        <PageButton onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page === totalPages}>
          다음
        </PageButton>
        <PageButton onClick={() => setPage(totalPages)} disabled={page === totalPages}>
          마지막
        </PageButton>
      </PaginationContainer>
    </EvaluateContainer>
  );
};

export default EvaluateBookPage;
