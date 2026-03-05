import styled from "@emotion/styled";
import { ROUTES } from "../constants/paths";
import { useAuthStore } from "../store/useAuthStore";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import LogoutModal from "../components/LogoutModal";
import DeleteAccountModal from "../components/DeleteAccountModal";
import EditInfoModal from "../components/EditInfoModal";
import ProfileImageUpload from "../components/ProfileImageUpload";
import ArchetypeCard from "../components/ArchetypeCard";

// Import theme for breakpoints
import { theme } from "../styles/theme";
import UserSearchModal from "../components/UserSearchModal";

const BlankBox = styled.div`
  background-color: #fafafa;
  min-height: 100vh;
`;

const ProfileContainer = styled.div`
  background-color: #ffffff;
  padding: 3.5%;

  @media (min-width: ${theme.breakpoints.desktop}) {
    border-left: 1px solid #dddddd;
    border-right: 1px solid #dddddd;
    width: 640px;
    margin: 0 auto;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  justify-content: space-between;
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  position: relative;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background: transparent;
  cursor: pointer;
`;

const UserProfile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
`;

const UserBasicInfo = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  gap: 20px;
`;

const UserNameSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex-grow: 1;
`;

const UserLevel = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const EditButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  width: 8rem;
  &:hover {
    background: #f5f5f5;
  }
`;

const UserName = styled.h2`
  margin: 0;
  font-size: 1.5rem;
`;

const ProfileImage = styled.div`
  width: 10rem;
  border-radius: 50%;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserStats = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 1rem 0;

  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    position: relative;
    width: 100%;

    &:hover {
      background-color: #f5f5f5;
      border-radius: 0.3rem;
    }

    strong {
      font-size: 32px;
      font-weight: 700;
      color: #000;
      margin-bottom: 8px;
    }

    div {
      font-size: 14px;
      color: #666;
      padding: 0;
    }
  }
`;

const Section = styled.section`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  margin: 1rem 0;
  color: #102c57;
  font-size: 1.3rem;
`;

const TagCloud = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
`;

const TagRow = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
`;

const Tag = styled.span<{ color?: string; size?: string }>`
  padding: 4px 4px;
  color: ${(props) => props.color || "#e0e0e0"};
  font-size: 16px;
  font-weight: 700;
  text-align: center;
`;

const AuthorList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const AuthorItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
`;

const SettingsDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: #f5f5f5;
  }
`;

const FollowButton = styled.button<{ isFollowing: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  background-color: ${(props) => (props.isFollowing ? "#f1f1f1" : "#7bc47f")};
  color: ${(props) => (props.isFollowing ? "#666" : "white")};
  cursor: pointer;
  width: 8rem;
  margin-top: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.isFollowing ? "#e1e1e1" : "#6ab36e")};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const NestButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  background-color: #7bc47f;
  color: white;
  cursor: pointer;
  width: 8rem;
  margin-top: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: #6ab36e;
  }
`;

const Divider = styled.hr`
  border: none;
  height: 1px;
  background-color: #dddddd;
`;

const ProfilePage = () => {
  const { userDetail, setUserDetail } = useAuthStore();
  const navigate = useNavigate();
  const { userId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUserSearchModal, setShowUserSearchModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // 로컬 스토리지에서 사용자 정보 불러오기
  useEffect(() => {
    const savedUserDetail = localStorage.getItem("userDetail");
    if (savedUserDetail) {
      const parsedUserDetail = JSON.parse(savedUserDetail);
      setUserDetail(parsedUserDetail);
    }
  }, [setUserDetail]);

  // 페이지 진입 시 현재 사용자 정보 가져오기
  useEffect(() => {
    const fetchCurrentUserInfo = async () => {
      try {
        const response = await api.get("/api/user/info", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.data.success) {
          setUserDetail(response.data.data);
        }
      } catch (error) {
        // console.error("사용자 정보 가져오기 실패:", error);
      }
    };

    fetchCurrentUserInfo();
  }, [setUserDetail]);

  // 기존 코드 유지...
  // 현재 프로필이 로그인한 사용자의 것인지 확인
  const isOwnProfile = userDetail?.userId === Number(userId);

  useEffect(() => {
    // URL에 userId가 없으면 현재 로그인된 사용자의 프로필로 리다이렉트
    if (!userId && userDetail?.userId) {
      navigate(`/profile/${userDetail.userId}`);
      return;
    }

    // userId가 있으면 해당 유저의 프로필 정보를 가져옴
    const fetchUserProfile = async () => {
      try {
        const response = await api.get("/api/user/mypage", {
          params: {
            targetUserId: userId,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.data.success) {
          setProfileData(response.data.data);
          // Update following status from profile data
          setIsFollowing(response.data.data.isFollowing);
        }
      } catch (error) {
        // console.error("Failed to fetch user profile:", error);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId, userDetail?.userId, navigate]);

  // Remove the separate checkFollowStatus useEffect

  // profileData를 사용하도록 JSX 수정
  const displayData = profileData || userDetail;

  useEffect(() => {
    if (showEditModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // 컴포넌트 언마운트 시 스크롤 복구
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showEditModal]);

  // 팔로우/언팔로우 처리 함수 추가
  const handleFollowToggle = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

      if (isFollowing) {
        // 언팔로우 요청
        const response = await api.delete(`/api/follow?targetUserId=${userId}`, {
          headers,
        });
        if (response.data.success) {
          setIsFollowing(false);
        }
      } else {
        // 팔로우 요청
        const response = await api.post(`/api/follow?targetUserId=${userId}`, {}, { headers });
        if (response.data.success) {
          setIsFollowing(true);
        }
      }
    } catch (error) {
      // console.error("팔로우/언팔로우 작업 실패:", error);
    }
  };

  const getRandomColor = () => {
    const colors = [
      "#8BC34A", // 연한 녹색
      "#90CAF9", // 연한 파랑
      "#FFCC80", // 연한 주황
      "#F48FB1", // 연한 분홍
      "#CE93D8", // 연한 보라
      "#80DEEA", // 연한 시안
      "#9FA8DA", // 연한 인디고
      "#BCAAA4", // 연한 브라운
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <BlankBox>
      <ProfileContainer>
        <UserProfile>
          <UserInfo>
            <UserBasicInfo>
              {isOwnProfile ? (
                <ProfileImageUpload currentImageUrl={userDetail?.profileURL || "/default-profile.jpg"} />
              ) : (
                <ProfileImage>
                  <img src={displayData?.profileURL || "/default-profile.jpg"} alt="profile" />
                </ProfileImage>
              )}
              <UserNameSection>
                <IconContainer>
                  <IconButton
                    style={{ display: isOwnProfile ? "block" : "none" }}
                    onClick={() => setShowUserSearchModal(true)}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                  </IconButton>
                  <IconButton
                    style={{ display: isOwnProfile ? "block" : "none" }}
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.12-.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-7.43 2.52c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
                    </svg>
                  </IconButton>
                  {showSettings && (
                    <SettingsDropdown>
                      <DropdownItem onClick={() => setShowLogoutModal(true)}>로그아웃</DropdownItem>
                      <DropdownItem onClick={() => setShowDeleteModal(true)}>회원탈퇴</DropdownItem>
                    </SettingsDropdown>
                  )}
                </IconContainer>
                {/* Add UserSearchModal */}
                {showUserSearchModal && <UserSearchModal onClose={() => setShowUserSearchModal(false)} />}
                {/* Other modals */}
                {showLogoutModal && <LogoutModal onClose={() => setShowLogoutModal(false)} />}
                {showDeleteModal && <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />}
                <UserName>{displayData?.nickname || "사용자"}</UserName>
                <UserLevel>
                  <span onClick={() => navigate(`/profile/${userId}/followers`)} style={{ cursor: "pointer" }}>
                    팔로워 <strong>{displayData?.followers || 0}</strong>
                  </span>
                  {" | "}
                  <span onClick={() => navigate(`/profile/${userId}/followings`)} style={{ cursor: "pointer" }}>
                    팔로잉 <strong>{displayData?.followings || 0}</strong>
                  </span>
                </UserLevel>
                {isOwnProfile ? (
                  <EditButton onClick={() => setShowEditModal(true)}>프로필 수정</EditButton>
                ) : (
                  <ButtonContainer>
                    <FollowButton isFollowing={isFollowing} onClick={handleFollowToggle}>
                      {isFollowing ? "팔로잉" : "팔로우"}
                    </FollowButton>
                    <NestButton onClick={() => navigate(`/nest/${userId}?nestId=${profileData?.nestId || userId}`)}>둥지로 가기</NestButton>
                  </ButtonContainer>
                )}
              </UserNameSection>
            </UserBasicInfo>
          </UserInfo>
        </UserProfile>

        {showEditModal && (
          <EditInfoModal
            onClose={() => setShowEditModal(false)}
            userInfo={{
              nickname: displayData?.nickname || "",
              gender: displayData?.gender || "설정안함",
              birthdate: displayData?.birthdate || "",
            }}
          />
        )}

        <Divider />

        <UserStats>
          <div onClick={() => navigate(`${ROUTES.MY_EVALUATED_BOOKS}/${userId}`)}>
            <strong>{displayData?.totalRatings || 0}</strong>
            <div>평가</div>
          </div>
          <div onClick={() => navigate(`${ROUTES.MY_COMMENTS}/${userId}`)}>
            <strong>{displayData?.totalReviews || 0}</strong>
            <div>코멘트</div>
          </div>
        </UserStats>

        <Divider />

        <Section>
          <SectionTitle>아키타입</SectionTitle>
          <ArchetypeCard archetype={displayData?.archetype} />
        </Section>

        <Divider />

        <Section>
          <SectionTitle>선호태그</SectionTitle>
          <TagCloud>
            {(() => {
              const tags = [...(displayData?.favoriteTags || []), ...(displayData?.favoriteCategories || [])].slice(
                0,
                10
              );
              const rows = [
                tags.slice(0, 3), // 첫 번째 줄: 3개
                tags.slice(3, 7), // 두 번째 줄: 4개
                tags.slice(7, 10), // 세 번째 줄: 3개
              ];

              return rows.map((rowTags, rowIndex) => (
                <TagRow key={`row-${rowIndex}`}>
                  {rowTags.map((tag, index) => (
                    <Tag key={`tag-${rowIndex}-${index}`} color={getRandomColor()}>
                      {tag}
                    </Tag>
                  ))}
                </TagRow>
              ));
            })()}
          </TagCloud>
        </Section>

        <Divider />
        <Section>
          <SectionTitle>선호하는 작가</SectionTitle>
          <AuthorList>
            {displayData?.favoriteAuthors?.map((author, index) => (
              <AuthorItem key={`author-${index}`}>
                <img src={author.imageUrl} alt={author.name} />
                <div>{author.name}</div>
              </AuthorItem>
            )) || <div style={{ textAlign: "center", color: "#666" }}>선호하는 작가가 없습니다</div>}
          </AuthorList>
        </Section>
      </ProfileContainer>
    </BlankBox>
  );
};

export default ProfilePage;
