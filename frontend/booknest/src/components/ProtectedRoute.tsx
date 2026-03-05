import { Navigate } from "react-router-dom";
import { ROUTES } from "../constants/paths";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const userInfo = localStorage.getItem("user");

  // console.log("보호된 라우트 - 토큰:", token);

  if (!token) {
    // console.log("보호된 라우트 - 토큰이 없음, 로그인 페이지로 이동");
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // 사용자 정보 확인 및 닉네임 검증
  if (userInfo) {
    const user = JSON.parse(userInfo);
    if (!user.nickname) {
      // console.log("보호된 라우트 - 닉네임이 없음, 정보입력 페이지로 이동");
      return <Navigate to={ROUTES.INPUT_INFO} replace />;
    }
  }

  // console.log("보호된 라우트 - 토큰 확인됨, 컴포넌트 렌더링");
  return <>{children}</>;
};

export default ProtectedRoute;
