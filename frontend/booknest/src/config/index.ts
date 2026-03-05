const config = {
  kakao: {
    clientId: import.meta.env.VITE_KAKAO_CLIENT_ID,
    redirectUri: import.meta.env.VITE_KAKAO_REDIRECT_URI,
  },
  naver: {
    clientId: import.meta.env.VITE_NAVER_CLIENT_ID,
    clientSecret: import.meta.env.VITE_NAVER_CLIENT_SECRET,
    redirectUri: import.meta.env.VITE_NAVER_REDIRECT_URI,
  },
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
    redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '',
  },
} as const;

export default config; 