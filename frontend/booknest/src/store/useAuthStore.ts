import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * 기본 사용자 정보 인터페이스
 * 로그인 후 기본적으로 저장되는 사용자 정보 구조
 */
interface User {
  id: number;              // 사용자 고유 ID
  email: string;           // 이메일 주소
  nickname: string;        // 사용자 닉네임
  profileImage?: string;   // 프로필 이미지 URL (선택 사항)
}

/**
 * 상세 사용자 정보 인터페이스
 * 사용자의 추가 정보 구조 (프로필 상세 정보)
 */
interface UserDetailInfo {
  userId: number;
  nestId: number;
  nickname: string;
  gender: string;
  birthDate: string;
  roadAddress: string;
  zipcode: string;
  profileURL: string;
  followers: number;
  followings: number;
  totalRatings: number;
  totalReviews: number;
}

/**
 * 인증 상태 관리 인터페이스
 * Zustand 스토어에서 관리하는 인증 관련 상태와 함수들
 */
interface AuthState {
  token: string | null;    // 사용자 인증 토큰
  user: User | null;       // 기본 사용자 정보
  userDetail: UserDetailInfo | null;  // 상세 사용자 정보
  isAuthenticated: boolean;  // 인증 여부 플래그
  
  // 상태 변경 함수
  setToken: (token: string | null) => void;  // 토큰 설정 함수
  setUser: (user: User | null) => void;      // 사용자 정보 설정 함수
  setUserDetail: (userDetail: UserDetailInfo | null) => void;  // 상세 정보 설정 함수
  
  // 인증 관련 주요 함수
  login: (token: string, user: User, userDetail?: UserDetailInfo) => void;  // 로그인 처리 함수
  logout: () => void;  // 로그아웃 처리 함수
}

/**
 * localStorage에서 초기 상태를 가져오는 함수
 * 앱 시작 시 저장된 인증 정보를 복원
 * @returns 초기 상태 객체 (토큰, 사용자 정보, 인증 상태)
 */
const getInitialState = () => {
  // 로컬 스토리지에서 토큰과 사용자 정보 가져오기
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  let user: User | null = null;

  // 사용자 정보 파싱 시도
  try {
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (error) {
    // 파싱 실패 시 오류 로깅 및 데이터 삭제
    console.error("Error parsing user data:", error);
    localStorage.removeItem("user");
  }

  // 초기 상태 반환
  return {
    token,
    user,
    isAuthenticated: !!token,  // 토큰이 존재하면 인증된 상태로 간주
  };
};

/**
 * 인증 상태를 관리하는 Zustand 스토어
 * persist 미들웨어를 사용하여 상태를 로컬 스토리지에 유지
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 초기 상태 설정
      ...getInitialState(),
      
      // 토큰 설정 함수
      setToken: (token) => set({ token }),
      
      // 사용자 정보 설정 함수
      setUser: (user) => set({ user }),
      
      // 초기 상세 정보는 null
      userDetail: null,
      
      // 상세 정보 설정 함수
      setUserDetail: (userDetail) => set({ userDetail }),
      login: (token, user, userDetail = null) => {
        // 로컬 스토리지에 정보 저장
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        if (userDetail) {
          localStorage.setItem("userDetail", JSON.stringify(userDetail));
        }
        
        // 스토어 상태 업데이트
        set({
          token,
          user,
          userDetail,
          isAuthenticated: true,
        });
      },
      
      /**
       * 로그아웃 처리 함수
       * 모든 인증 관련 정보를 삭제하고 인증 상태를 false로 설정
       */
      logout: () => {
        // 로컬 스토리지에서 정보 삭제
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userDetail");
        
        // 스토어 상태 초기화
        set({
          token: null,
          user: null,
          userDetail: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      // 로컬 스토리지에 저장될 키 이름
      name: "auth-storage",
    }
  )
);
