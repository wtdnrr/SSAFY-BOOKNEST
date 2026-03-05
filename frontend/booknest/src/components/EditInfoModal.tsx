import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import api from "../api/axios";
import { useAuthStore } from "../store/useAuthStore";

declare global {
  interface Window {
    daum: {
      Postcode: new (config: any) => any;
    };
  }
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  overflow-y: scroll;
  scrollbar-width: none; // Firefox
  -ms-overflow-style: none; // IE and Edge
  &::-webkit-scrollbar {
    display: none; // Chrome, Safari, Opera
  }
`;

const ModalContainer = styled.div`
  background-color: white;
  padding: 3.5%;
  border-radius: 10px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto; // 모달 내부만 스크롤 가능
  position: relative; // CloseButton을 위한 position 설정
`;

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 1rem;
  color: #00c473;
  text-align: center;
`;

// InputInfoPage의 스타일 컴포넌트들을 그대로 가져옴
const InputGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  font-size: 16px;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Required = styled.span`
  color: #ff0000;
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
`;

const NicknameInput = styled.input`
  flex: 1;
  width: 70%;
  height: 3.125rem; // 50px
  border: 0.0625rem solid #ddd; // 1px
  border-radius: 0.3125rem; // 5px
  padding: 0 0.9375rem; // 0 15px
  font-size: 16px;
  box-sizing: border-box;
  background-color: #ffffff;
`;

const ConfirmButton = styled.button`
  background-color: #7bc47f;
  padding: 0.9375rem 1.25rem;
  border-radius: 0.3125rem;
  border-style: none;
  margin-left: 0.625rem;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
`;

const ErrorText = styled.p`
  color: #ff0000;
  margin-top: 5px;
`;

const SuccessText = styled.p`
  color: #2ea043;
  margin-top: 5px;
`;

const SelectContainer = styled.div`
  border: 1px solid #ddd;
  border-radius: 5px;
  overflow: hidden;
`;

const Select = styled.select`
  width: 100%;
  height: 50px;
  border: none;
  outline: none;
  background-color: #ffffff;
  padding: 0 15px;
  font-size: 16px;
`;

const BirthDateInput = styled.input`
  width: 100%;
  height: 50px;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 0 15px;
  font-size: 16px;
  background-color: #ffffff;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

// 주소 관련 스타일 컴포넌트 추가
const AddressRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const AddressInput = styled.input`
  flex: 1;
  width: 70%;
  height: 50px;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 0 15px;
  font-size: 16px;
  background-color: #ffffff;
`;

const AddressButton = styled.button`
  background-color: #7bc47f;
  padding: 15px 20px;
  border: none;
  border-radius: 5px;
  margin-left: 10px;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
`;

const FullInput = styled.input`
  flex: 1;
  width: 100%;
  height: 50px;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 0 15px;
  font-size: 16px;
  background-color: #ffffff;
`;

const AddressModal = styled.div`
  display: flex;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  justify-content: center;
  align-items: center;
`;

const AddressModalContent = styled.div`
  background-color: white;
  padding: 1.25rem;
  height: 70%;
  border-radius: 0.3125rem;
  overflow: visible;
  position: relative;
`;

// Props 인터페이스 수정
interface EditInfoModalProps {
  onClose: () => void;
  userInfo: {
    nickname: string;
    gender: string;
    birthdate: string;
    address?: {
      zipcode: string;
      roadAddress: string;
      oldAddress: string;
    };
  };
}

const EditInfoModal = ({ onClose, userInfo }: EditInfoModalProps) => {
  const { userDetail } = useAuthStore();
  const [isNicknameValidated, setIsNicknameValidated] = useState(true);
  const [nickname, setNickname] = useState(userDetail?.nickname || userInfo.nickname);
  const [gender, setGender] = useState(() => {
    // 성별 코드를 표시 텍스트로 변환
    switch (userDetail?.gender || userInfo.gender) {
      case "M":
        return "남성";
      case "F":
        return "여성";
      case "O":
        return "기타";
      default:
        return "설정안함";
    }
  });
  const [birthdate, setBirthdate] = useState((userDetail?.birthDate || userInfo.birthdate)?.replace(/-/g, "") || "");

  // 주소 정보 초기화
  // Remove these duplicate state declarations
  // const [address, setAddress] = useState(userDetail?.roadAddress || userInfo.address?.roadAddress || "");
  // const [zipcode, setZipcode] = useState(userDetail?.zipcode || userInfo.address?.zipcode || "");

  const [isNicknameValid, setIsNicknameValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [birthdateError, setBirthdateError] = useState("");

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setNickname(text);
    setIsNicknameValid(text.length <= 10);
    setErrorMessage("");
    setIsNicknameValidated(false);
  };

  const checkNicknameDuplicate = async () => {
    // 이모지만 체크하는 정규식으로 수정
    const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(nickname);
    const isOnlyWhitespace = /^\s*$/.test(nickname);

    if (hasEmoji) {
      setIsNicknameValid(false);
      setErrorMessage("이모지는 사용할 수 없습니다.");
      return;
    }

    if (isOnlyWhitespace) {
      setIsNicknameValid(false);
      setErrorMessage("공백만으로는 닉네임을 설정할 수 없습니다.");
      return;
    }

    try {
      const response = await api.get(`/api/user/nickname-check`, {
        params: { nickname },
      });

      if (response.data.success) {
        const isDuplicate = response.data.data;
        setIsNicknameValid(!isDuplicate);
        setIsNicknameValidated(!isDuplicate);
        setErrorMessage(isDuplicate ? "이미 사용 중인 닉네임입니다." : "사용 가능한 닉네임입니다.");
      }
    } catch (error) {
      setIsNicknameValidated(false);
      setErrorMessage("닉네임 중복 확인 중 오류가 발생했습니다.");
    }
  };

  const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      if (value.length <= 8) {
        setBirthdate(value);
        setBirthdateError("");

        if (value.length === 8) {
          const year = parseInt(value.substring(0, 4));
          const month = parseInt(value.substring(4, 6));
          const day = parseInt(value.substring(6, 8));

          const currentYear = new Date().getFullYear();
          if (year < 1900 || year > currentYear) {
            setBirthdateError("올바른 연도를 입력해주세요");
            return;
          }
          if (month < 1 || month > 12) {
            setBirthdateError("올바른 월을 입력해주세요");
            return;
          }
          if (day < 1 || day > 31) {
            setBirthdateError("올바른 일자를 입력해주세요");
            return;
          }
        }
      }
    }
  };

  const formatBirthdate = (date: string): string => {
    if (date.length !== 8) return "";
    return `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
  };

  // 주소 관련 state 추가
  const [address, setAddress] = useState(userInfo.address?.roadAddress || "");
  const [detailAddress, setDetailAddress] = useState("");
  const [oldAddress, setOldAddress] = useState(userInfo.address?.oldAddress || "");
  const [zipcode, setZipcode] = useState(userInfo.address?.zipcode || "");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // 다음 주소 API 스크립트 로드
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleFindAddress = () => {
    setIsAddressModalOpen(true);
  };

  const handleCloseAddressModal = () => {
    setIsAddressModalOpen(false);
  };

  const execDaumPostcode = () => {
    if (window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        oncomplete: function (data: any) {
          const zonecode = data.zonecode;
          let fullAddress = data.roadAddress || data.jibunAddress;
          let oldAddress = data.jibunAddress;
          let extraAddress = "";

          if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) {
            extraAddress += data.bname;
          }
          if (data.buildingName !== "" && data.apartment === "Y") {
            extraAddress += extraAddress !== "" ? ", " + data.buildingName : data.buildingName;
          }
          if (extraAddress !== "") {
            fullAddress += ` (${extraAddress})`;
          }

          setZipcode(zonecode);
          setAddress(fullAddress);
          setOldAddress(oldAddress);
          setIsAddressModalOpen(false);
        },
      }).embed(document.getElementById("addressLayer") as HTMLElement);
    }
  };

  useEffect(() => {
    if (isAddressModalOpen) {
      execDaumPostcode();
    }
  }, [isAddressModalOpen]);

  // handleSubmit 함수 수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let genderCode;
    if (gender === "남성") {
      genderCode = "M";
    } else if (gender === "여성") {
      genderCode = "F";
    } else if (gender === "기타") {
      genderCode = "O";
    } else {
      genderCode = "N";
    }

    const payload = {
      nickname,
      gender: genderCode,
      birthdate: formatBirthdate(birthdate),
      address: {
        zipcode,
        roadAddress: detailAddress ? `${address} ${detailAddress}` : address,
        oldAddress: oldAddress,
      },
    };

    try {
      const response = await api.put("/api/user/update", payload);
      if (response.data.success) {
        // store의 userDetail 정보도 업데이트
        const updatedUserDetail = {
          ...userDetail!,
          nickname,
          gender: genderCode,
          birthDate: formatBirthdate(birthdate),
          roadAddress: detailAddress ? `${address} ${detailAddress}` : address,
          zipcode,
        };
        useAuthStore.getState().setUserDetail(updatedUserDetail);

        onClose();
        window.location.reload();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || "회원 정보 업데이트에 실패했습니다.";
      setErrorMessage(errorMessage);
    }
  };

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContainer>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <Title>프로필 수정</Title>

        <form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>
              닉네임<Required>*</Required>
            </Label>
            <InputRow>
              <NicknameInput
                type="text"
                placeholder="사용하실 닉네임을 입력해주세요"
                value={nickname}
                onChange={handleNicknameChange}
              />
              <ConfirmButton type="button" onClick={checkNicknameDuplicate}>
                중복 확인
              </ConfirmButton>
            </InputRow>
            {!isNicknameValid && errorMessage && <ErrorText>{errorMessage}</ErrorText>}
            {isNicknameValid && errorMessage && <SuccessText>{errorMessage}</SuccessText>}
          </InputGroup>

          <InputGroup>
            <Label>성별</Label>
            <SelectContainer>
              <Select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="설정안함">설정안함</option>
                <option value="남성">남성</option>
                <option value="여성">여성</option>
                <option value="기타">기타</option>
              </Select>
            </SelectContainer>
          </InputGroup>

          <InputGroup>
            <Label>생년월일</Label>
            <BirthDateInput
              type="text"
              placeholder="생년월일 8자리를 입력해주세요 (예: 19990101)"
              value={birthdate}
              onChange={handleBirthdateChange}
              maxLength={8}
            />
            {birthdateError && <ErrorText>{birthdateError}</ErrorText>}
          </InputGroup>

          <InputGroup>
            <Label>주소</Label>
            <AddressRow>
              <AddressInput type="text" placeholder="주소를 검색해주세요" value={address} readOnly />
              <AddressButton type="button" onClick={handleFindAddress}>
                주소 검색
              </AddressButton>
            </AddressRow>
            <FullInput
              id="detailAddress"
              type="text"
              placeholder="상세 주소를 입력해주세요"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
            />
          </InputGroup>

          <ConfirmButton
            type="submit"
            disabled={!isNicknameValidated}
            style={{
              width: "100%",
              backgroundColor: isNicknameValidated ? "#7bc47f" : "#cccccc",
              cursor: isNicknameValidated ? "pointer" : "not-allowed",
              marginTop: "20px",
            }}
          >
            {isNicknameValidated ? "수정 완료" : "닉네임: 필수 정보입니다."}
          </ConfirmButton>
        </form>

        {isAddressModalOpen && (
          <AddressModal>
            <AddressModalContent>
              <CloseButton onClick={handleCloseAddressModal}>×</CloseButton>
              <div id="addressLayer" style={{ width: "100%", height: "400px" }}></div>
            </AddressModalContent>
          </AddressModal>
        )}
      </ModalContainer>
    </ModalOverlay>
  );
};

export default EditInfoModal;
