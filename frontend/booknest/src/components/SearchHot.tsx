import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import api from "../api/axios";

interface SearchHotProps {
  onSelect: (query: string) => void;
}

const SearchHotContainer = styled.div`
  background: white;
  padding: 16px;
`;

const Title = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h3 {
    font-size: 16px;
    margin: 0;
    color: #333;
  }
`;

const SearchItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const RankIcon = styled.span`
  color: #00c473;
  margin-right: 12px;
  font-size: 16px;
  font-weight: bold;
  min-width: 20px;
`;

const QueryText = styled.span`
  flex: 1;
  color: #333;
`;

const SearchHot: React.FC<SearchHotProps> = ({ onSelect }) => {
  const [hotSearches, setHotSearches] = useState<string[]>([]);

  useEffect(() => {
    const fetchHotSearches = async () => {
      try {
        const response = await api.get("/api/search/today", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.data.success) {
          setHotSearches(response.data.data);
        }
      } catch (error) {
        // console.error("Failed to fetch hot searches:", error);
      }
    };

    fetchHotSearches();
  }, []);

  return (
    <SearchHotContainer>
      <Title>
        <h3>인기 검색어</h3>
      </Title>

      {hotSearches.map((query, index) => (
        <SearchItem key={index} onClick={() => onSelect(query)}>
          <RankIcon>{index + 1}</RankIcon>
          <QueryText>{query}</QueryText>
        </SearchItem>
      ))}
    </SearchHotContainer>
  );
};

export default SearchHot;
