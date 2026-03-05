import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import styled from "@emotion/styled";
import { theme } from "../styles/theme";

const HeaderContainer = styled.header`
  height: ${theme.layout.headerHeight};
  padding: 0.75rem 1.25rem;
  background: white;
  border-bottom: 1px solid #dddddd;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: 100%;

  @media (min-width: ${theme.breakpoints.desktop}) {
    padding: 2rem;
    justify-content: start;
    left: 0;
    transform: none;
    gap: 2rem;
  }
`;

const Logo = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #00c473;
  width: fit-content;

  @media (min-width: ${theme.breakpoints.desktop}) {
  }
`;

const DesktopNav = styled.nav`
  display: none;

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: flex;
    gap: 2rem;
  }
`;

const NavLink = styled.span<{ isActive: boolean }>`
  cursor: pointer;
  color: ${(props) => (props.isActive ? "#00c473" : "#666")};
  font-size: 16px;
  font-weight: ${(props) => (props.isActive ? "bold" : "normal")};

  &:hover {
    color: #00c473;
  }
`;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <HeaderContainer>
      <Logo>BookNEST</Logo>
      <DesktopNav>
        <NavLink isActive={isActive("/home")} onClick={() => navigate("/home")}>
          홈
        </NavLink>
        <NavLink isActive={isActive("/search")} onClick={() => navigate("/search")}>
          검색
        </NavLink>
        <NavLink isActive={isActive("/todays")} onClick={() => navigate("/todays")}>
          추천/평가
        </NavLink>
        <NavLink isActive={isActive("/nest")} onClick={() => navigate("/nest")}>
          둥지
        </NavLink>
        <NavLink isActive={isActive("/profile")} onClick={() => navigate("/profile")}>
          프로필
        </NavLink>
      </DesktopNav>
    </HeaderContainer>
  );
};

export default Header;
