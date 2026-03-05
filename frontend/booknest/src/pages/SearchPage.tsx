import React, { useState, useRef, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import SearchTag from "../components/SearchTag";
import SearchRecent from "../components/SearchRecent";
import SearchHot from "../components/SearchHot";
import { useSearchParams } from "react-router-dom";
import { useLocation } from "react-router-dom";

interface User {
  id: number;
  nickname: string;
  profileURL: string;
  isFollowing: boolean;
}

interface Book {
  bookId: number;
  title: string;
  imageURL: string;
  authors: string;
  tags?: string[];
}

interface SearchResult {
  content: Book[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const SearchContainer = styled.div`
  padding: 16px;
`;

const BookList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const BookCard = styled.div`
  display: flex;
  gap: 16px;
  padding: 12px;
  cursor: pointer;
  border-radius: 8px;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const BookCover = styled.img`
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
`;

const BookInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const BookTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.3;
`;

const BookAuthor = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  width: 100%;
`;

const BookTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
`;

const Tag = styled.span<{ isHighlighted?: boolean }>`
  padding: 2px 8px;
  background-color: ${(props) => (props.isHighlighted ? "#00c473" : "#eeeeee")};
  color: ${(props) => (props.isHighlighted ? "#ffffff" : "#555555")};
  border-radius: 12px;
  font-size: 12px;
  font-weight: ${(props) => (props.isHighlighted ? "600" : "normal")};
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 12px 24px;
  border: none;
  background: none;
  font-size: 16px;
  color: ${(props) => (props.active ? "#00c473" : "#666")};
  border-bottom: 2px solid ${(props) => (props.active ? "#00c473" : "transparent")};
  cursor: pointer;
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FollowButton = styled.button<{ isFollowing: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  background-color: ${(props) => (props.isFollowing ? "#f1f1f1" : "#00c473")};
  color: ${(props) => (props.isFollowing ? "#666" : "white")};
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.isFollowing ? "#e1e1e1" : "#00a05e")};
  }
`;

const SearchBarWrapper = styled.div`
  position: relative;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 16px;
  border-radius: 8px;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const UserAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h3`
  margin: 0;
  font-size: 16px;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  margin-bottom: 20px;
`;

const PageButton = styled.button<{ active?: boolean }>`
  padding: 8px 12px;
  border: 1px solid ${(props) => (props.active ? "#00c473" : "#ddd")};
  background-color: ${(props) => (props.active ? "#00c473" : "white")};
  color: ${(props) => (props.active ? "white" : "#666")};
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => (props.active ? "#00a05e" : "#f5f5f5")};
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const ResultCount = styled.div`
  margin: 16px 0;
  color: #666;
  font-size: 14px;
`;

const SuggestionContainer = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 8px 0;
`;

const ToggleContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

const ToggleButton = styled.button<{ expanded?: boolean }>`
  width: 100%;
  max-width: 300px;
  height: 40px;
  background-color: white;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #f8f8f8;
  }

  &::after {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-right: 2px solid #666;
    border-bottom: 2px solid #666;
    margin-left: 8px;
    transform: ${props => props.expanded ? 'rotate(-135deg)' : 'rotate(45deg)'};
    transition: transform 0.3s ease;
  }
`;

const NoResultsMessage = styled.div`
  margin: 40px 0;
  padding: 30px;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const NoResultsIcon = styled.div`
  margin-bottom: 20px;
  font-size: 50px;
  color: #cccccc;
`;

const NoResultsTitle = styled.h3`
  font-size: 18px;
  color: #555;
  margin-bottom: 12px;
  font-weight: 500;
`;

const NoResultsText = styled.p`
  font-size: 14px;
  color: #888;
  line-height: 1.6;
`;

const TagHighlight = styled.span`
  display: inline-block;
  background-color: #e6fff4;
  color: #00c473;
  padding: 2px 10px;
  border-radius: 12px;
  margin: 0 2px;
  font-weight: 500;
`;

const TermHighlight = styled.span`
  color: #00c473;
  font-weight: 500;
`;

const BackButton = styled.button`
  display: none; /* 불필요한 컴포넌트이므로 화면에서 숨김 처리 */
`;

const BackIcon = styled.span`
  display: none;
`;

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"books" | "users">(
    (searchParams.get("type") as "books" | "users") || "books"
  );
  const [searchTerm, setSearchTerm] = useState(searchParams.get("query") || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get("tags")?.split(",").filter(Boolean) || []
  );
  const [tagSelectionOrder, setTagSelectionOrder] = useState<string[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const searchBarRef = useRef<any>(null);
  const navigate = useNavigate();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);

  // Remove the previous useEffect and use a ref to track the initial render
  const isInitialMount = useRef(true);

  // 페이지 로드시 URL의 검색 파라미터로 검색 실행
  useEffect(() => {
    // 검색어나 태그가 URL에 있으면 검색 실행
    const query = searchParams.get("query");
    const tags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
    
    if (query || tags.length > 0) {
      // 페이지가 마운트된 직후에 검색 실행
      const timer = setTimeout(() => {
        triggerSearch(1, query || "");
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Modify the initial useEffect to not collapse tags based on search results
  useEffect(() => {
    // Just initialize for first render, don't auto-collapse
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Don't automatically collapse tags on initial load
    }
  }, []);

  // Add an effect to ensure the tag list is always expanded when there are selected tags
  useEffect(() => {
    if (selectedTags.length > 0) {
      setIsTagsExpanded(true);
    }
  }, [selectedTags]);

  // 검색 파라미터 업데이트 함수
  const updateSearchParams = (newSearchTerm?: string, newTags?: string[], newType?: "books" | "users") => {
    const params = new URLSearchParams(searchParams);

    if (newSearchTerm !== undefined) {
      if (newSearchTerm) params.set("query", newSearchTerm);
      else params.delete("query");
    }

    if (newTags !== undefined) {
      if (newTags.length > 0) params.set("tags", newTags.join(","));
      else params.delete("tags");
    }

    if (newType !== undefined) {
      params.set("type", newType);
    }

    // replace: true 옵션을 추가하여 브라우저 히스토리에 새 항목을 추가하지 않고 현재 항목을 대체
    setSearchParams(params, { replace: true });
  };

  // 기존 핸들러들 수정
  const handleTagSelect = async (tag: string) => {
    // console.log("SearchPage - Tag Selected:", tag);
    // console.log("SearchPage - Current Tags:", selectedTags);

    // 새로운 태그 배열 생성
    const newSelectedTags = selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag];

    // console.log("SearchPage - New Tags Array:", newSelectedTags);

    // 태그 선택 순서 업데이트
    if (selectedTags.includes(tag)) {
      // 태그가 이미 선택되어 있으면 제거
      setTagSelectionOrder(tagSelectionOrder.filter(t => t !== tag));
    } else {
      // 새로운 태그를 선택하면 순서 배열에 추가
      setTagSelectionOrder([...tagSelectionOrder, tag]);
    }

    // 상태 업데이트
    setSelectedTags(newSelectedTags);
    updateSearchParams(searchTerm, newSelectedTags);
    setIsSearchActive(true);
    setIsSearching(true);

    // 검색 실행
    try {
      // console.log("Searching with tags:", newSelectedTags);
      const response = await api.get("/api/search/book", {
        params: {
          page: 1,
          size: 10,
          ...(searchTerm && { title: searchTerm }),
          ...(newSelectedTags.length > 0 && { tags: newSelectedTags }),
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        paramsSerializer: (params) => {
          const searchParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach((v) => searchParams.append(key, v));
            } else {
              searchParams.append(key, value as string);
            }
          });
          return searchParams.toString();
        },
      });

      // console.log("Search API Response:", response.data);

      if (response.data.success) {
        const processedData: SearchResult = response.data.data;
        // console.log("Processed search results:", processedData);

        setCurrentPage(1);
        setTotalBooks(processedData.totalElements);
        setTotalPages(processedData.totalPages);
        setBooks(processedData.content);
        
        // 태그 선택시에는 자동으로 접히지 않도록 제거
        // if (processedData.content.length > 0) {
        //   setIsTagsExpanded(false);
        // }
      }
    } catch (error) {
      // console.error("Failed to search with tags:", error);
      // 에러 발생 시 상태 초기화
      setBooks([]);
      setTotalBooks(0);
      setTotalPages(0);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (!value) {
      setBooks([]);
      setTotalBooks(0);
      setTotalPages(0);
      setIsSearchActive(false);
    } else {
      // 검색어 입력 중일 때는 isSearchActive를 true로 설정
      setIsSearchActive(true);
    }
    updateSearchParams(value, selectedTags);
  };

  // Modify handleSearchResult to not collapse tags
  const handleSearchResult = (data: any) => {
    if (activeTab === "books") {
      setCurrentPage(1);
      setTotalBooks(data.totalElements);
      setTotalPages(data.totalPages);
      setBooks(data.content);
      setIsSearchActive(false); // 검색 완료 후 isSearchActive를 false로 재설정
      
      // 태그가 없는 경우 태그 창을 항상 접음
      if (selectedTags.length === 0) {
        setIsTagsExpanded(false);
      } else {
        // 태그가 있으면 태그 창을 펼침
        setIsTagsExpanded(true);
      }
    } else {
      // 유저 검색 결과도 페이지네이션 처리
      if (data.content && Array.isArray(data.content)) {
        setUsers(data.content);
      } else if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
      setBooks([]);
      setIsSearchActive(false); // 검색 완료 후 isSearchActive를 false로 재설정
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setBooks([]);
    setUsers([]);
    setTotalBooks(0);
    setTotalPages(0);
    setIsSearchActive(false);
    updateSearchParams("", []);
  };

  // 함수 이름을 handleTabChange로 변경
  const handleTabChange = (tab: "books" | "users") => {
    setActiveTab(tab);
    setIsSearchActive(false);
    updateSearchParams(undefined, undefined, tab);
  };

  const handleFollowClick = async (e: React.MouseEvent, userId: number) => {
    e.stopPropagation();
    try {
      const targetUser = users.find((u) => u.id === userId);
      if (!targetUser) return;

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

      if (targetUser.isFollowing) {
        // 언팔로우 요청
        const response = await api.delete(`/api/follow?targetUserId=${userId}`, { headers });
        if (response.data.success) {
          setUsers(users.map((user) => (user.id === userId ? { ...user, isFollowing: false } : user)));
        }
      } else {
        // 팔로우 요청
        const response = await api.post(`/api/follow?targetUserId=${userId}`, {}, { headers });
        if (response.data.success) {
          setUsers(users.map((user) => (user.id === userId ? { ...user, isFollowing: true } : user)));
        }
      }
    } catch (error) {
      // console.error("팔로우/언팔로우 작업 실패:", error);
    }
  };

  // SearchTag에서는 onSearch 호출 제거

  const triggerSearch = async (page: number = currentPage, termToSearch?: string) => {
    // Use the provided term if available, otherwise use current searchTerm
    const searchTermToUse = termToSearch !== undefined ? termToSearch : searchTerm;
    
    // console.log("SearchPage - Triggering Search with term:", searchTermToUse, "tags:", selectedTags);
    setIsSearching(true);
    try {
      const response = await api.get("/api/search/book", {
        params: {
          page,
          size: 10,
          ...(searchTermToUse && { title: searchTermToUse }),
          ...(selectedTags.length > 0 && { tags: selectedTags }),
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        paramsSerializer: (params) => {
          const searchParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach((v) => searchParams.append(key, v));
            } else {
              searchParams.append(key, value as string);
            }
          });
          return searchParams.toString();
        },
      });

      if (response.data.success) {
        const processedData: SearchResult = response.data.data;
        setTotalBooks(processedData.totalElements);
        setTotalPages(processedData.totalPages);
        setBooks(processedData.content);
      }
    } catch (error) {
      // console.error("Failed to search:", error);
      // 에러 발생 시 상태 초기화
      setBooks([]);
      setTotalBooks(0);
      setTotalPages(0);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (searchTerm === "") {
      setShowRecent(true);
    }
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    setTimeout(() => {
      setShowRecent(false);
    }, 300);
  };

  const toggleTags = () => {
    // 선택한 태그가 있어도 접기 버튼을 누르면 접어지도록 수정
    setIsTagsExpanded(prev => !prev);
  };

  // Update the shouldShowTags condition to be more strict
  const shouldShowTags =
    activeTab === "books" &&
    !showRecent &&
    isTagsExpanded;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    triggerSearch(page);
  };

  // Update the tag search function to clear results when all tags are cleared
  const handleTagSearch = async () => {
    // If there are no tags, clear the book results regardless of search term
    if (selectedTags.length === 0) {
      setBooks([]);
      setTotalBooks(0);
      setTotalPages(0);
      setIsSearchActive(false);
      return;
    }
    
    // Otherwise, execute search with current search term
    await triggerSearch(1, searchTerm);
  };

  // Remove the complex click outside handlers and refs
  const tagSectionRef = useRef<HTMLDivElement>(null);

  // Add an event handler to the page body to close tags when clicking outside
  useEffect(() => {
    const handlePageClick = (event: MouseEvent) => {
      // 태그창이 자동으로 닫히지 않도록 이 부분을 주석 처리하거나 제거합니다
      // if (isTagsExpanded && 
      //     tagSectionRef.current && 
      //     !tagSectionRef.current.contains(event.target as Node)) {
      //   // Don't collapse if clicking on the toggle button when tags are hidden
      //   const targetElement = event.target as HTMLElement;
      //   if (targetElement.closest('.toggle-button')) {
      //     return;
      //   }
        
      //   // Don't collapse if there are selected tags
      //   if (selectedTags.length > 0) {
      //     return;
      //   }
        
      //   // Collapse tags
      //   setIsTagsExpanded(false);
      // }
    };

    // Add the event listener to the document
    document.addEventListener('click', handlePageClick);
    
    // Clean up
    return () => {
      document.removeEventListener('click', handlePageClick);
    };
  }, [isTagsExpanded, selectedTags]);

  return (
    <SearchContainer>
      {/* 뒤로가기 버튼은 필요 없으므로 제거
      {(books.length > 0 || users.length > 0 || (searchTerm && !isSearching)) && (
        <BackButton onClick={() => window.location.href = '/search'}>
          <BackIcon>←</BackIcon> 검색 초기화
        </BackButton>
      )}
      */}
      
      <TabContainer>
        <Tab active={activeTab === "books"} onClick={() => handleTabChange("books")}>
          도서
        </Tab>
        <Tab active={activeTab === "users"} onClick={() => handleTabChange("users")}>
          유저
        </Tab>
      </TabContainer>

      <SearchBarWrapper>
        <SearchBar
          ref={searchBarRef}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onClear={() => {
            handleClear();
            setSelectedTags([]);
          }}
          searchType={activeTab}
          onSearchResult={handleSearchResult}
          placeholder={activeTab === "books" ? "도서, 작가 검색" : "유저 검색"}
          selectedTags={selectedTags}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          onUpdateSearchParams={(term) => updateSearchParams(term, selectedTags, activeTab)}
        />

        {showRecent && searchTerm === "" && (
          <SuggestionContainer>
            <SearchRecent
              onSelect={(query) => {
                // First set the search term
                setSearchTerm(query);
                // Update search parameters
                updateSearchParams(query, selectedTags, activeTab);
                // 태그가 없는 경우 태그 창을 접음
                if (selectedTags.length === 0) {
                  setIsTagsExpanded(false);
                }
                // Instead of using searchBarRef.current?.handleSearch(), directly trigger the search
                // with the selected query
                triggerSearch(1, query);
                setIsSearchActive(true);
              }}
              onClose={() => setShowRecent(false)}
            />
            <SearchHot
              onSelect={(query) => {
                // First set the search term
                setSearchTerm(query);
                // Update search parameters
                updateSearchParams(query, selectedTags, activeTab);
                // 태그가 없는 경우 태그 창을 접음
                if (selectedTags.length === 0) {
                  setIsTagsExpanded(false);
                }
                // Instead of using searchBarRef.current?.handleSearch(), directly trigger the search
                // with the selected query
                triggerSearch(1, query);
                setIsSearchActive(true);
              }}
            />
          </SuggestionContainer>
        )}
      </SearchBarWrapper>

      {activeTab === "books" && shouldShowTags && (
        <div ref={tagSectionRef}>
          <SearchTag
            selectedTags={selectedTags}
            onTagSelect={handleTagSelect}
            onClearTags={() => {
              // 태그 전체 해제 시 페이지 새로고침
              window.location.href = '/search';
            }}
            onSearch={handleTagSearch}
          />
          <ToggleContainer>
            <ToggleButton 
              className="toggle-button"
              expanded={isTagsExpanded} 
              onClick={(e) => {
                e.stopPropagation();
                toggleTags();
              }}
            >
              {isTagsExpanded ? "태그 접기" : "태그 펼치기"}
            </ToggleButton>
          </ToggleContainer>
        </div>
      )}
      
      {activeTab === "books" && !shouldShowTags && (
        <ToggleContainer>
          <ToggleButton 
            className="toggle-button"
            expanded={isTagsExpanded} 
            onClick={(e) => {
              e.stopPropagation();
              toggleTags();
            }}
          >
            {isTagsExpanded ? "태그 접기" : "태그 펼치기"}
          </ToggleButton>
        </ToggleContainer>
      )}

      {activeTab === "books" && books.length > 0 && <ResultCount>총 {totalBooks}개의 검색결과</ResultCount>}

      {activeTab === "books" && books.length === 0 && searchTerm && !isSearching && !isSearchActive && (
        <NoResultsMessage>
          <NoResultsIcon>🐣</NoResultsIcon>
          <NoResultsTitle>
            {selectedTags.length > 0 
              ? "태그와 검색어에 일치하는 도서를 찾지 못했어요"
              : "검색어에 일치하는 도서를 찾지 못했어요"}
          </NoResultsTitle>
          <NoResultsText>
            {selectedTags.length > 0 
              ? (
                <>
                  죄송합니다. {selectedTags.map((tag, index) => (
                    <TagHighlight key={index}>#{tag}</TagHighlight>
                  ))} 태그와 <TermHighlight>'{searchTerm}'</TermHighlight> 검색어에 해당하는 도서를 찾을 수 없었어요.
                  <br/>다른 검색어나 태그로 다시 시도해 보시겠어요?
                </>
              ) 
              : (
                <>
                  죄송합니다. <TermHighlight>'{searchTerm}'</TermHighlight>에 해당하는 도서를 찾을 수 없었어요.
                  <br/>다른 검색어로 다시 시도해 보시거나, 태그를 선택해 보시겠어요?
                </>
              )
            }
          </NoResultsText>
        </NoResultsMessage>
      )}

      {activeTab === "books" ? (
        <>
          <BookList>
            {books.map((book) => (
              <BookCard key={book.bookId} onClick={() => navigate(`/book-detail/${book.bookId}`)}>
                <BookCover src={book.imageURL} alt={book.title} />
                <BookInfo>
                  <BookTitle>{book.title}</BookTitle>
                  <BookAuthor>
                    {(() => {
                      // authors가 배열인지 확인
                      if (Array.isArray(book.authors)) {
                        if (book.authors.length === 0) return "작가 미상";
                        if (book.authors.length === 1) return book.authors[0];
                        if (book.authors.length === 2) return `${book.authors[0]}, ${book.authors[1]}`;
                        return `${book.authors[0]} 외 ${book.authors.length - 1}명`;
                      }

                      // 문자열인 경우 기존 로직 유지
                      if (!book.authors || typeof book.authors !== "string") {
                        return "작가 미상";
                      }
                      const authorsList = book.authors.split(",").map((author) => author.trim());
                      if (authorsList.length <= 1) return book.authors;
                      if (authorsList.length === 2) return `${authorsList[0]}, ${authorsList[1]}`;
                      return `${authorsList[0]} 외 ${authorsList.length - 1}명`;
                    })()}
                  </BookAuthor>
                  {book.tags && book.tags.length > 0 && (
                    <BookTags>
                      {book.tags
                        .sort((a, b) => {
                          const aSelected = selectedTags.includes(a);
                          const bSelected = selectedTags.includes(b);
                          
                          if (aSelected && !bSelected) return -1;
                          if (!aSelected && bSelected) return 1;
                          
                          // 둘 다 선택된 경우 선택 순서에 따라 정렬
                          if (aSelected && bSelected) {
                            const aIndex = tagSelectionOrder.indexOf(a);
                            const bIndex = tagSelectionOrder.indexOf(b);
                            return aIndex - bIndex;
                          }
                          
                          // 둘 다 선택되지 않은 경우 알파벳 순으로 정렬
                          return a.localeCompare(b);
                        })
                        .map((tag, index) => (
                          <Tag 
                            key={index} 
                            isHighlighted={selectedTags.includes(tag)}
                          >
                            {tag}
                          </Tag>
                        ))}
                    </BookTags>
                  )}
                </BookInfo>
              </BookCard>
            ))}
          </BookList>

          {totalPages > 1 && (
            <PaginationContainer>
              <PageButton onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                이전
              </PageButton>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) => page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && <span>...</span>}
                    <PageButton active={currentPage === page} onClick={() => handlePageChange(page)}>
                      {page}
                    </PageButton>
                  </React.Fragment>
                ))}
              <PageButton onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                다음
              </PageButton>
            </PaginationContainer>
          )}
        </>
      ) : (
        <UserList>
          {users.map((user) => (
            <UserCard key={user.id}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: 1,
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/profile/${user.id}`)}
              >
                <UserAvatar src={user.profileURL} alt={user.nickname} />
                <UserInfo>
                  <UserName>{user.nickname}</UserName>
                </UserInfo>
              </div>
              {Number(localStorage.getItem("userId")) !== user.id && (
                <FollowButton isFollowing={user.isFollowing} onClick={(e) => handleFollowClick(e, user.id)}>
                  {user.isFollowing ? "팔로잉" : "팔로우"}
                </FollowButton>
              )}
            </UserCard>
          ))}
        </UserList>
      )}
    </SearchContainer>
  );
};

export default SearchPage;
