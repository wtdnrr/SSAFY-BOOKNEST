import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import api from "../api/axios";

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: center;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
`;

const LogoutModal = ({ onClose }: { onClose: () => void }) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      const response = await api.post("/api/auth/logout", null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        await logout();
        localStorage.removeItem("token");
        localStorage.clear();
        onClose();
        navigate("/login");
      }
    } catch (error) {
      // console.error("로그아웃 실패:", error);
    }
  };

  return (
    <ModalWrapper>
      <ModalContent>
        <h3>로그아웃</h3>
        <p>정말 로그아웃 하시겠습니까?</p>
        <ButtonGroup>
          <Button onClick={onClose}>취소</Button>
          <Button onClick={handleLogout}>로그아웃</Button>
        </ButtonGroup>
      </ModalContent>
    </ModalWrapper>
  );
};

export default LogoutModal;
