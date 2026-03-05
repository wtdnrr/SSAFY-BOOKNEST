import React from "react";
import { useNavigate } from "react-router-dom";

const ErrorPage = ({
  message = "페이지를 찾을 수 없습니다.",
  code = "404",
}) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="error-container">
      <h1>에러가 발생했습니다</h1>
      <div className="error-content">
        <h2>Error {code}</h2>
        <p>{message}</p>
        <button onClick={handleGoBack}>이전 페이지로 돌아가기</button>
      </div>
    </div>
  );
};

export default ErrorPage;
