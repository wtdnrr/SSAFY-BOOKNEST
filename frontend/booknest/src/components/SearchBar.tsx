import styled from "@emotion/styled";
import api from "../api/axios";
import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import { useRecentStore } from "../store/useRecentStore";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  searchType: "books" | "users";
  onSearchResult: (data: any) => void;
  selectedTags?: string[];
  onFocus?: () => void;
  onBlur?: () => void;
  onUpdateSearchParams: (searchTerm: string) => void;
}

const NoResultsIcon = styled.div`
  font-size: 48px;
  text-align: center;
  margin: 20px 0;
`;

const SearchBarContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 45px;
  border-radius: 10px;
  border: none;
  background-color: #f1f1f1;
  font-size: 16px;
  outline: none;

  &::placeholder {
    color: #666;
  }
`;

const AutocompleteList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
  padding: 8px 0;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
`;

const AutocompleteItem = styled.li`
  padding: 8px 16px;
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  width: 16px;
  height: 16px;

  &::before {
    content: "";
    position: absolute;
    width: 10px;
    height: 10px;
    border: 2px solid #666;
    border-radius: 50%;
    top: 0;
    left: 0;
  }

  &::after {
    content: "";
    position: absolute;
    width: 2px;
    height: 6px;
    background-color: #666;
    transform: rotate(-45deg);
    bottom: 0;
    right: 0;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  opacity: 0.7;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;

  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 2px;
    height: 16px;
    background-color: #666;
  }

  &::before {
    transform: rotate(45deg);
  }

  &::after {
    transform: rotate(-45deg);
  }

  &:hover {
    opacity: 1;
  }

  &:hover::before,
  &:hover::after {
    background-color: #333;
  }
`;

const SearchButton = styled.button`
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  background-color: #00c473;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #6ab36e;
  }
`;

const SearchBar = forwardRef<any, SearchBarProps>(
  (
    {
      searchTerm,
      onSearchChange,
      onClear,
      placeholder = "도서, 작가, 유저 검색",
      searchType,
      onSearchResult,
      selectedTags,
      onFocus,
      onBlur,
      onUpdateSearchParams,
    },
    ref
  ) => {
    const { addRecent } = useRecentStore();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [autocompleteResults, setAutocompleteResults] = useState<string[]>([]);
    const [showAutocomplete, setShowAutocomplete] = useState(false);

    const fetchAutocomplete = async (keyword: string) => {
      if (!keyword.trim()) {
        setAutocompleteResults([]);
        return;
      }

      try {
        const response = await api.get("/api/search/autocomplete", {
          params: { keyword },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.data.success) {
          setAutocompleteResults(response.data.data);
        }
      } catch (error) {
        // console.error("Failed to fetch autocomplete:", error);
        setAutocompleteResults([]);
      }
    };

    useEffect(() => {
      const debounceTimer = setTimeout(() => {
        if (searchTerm) {
          fetchAutocomplete(searchTerm);
        } else {
          setAutocompleteResults([]);
        }
      }, 300);

      return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleSearch = async (keywordToSearch?: string) => {
      const finalSearchTerm = keywordToSearch !== undefined ? keywordToSearch : searchTerm;

      if (!finalSearchTerm.trim()) return;
      
      setIsSearching(true);
      setShowAutocomplete(false);
      if (finalSearchTerm.trim()) {
        addRecent(finalSearchTerm);
      }

      try {
        const endpoint = searchType === "books" ? "/api/search/book" : "/api/search/user";
        const params = new URLSearchParams();

        if (searchType === "books") {
          params.append("title", finalSearchTerm);
          params.append("page", "1");
          params.append("size", "10");
          if (selectedTags && selectedTags.length > 0) {
            selectedTags.forEach((tag) => params.append("tags", tag));
          }
        } else {
          params.append("name", finalSearchTerm);
          params.append("page", "1");
          params.append("size", "10");
        }

        const response = await api.get(endpoint, {
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (response.data.success) {
          const processedData = {
            ...response.data.data,
            content: response.data.data.content.map((item: any) => ({
              ...item,
              tags: item.tags?.filter((tag: string) => tag !== "_tagsparsefailure") || [],
            })),
          };
          onSearchResult(processedData);
        }
      } catch (error) {
        // console.error(`Failed to search ${searchType}:`, error);
      } finally {
        setIsSearching(false);
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value);
    };

    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setShowAutocomplete(true);
      if (onFocus) {
        onFocus();
      }
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTimeout(() => {
        setShowAutocomplete(false);
      }, 300);

      if (onBlur) {
        onBlur();
      }
    };

    const handleAutocompleteClick = (value: string) => {
      onSearchChange(value);
      onUpdateSearchParams(value);
      
      // 자동완성으로 선택 후 곧바로 검색 실행
      handleSearch(value);
    };

    useImperativeHandle(ref, () => ({
      handleSearch,
    }));

    return (
      <SearchBarContainer>
        <SearchInputWrapper>
          <SearchIcon />
          <SearchInput
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          {searchTerm && (
            <ClearButton 
              onClick={() => {
                onClear();
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }} 
              type="button"
              aria-label="Clear search text"
            />
          )}
          {showAutocomplete && autocompleteResults.length > 0 && (
            <AutocompleteList>
              {autocompleteResults.map((result, index) => (
                <AutocompleteItem key={index} onClick={() => handleAutocompleteClick(result)}>
                  {result}
                </AutocompleteItem>
              ))}
            </AutocompleteList>
          )}
        </SearchInputWrapper>
        <SearchButton 
          onClick={() => handleSearch()}
          disabled={isSearching}
        >
          {isSearching ? "검색 중..." : "검색"}
        </SearchButton>
      </SearchBarContainer>
    );
  }
);

export default SearchBar;
