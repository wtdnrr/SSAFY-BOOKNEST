import React, { useEffect } from "react";
import styled from "@emotion/styled";
import BestSeller from "../components/BestSeller";
import AuthorBook from "../components/AuthorBook";
import AgeBooks from "../components/AgeBooks";
import CriticBooks from "../components/CriticBooks";
import TodayBestComments from "../components/TodayBestComments";
import LibraryBooks from "../components/LibraryBooks";
import TagBooks from "../components/TagBooks";
import FavoriteCategoryBooks from "../components/FavoriteCategoryBooks";
import FavoriteTagBooks from "../components/FavoriteTagBooks";
import RecentTagBooks from "../components/RecentTagBooks";
import { useAuthStore } from "../store/useAuthStore";
import api from "../api/axios";

const PageWrapper = styled.div`
  height: 100vh;
  overflow-y: auto;

  /* Firefox */
  scrollbar-width: none;

  /* Chrome, Safari, Opera */
  &::-webkit-scrollbar {
    display: none;
  }

  /* IE, Edge */
  -ms-overflow-style: none;
`;

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px 0;

  @media (min-width: 768px) {
    gap: 32px;
    padding: 24px 0;
  }
`;

const Header = styled.header`
  background-color: #69b578;
  color: white;
  padding: 20px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: bold;
  margin: 0;
  color: #4caf50;
`;

const HomePage = () => {
  const { setUserDetail } = useAuthStore();

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        // console.error("No token found");
        return;
      }

      const response = await api.get("/api/user/info", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // console.log("Fetched user info:", response.data.data);
        setUserDetail(response.data.data);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        // console.error("Authentication failed. Please login again.");
      } else {
        // console.error("Failed to fetch user info:", error);
      }
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <PageWrapper>
      <HomeContainer>
        <TodayBestComments />
        <RecentTagBooks />
        <FavoriteCategoryBooks />
        <FavoriteTagBooks />
        <AgeBooks />
        <BestSeller />
        <AuthorBook />
        <CriticBooks />
        <TagBooks />
        <LibraryBooks />
      </HomeContainer>
    </PageWrapper>
  );
};

export default HomePage;
