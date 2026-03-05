import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { theme } from "./styles/theme";
import { ROUTES } from "./constants/paths";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRedirect from "./components/AuthRedirect";
import LoginPage from "./pages/LoginPage";
import InputInfoPage from "./pages/InputInfoPage";
import KakaoCallback from "./components/KakaoCallback";
import NaverCallback from "./components/NaverCallback";
import GoogleCallback from "./components/GoogleCallback";
import HomePage from "./pages/HomePage";
import TodaysPage from "./pages/TodaysPage";
import EvaluateBookPage from "./pages/EvaluateBookPage";
import SearchPage from "./pages/SearchPage";
import NestPage from "./pages/NestPage";
import BookDetailPage from "./pages/BookDetailPage";
import ProfilePage from "./pages/ProfilePage";
import FollowingsPage from "./pages/FollowingsPage";
import FollowersPage from "./pages/FollowersPage";
import ErrorPage from "./pages/ErrorPage";
import MyEvaluatedBookPage from "./pages/MyEvaluatedBookPage";
import MyCommentPage from "./pages/MyCommentPage";
import Navbar from "./components/Navbar";
import styled from "@emotion/styled";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import BookAllCommentPage from "./pages/BookAllCommentPage";

// 개발 환경에서 테스트용 토큰 설정
if (import.meta.env.DEV && !localStorage.getItem("token")) {
  const testUser = {
    id: "test-user-id",
    nickname: "테스트 사용자",

    isNew: false,
  };
  localStorage.setItem("token", "test");
  localStorage.setItem("user", JSON.stringify(testUser));
}

const AppLayout = styled.div``;

const MainContent = styled.main<{ isLoginPage: boolean; isTodayPage: boolean }>`
  padding: ${(props) => (props.isTodayPage ? "0" : "0 3.5%")};
  padding-top: ${(props) => (props.isLoginPage || props.isTodayPage ? "0" : theme.layout.headerHeight)};
  padding-bottom: ${(props) => (props.isLoginPage || props.isTodayPage ? "0" : theme.layout.navbarHeight)};
  height: ${(props) => (props.isLoginPage || props.isTodayPage ? "100vh" : "auto")};

  @media (min-width: ${theme.breakpoints.desktop}) {
    padding-top: ${(props) => (props.isLoginPage || props.isTodayPage ? "0" : theme.layout.headerHeight)};
    padding-bottom: 0;
  }
`;

// AppContent 컴포넌트 내에서 isTodayPage 판단 추가
const AppContent = () => {
  const location = useLocation();
  const { userDetail } = useAuthStore();
  const hideNavigation: string[] = [ROUTES.LOGIN, ROUTES.INPUT_INFO];
  const shouldHideNavigation = hideNavigation.includes(location.pathname);
  const isTodayPage = location.pathname === ROUTES.TODAYS || location.pathname === ROUTES.LOGIN;

  return (
    <AppLayout>
      {!shouldHideNavigation && <Header />}
      <MainContent isLoginPage={shouldHideNavigation} isTodayPage={isTodayPage}>
        <div className="container">
          <Routes>
            {/* 공개 라우트 */}
            <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route
              path={ROUTES.INPUT_INFO}
              element={
                <AuthRedirect>
                  <ProtectedRoute>
                    <InputInfoPage />
                  </ProtectedRoute>
                </AuthRedirect>
              }
            />
            <Route path={ROUTES.KAKAO_CALLBACK} element={<KakaoCallback />} />
            <Route path={ROUTES.NAVER_CALLBACK} element={<NaverCallback />} />
            <Route path={ROUTES.GOOGLE_CALLBACK} element={<GoogleCallback />} />
            {/* 보호된 라우트 */}
            <Route
              path={ROUTES.EVALUATE_BOOK}
              element={
                <ProtectedRoute>
                  <EvaluateBookPage />
                </ProtectedRoute>
              }
            />
            {/* 검색페이지 */}
            <Route
              path={ROUTES.SEARCH}
              element={
                <ProtectedRoute>
                  <SearchPage />
                </ProtectedRoute>
              }
            />
            {/* 오늘의 책 */}
            <Route
              path={ROUTES.TODAYS}
              element={
                <ProtectedRoute>
                  <TodaysPage />
                </ProtectedRoute>
              }
            />
            {/* 메인페이지 */}
            <Route
              path={ROUTES.HOME}
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            {/* 둥지페이지 */}
            <Route
              path={ROUTES.NEST}
              element={
                <ProtectedRoute>
                  <Navigate to={`/nest/${userDetail?.userId}`} replace />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${ROUTES.NEST}/:userId`}
              element={
                <ProtectedRoute>
                  <NestPage />
                </ProtectedRoute>
              }
            />
            {/* 프로필페이지 */}
            <Route
              path={ROUTES.PROFILE}
              element={
                <ProtectedRoute>
                  <Navigate to={`/profile/${userDetail?.userId}`} replace />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.PROFILE_DETAIL}
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            {/* 팔로잉페이지  */}
            <Route
              path={ROUTES.PROFILE_FOLLOWING}
              element={
                <ProtectedRoute>
                  <FollowingsPage />
                </ProtectedRoute>
              }
            />
            {/* 팔로워페이지 */}
            <Route
              path={ROUTES.PROFILE_FOLLOWERS}
              element={
                <ProtectedRoute>
                  <FollowersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.MY_EVALUATED_BOOKS}
              element={
                <ProtectedRoute>
                  <MyEvaluatedBookPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${ROUTES.MY_EVALUATED_BOOKS}/:targetId`}
              element={
                <ProtectedRoute>
                  <MyEvaluatedBookPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.MY_COMMENTS}
              element={
                <ProtectedRoute>
                  <MyCommentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={`${ROUTES.MY_COMMENTS}/:targetId`}
              element={
                <ProtectedRoute>
                  <MyCommentPage />
                </ProtectedRoute>
              }
            />
            {/* 책 상세페이지 */}
            <Route path="/book-detail/:bookId" element={<BookDetailPage />} />
            <Route path="/book/:bookId/comments" element={<BookAllCommentPage />} />
            {/* 잘못된 경로는 에러 페이지로 연결 */}
            <Route path="*" element={<ErrorPage />} />
            {/* 🗑️ */}
          </Routes>
        </div>
      </MainContent>
      {!shouldHideNavigation && <Navbar />}
    </AppLayout>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
