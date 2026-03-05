import React, { useState, useRef, useEffect } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { useNavigate, useLocation, useParams, useSearchParams } from "react-router-dom";
import { FaPlus, FaSearch, FaTimes, FaThLarge, FaList } from "react-icons/fa";
import NestBookList from "../components/NestBookList";
import BookmarkList from "../components/BookmarkList";
import BookSearchModal from "../components/BookSearchModal";
import { FaSort } from "react-icons/fa";
import { useAuthStore } from "../store/useAuthStore";

export type SortOption = "latest" | "oldest" | "rating" | "title";
export type ViewMode = "full" | "cover";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  background-color: white;
  padding: 5px;
  border-radius: 12px;
  position: relative;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 0;
  width: 100%;
  position: relative;
  
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: #ddd;
  }
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 10px 0;
  border: none;
  background: none;
  font-size: 16px;
  font-weight: ${(props) => (props.$active ? "600" : "normal")};
  color: ${(props) => (props.$active ? "#00c473" : "#666")};
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  text-align: center;
  z-index: 1;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: ${(props) => (props.$active ? "#00c473" : "transparent")};
    border-radius: 0;
    transition: background-color 0.3s ease;
  }

  &:hover {
    color: #00c473;
  }
`;

const AddButton = styled.button`
  height: 40px;
  padding: 0 16px;
  background-color: #00c473;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  min-width: fit-content;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 196, 115, 0.2);

  &:hover {
    background-color: #00b368;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 196, 115, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 196, 115, 0.2);
  }

  svg {
    margin-right: 8px;
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    padding: 0 12px;
    font-size: 14px;
  }
  
  @media (max-width: 380px) {
    min-width: 42px;
    padding: 0 8px;
    
    span {
      display: none;
    }
    
    svg {
      margin-right: 0;
    }
  }
`;

const SortContainer = styled.div`
  position: relative;
`;

const SortButton = styled.button`
  height: 40px;
  padding: 0 16px;
  background-color: white;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: #f5f5f5;
  }

  svg {
    margin-left: 8px;
  }
  
  @media (max-width: 480px) {
    padding: 0 12px;
    font-size: 14px;
  }
  
  @media (max-width: 380px) {
    padding: 0 8px;
    
    svg {
      margin-left: 4px;
    }
  }
`;

const SortDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 100;
  width: 150px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: ${(props) => (props.isOpen ? "block" : "none")};
  margin-top: 5px;
  overflow: hidden;
`;

const SortOption = styled.div<{ isActive: boolean }>`
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${(props) => (props.isActive ? "#f0f9f4" : "white")};
  color: ${(props) => (props.isActive ? "#00c473" : "#333")};
  font-weight: ${(props) => (props.isActive ? "600" : "normal")};

  &:hover {
    background-color: ${(props) => (props.isActive ? "#f0f9f4" : "#f8f8f8")};
  }
`;

const ActionContainer = styled.div`
  display: flex;
  align-items: center;
`;

const ViewModeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 16px;
  background-color: white;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: #f5f5f5;
  }

  svg {
    margin-right: 8px;
  }
  
  @media (max-width: 480px) {
    padding: 0 12px;
    font-size: 14px;
  }
  
  @media (max-width: 380px) {
    padding: 0 8px;
    
    svg {
      margin-right: 4px;
    }
  }
`;

const TopActionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  width: 100%;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-wrap: nowrap;
  }
`;

const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  flex: 1;
  max-width: 300px;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 0 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  
  @media (max-width: 768px) {
    max-width: none;
    min-width: 0;
  }
  
  @media (max-width: 380px) {
    flex: 1;
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    justify-content: flex-end;
    gap: 6px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  padding: 0 8px;
  padding-right: 30px;
  height: 100%;
  font-size: 15px;
  outline: none;
  
  &::placeholder {
    color: #aaa;
  }
`;

const SearchIcon = styled.div`
  color: #777;
  margin-right: 8px;
`;

const ClearButton = styled.button`
  border: none;
  background: none;
  color: #777;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  height: 20px;
  width: 20px;
  
  &:hover {
    color: #333;
  }
`;

const BookmarkControlsContainer = styled(ControlsContainer)`
  justify-content: flex-end;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    justify-content: flex-end;
  }
`;

const getSortLabel = (sortOption: SortOption): string => {
  switch (sortOption) {
    case "latest":
      return "최신순";
    case "oldest":
      return "오래된순";
    case "rating":
      return "별점 높은순";
    case "title":
      return "제목순";
    default:
      return "정렬";
  }
};

const NestPage = () => {
  const { userId } = useParams();
  const { userDetail } = useAuthStore();
  const [searchParams] = useSearchParams();
  const nestId = searchParams.get("nestId");
  const [activeTab, setActiveTab] = useState<"둥지" | "찜">("둥지");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [bookmarkSortOption, setBookmarkSortOption] = useState<SortOption>("latest");
  const [showBookmarkSortDropdown, setShowBookmarkSortDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("full");
  const nestBookListRef = useRef<{ fetchNestBooks: () => void } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isOtherUserNest = userId && userDetail?.userId !== parseInt(userId);

  useEffect(() => {
    if (isOtherUserNest && activeTab === "찜") {
      setActiveTab("둥지");
    }
  }, [isOtherUserNest, activeTab]);

  const handleBookAdded = () => {
    if (nestBookListRef.current) {
      nestBookListRef.current.fetchNestBooks();
    }
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    setShowSortDropdown(false);
  };

  const handleBookmarkSortChange = (option: SortOption) => {
    setBookmarkSortOption(option);
    setShowBookmarkSortDropdown(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "full" ? "cover" : "full");
  };

  return (
    <Container>
      <HeaderSection>
        <TabContainer>
          <Tab $active={activeTab === "둥지"} onClick={() => setActiveTab("둥지")}>
            둥지
          </Tab>
          {!isOtherUserNest && (
            <Tab $active={activeTab === "찜"} onClick={() => setActiveTab("찜")}>
              찜
            </Tab>
          )}
        </TabContainer>
      </HeaderSection>

      {activeTab === "둥지" && (
        <>
          <TopActionContainer>
            <SearchBarContainer>
              <SearchIcon>
                <FaSearch />
              </SearchIcon>
              <SearchInput 
                placeholder="내 둥지 도서 검색" 
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <ClearButton 
                onClick={clearSearch}
              >
                <FaTimes size={16} />
              </ClearButton>
            </SearchBarContainer>
            {!isOtherUserNest && (
              <AddButton onClick={() => setShowSearchModal(true)}>
                <FaPlus size={14} /> <span>도서추가</span>
              </AddButton>
            )}
          </TopActionContainer>
          
          <ControlsContainer>
            <ViewModeButton onClick={toggleViewMode}>
              {viewMode === "full" ? (
                <>
                  <FaThLarge size={14} /> 표지만
                </>
              ) : (
                <>
                  <FaList size={14} /> 전체
                </>
              )}
            </ViewModeButton>
            <SortContainer>
              <SortButton onClick={() => setShowSortDropdown(!showSortDropdown)}>
                {getSortLabel(sortOption)} <FaSort />
              </SortButton>
              <SortDropdown isOpen={showSortDropdown}>
                <SortOption isActive={sortOption === "latest"} onClick={() => handleSortChange("latest")}>
                  최신순
                </SortOption>
                <SortOption isActive={sortOption === "oldest"} onClick={() => handleSortChange("oldest")}>
                  오래된순
                </SortOption>
                <SortOption isActive={sortOption === "rating"} onClick={() => handleSortChange("rating")}>
                  별점 높은순
                </SortOption>
                <SortOption isActive={sortOption === "title"} onClick={() => handleSortChange("title")}>
                  제목순
                </SortOption>
              </SortDropdown>
            </SortContainer>
          </ControlsContainer>
        </>
      )}

      {activeTab === "찜" && (
        <BookmarkControlsContainer>
          <ViewModeButton onClick={toggleViewMode}>
            {viewMode === "full" ? (
              <>
                <FaThLarge size={14} /> 표지만
              </>
            ) : (
              <>
                <FaList size={14} /> 전체
              </>
            )}
          </ViewModeButton>
          <SortContainer>
            <SortButton onClick={() => setShowBookmarkSortDropdown(!showBookmarkSortDropdown)}>
              {getSortLabel(bookmarkSortOption)} <FaSort />
            </SortButton>
            <SortDropdown isOpen={showBookmarkSortDropdown}>
              <SortOption isActive={bookmarkSortOption === "latest"} onClick={() => handleBookmarkSortChange("latest")}>
                최신순
              </SortOption>
              <SortOption isActive={bookmarkSortOption === "oldest"} onClick={() => handleBookmarkSortChange("oldest")}>
                오래된순
              </SortOption>
              <SortOption isActive={bookmarkSortOption === "rating"} onClick={() => handleBookmarkSortChange("rating")}>
                별점 높은순
              </SortOption>
              <SortOption isActive={bookmarkSortOption === "title"} onClick={() => handleBookmarkSortChange("title")}>
                제목순
              </SortOption>
            </SortDropdown>
          </SortContainer>
        </BookmarkControlsContainer>
      )}

      {showSearchModal && <BookSearchModal onClose={() => setShowSearchModal(false)} onBookAdded={handleBookAdded} />}

      {activeTab === "둥지" ? (
        <NestBookList 
          ref={nestBookListRef} 
          sortOption={sortOption} 
          searchTerm={searchTerm}
          viewMode={viewMode}
          userId={userId ? parseInt(userId) : undefined}
          nestId={nestId ? parseInt(nestId) : undefined}
        />
      ) : (
        <BookmarkList 
          viewMode={viewMode}
          sortOption={bookmarkSortOption}
        />
      )}
    </Container>
  );
};

export default NestPage;
