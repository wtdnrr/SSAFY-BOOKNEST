import { useNavigate, useLocation } from "react-router-dom";
import styled from "@emotion/styled";
import { theme } from "../styles/theme";

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  height: ${theme.layout.navbarHeight};
  display: flex;
  align-items: center;
  z-index: 1000;

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: none;
  }
`;

const NavList = styled.ul`
  display: flex;
  justify-content: space-around;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  height: 100%;
`;

const NavItem = styled.li<{ isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  color: ${(props) => (props.isActive ? "#00c473" : "#666")};
  font-size: 12px;

  svg {
    margin-bottom: 4px;
    width: 24px;
    height: 24px;
  }
`;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <NavContainer>
      <NavList>
        <NavItem isActive={isActive("/home")} onClick={() => navigate("/home")}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
          </svg>
          홈
        </NavItem>

        {/* 나머지 NavItem들은 그대로 유지 */}
        <NavItem
          isActive={isActive("/search")}
          onClick={() => navigate("/search")}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          검색
        </NavItem>

        <NavItem
          isActive={isActive("/todays")}
          onClick={() => navigate("/todays")}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z" />
          </svg>
          추천/평가
        </NavItem>

        <NavItem isActive={isActive("/nest")} onClick={() => navigate("/nest")}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z" />
          </svg>
          둥지
        </NavItem>

        <NavItem
          isActive={isActive("/profile")}
          onClick={() => navigate("/profile")}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          </svg>
          프로필
        </NavItem>
      </NavList>
    </NavContainer>
  );
};

export default Navbar;
