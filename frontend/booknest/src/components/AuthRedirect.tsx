import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface AuthRedirectProps {
  children: React.ReactNode;
}

const AuthRedirect = ({ children }: AuthRedirectProps) => {
  const { userDetail } = useAuthStore();

  // 이미 로그인하고 사용자 정보가 있는 경우 프로필 페이지로 리다이렉트
  if (userDetail) {
    return <Navigate to={`/profile/${userDetail.userId}`} replace />;
  }

  // 그렇지 않은 경우 자식 컴포넌트 렌더링
  return <>{children}</>;
};

export default AuthRedirect; 