// 경로 관련 상수들 모아두는 곳

export const ROUTES = {
  HOME: "/home",
  LOGIN: "/login",
  KAKAO_CALLBACK: "/oauth/kakao/callback",
  NAVER_CALLBACK: "/oauth/naver/callback",
  GOOGLE_CALLBACK: "/oauth/google/callback",
  SIGNUP: "/signup",
  INPUT_INFO: "/input-info",
  EVALUATE_BOOK: "/eval-book",
  SEARCH: "/search",
  TODAYS: "/todays",
  NEST: "/nest",
  PROFILE: "/profile",
  PROFILE_DETAIL: "/profile/:userId",
  PROFILE_FOLLOWING: "/profile/:userId/followings",
  PROFILE_FOLLOWERS: "/profile/:userId/followers",
  MY_EVALUATED_BOOKS: "/my-evaluated-books",
  MY_COMMENTS: "/my-comments",
  FOLLOWING: "/follow/following",
} as const;

export const API_PATHS = {
  KAKAO_LOGIN: "/api/oauth/kakao",
  NAVER_LOGIN: "/api/oauth/naver",
  GOOGLE_LOGIN: "/api/oauth/google",
} as const;

export const OAUTH = {
  KAKAO: {
    AUTH_URL: "https://kauth.kakao.com/oauth/authorize",
    SCOPE: "profile_nickname account_email",
  },
  NAVER: {
    AUTH_URL: "https://nid.naver.com/oauth2.0/authorize",
    SCOPE: "name email birthday gender",
  },
  GOOGLE: {
    AUTH_URL: "https://accounts.google.com/o/oauth2/v2/auth",
    SCOPE: "email profile",
  },
} as const;
