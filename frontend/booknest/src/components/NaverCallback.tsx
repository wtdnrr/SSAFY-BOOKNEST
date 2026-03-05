import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import api from '../api/axios';
import { ROUTES } from '../constants/paths';
import { useAuthStore } from '../store/useAuthStore';

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  gap: 1rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  gap: 1rem;
  color: #ff0000;
  background-color: #fff3f3;
  padding: 2rem;
  text-align: center;
`;

const RetryButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #03C75A;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  color: white;
  
  &:hover {
    background-color: #02b350;
  }
`;

const NaverCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleNaverLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const code = new URL(window.location.href).searchParams.get('code');
      const state = new URL(window.location.href).searchParams.get('state');
      
      if (!code || !state) {
        throw new Error('인증 코드를 받지 못했습니다. 다시 시도해주세요.');
      }

      const response = await api.post('/api/oauth/naver', { code, state });
      
      if (response.data.success) {
        const { accessToken, user } = response.data.data;
        
        if (user.isNew) {
          // 새로운 사용자인 경우 회원정보 입력 페이지로 이동
          localStorage.setItem('token', accessToken);
          navigate(ROUTES.INPUT_INFO);
        } else {
          // 기존 사용자인 경우 토큰 저장 후 메인 페이지로 이동
          login(accessToken, user);
          navigate(ROUTES.HOME);
        }
      } else {
        throw new Error(response.data.error?.message || '로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err: any) {
      // console.error('Naver login error:', err);
      
      // 에러 메시지 구체화
      if (err.response?.status === 401) {
        setError('인증에 실패했습니다. 다시 로그인해주세요.');
      } else if (err.response?.status === 500) {
        setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    handleNaverLogin();
  }, []);

  const handleRetry = () => {
    setError(null);
    handleNaverLogin();
  };

  if (error) {
    return (
      <ErrorContainer>
        <p>{error}</p>
        <RetryButton onClick={handleRetry}>다시 시도</RetryButton>
        <RetryButton onClick={() => navigate(ROUTES.LOGIN)}>로그인 페이지로 돌아가기</RetryButton>
      </ErrorContainer>
    );
  }

  return (
    <LoadingContainer>
      <p>네이버 로그인 처리 중...</p>
      <p>잠시만 기다려주세요.</p>
    </LoadingContainer>
  );
};

export default NaverCallback; 
