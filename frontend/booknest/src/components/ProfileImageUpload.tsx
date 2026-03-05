import React, { useState } from "react";
import styled from "@emotion/styled";
import { useAuthStore } from "../store/useAuthStore";
import api from "../api/axios";

interface ProfileImageUploadProps {
  currentImageUrl: string;
}

const EditImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 10rem;
  height: 10rem;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  cursor: pointer;

  &:hover .overlay {
    opacity: 1;
  }
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 1px solid #555555;
  border-radius: 50%;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
`;

const HiddenInput = styled.input`
  display: none;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
`;

const ButtonContainer = styled.div`
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  z-index: 3;
`;

const ResetButton = styled.button`
  background-color: #555555;
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
  position: relative;

  &:hover {
    background-color: #333333;
  }

  svg {
    width: 20px;
    height: 20px;
    fill: white;
  }
`;

// Modal components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ModalTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
`;

const ModalMessage = styled.p`
  margin-bottom: 1.5rem;
  color: #555;
`;

const ModalButton = styled.button`
  background-color: #00c437;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: #00a02e;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-weight: 500;
`;

const SuccessMessage = styled.div`
  color: #00c437;
  font-weight: 500;
`;

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({ currentImageUrl }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);
  const { setUserDetail, userDetail } = useAuthStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const openModal = (title: string, message: string, success: boolean = true) => {
    setModalTitle(title);
    setModalMessage(message);
    setIsSuccess(success);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleClick = () => {
    // console.log("이미지 클릭됨");
    fileInputRef.current?.click();
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    formData.append("resource_type", "image");

    try {
      // console.log("Cloudinary 업로드 시작...");
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // console.error("Cloudinary 응답 에러:", errorData);
        throw new Error("이미지 업로드에 실패했습니다.");
      }

      const data = await response.json();
      // console.log("Cloudinary 업로드 성공:", data);
      return data.secure_url;
    } catch (error) {
      // console.error("Cloudinary 업로드 실패:", error);
      throw new Error("이미지 업로드에 실패했습니다.");
    }
  };

  const updateProfileImageInBackend = async (imageUrl: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }

      const response = await api.put(
        "/api/user/profile-image",
        { imgurl: imageUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.success) {
        throw new Error("프로필 이미지 업데이트에 실패했습니다.");
      }

      return response.data;
    } catch (error) {
      // console.error("백엔드 업데이트 실패:", error);
      throw error;
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    if (!file.type.startsWith("image/")) {
      openModal("업로드 실패", "이미지 파일만 업로드 가능합니다.", false);
      return;
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      openModal("업로드 실패", "파일 크기는 5MB를 초과할 수 없습니다.", false);
      return;
    }

    try {
      setIsUploading(true);

      // Cloudinary에 이미지 업로드
      const imageUrl = await uploadToCloudinary(file);
      // console.log("받은 이미지 URL:", imageUrl);

      // 백엔드 API 호출
      await updateProfileImageInBackend(imageUrl);

      // Zustand store 업데이트
      if (userDetail) {
        const updatedUserDetail = {
          ...userDetail,
          profileURL: imageUrl,
        };

        // Zustand store 업데이트
        setUserDetail(updatedUserDetail);

        // 로컬 스토리지에 업데이트된 사용자 정보 저장
        localStorage.setItem("userDetail", JSON.stringify(updatedUserDetail));
      }

      openModal("업로드 성공", "프로필 이미지가 성공적으로 업데이트되었습니다.", true);
    } catch (error) {
      // console.error("프로필 이미지 업로드 실패:", error);
      openModal("업로드 실패", "프로필 이미지 업로드에 실패했습니다. 다시 시도해주세요.", false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetToDefault = async () => {
    try {
      setIsUploading(true);

      // 백엔드 API 호출 - 빈 문자열을 전송하여 기본 이미지로 리셋
      const response = await api.put(
        "/api/user/profile-image",
        { imgurl: "" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.success) {
        throw new Error("프로필 이미지 초기화에 실패했습니다.");
      }

      // Zustand store 업데이트
      if (userDetail) {
        const updatedUserDetail = {
          ...userDetail,
          profileURL: "", // 빈 문자열로 설정
        };

        setUserDetail(updatedUserDetail);
        localStorage.setItem("userDetail", JSON.stringify(updatedUserDetail));
      }

      // 페이지 새로고침
      window.location.reload();
    } catch (error) {
      // console.error("프로필 이미지 초기화 실패:", error);
      openModal("초기화 실패", "프로필 이미지 초기화에 실패했습니다. 다시 시도해주세요.", false);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <EditImageContainer>
        <ImageContainer onClick={handleClick}>
          <ProfileImage
            src={currentImageUrl || "/images/default-profile.png"}
            alt="프로필 이미지"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/default-profile.png";
            }}
          />
          <Overlay className="overlay">사진 변경</Overlay>
        </ImageContainer>
        {isUploading && <LoadingOverlay>업로드 중...</LoadingOverlay>}
        <HiddenInput ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} />
        <ButtonContainer>
          <ResetButton onClick={handleResetToDefault} aria-label="Reset profile image">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
            </svg>
          </ResetButton>
        </ButtonContainer>
      </EditImageContainer>

      {modalOpen && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>{modalTitle}</ModalTitle>
            {isSuccess ? (
              <SuccessMessage>{modalMessage}</SuccessMessage>
            ) : (
              <ErrorMessage>{modalMessage}</ErrorMessage>
            )}
            <ModalButton onClick={closeModal}>확인</ModalButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </div>
  );
};

export default ProfileImageUpload;
