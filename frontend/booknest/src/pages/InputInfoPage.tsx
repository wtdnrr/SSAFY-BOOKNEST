import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // api 인스턴스 import 추가

// Daum Postcode API 타입 선언
declare global {
  interface Window {
    daum: {
      Postcode: new (config: any) => any;
    };
  }
}

// 스타일 컴포넌트 정의
const Container = styled.div`
  padding-top: 1rem;
  max-width: 500px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 32px;
  margin-bottom: 1rem;
  color: #00c473;
  text-align: center;
  width: 100%;
`;

const InputGroup = styled.div`
  margin-bottom: 1rem; // 20px
`;

const Label = styled.label`
  display: block;
  font-size: 16px; // 16px
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

const ConfirmButton = styled.button`
  background-color: #7bc47f;
  padding: 0.9375rem 1.25rem; // 15px 20px
  border-radius: 0.3125rem; // 5px
  border-style: none;
  margin-left: 0.625rem; // 10px
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
  color: #000000;
  font-size: 16px;
  box-sizing: border-box;
`;

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

const SubmitButton = styled.button`
  width: 100%;
  background-color: #7bc47f;
  padding: 15px;
  border: none;
  border-radius: 5px;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 30px;
  margin-bottom: 50px;
`;

// BirthDateContainer와 관련 스타일 컴포넌트 대신 새로운 스타일 컴포넌트 정의
const BirthDateInput = styled.input`
  width: 100%;
  height: 50px;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 0 15px;
  color: #000000;
  font-size: 16px;
  box-sizing: border-box;
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
  padding: 3.5%;
  width: 100%;
  max-width: 500px;
  height: 70vh;
  border-radius: 0.3125rem;
  overflow: visible;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 10px;
  top: 10px;
  border: none;
  background-color: transparent;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 5px;
  line-height: 1;

  &:hover {
    color: #000;
  }
`;

const InputInfoPage = () => {
  const [isNicknameValidated, setIsNicknameValidated] = useState(false);
  const navigate = useNavigate(); // 추가: useNavigate 훅 선언
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState(""); // 8자리 생년월일 (YYYYMMDD)
  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [oldAddress, setOldAddress] = useState("");
  const [zipcode, setZipcode] = useState(""); // 우편번호 상태 추가
  const [isNicknameValid, setIsNicknameValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Daum Postcode 스크립트 로드
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setNickname(text);
    setIsNicknameValid(text.length <= 10);
    setErrorMessage("");
    setIsNicknameValidated(false); // 닉네임이 변경되면 검증 상태 초기화
  };

  const checkNicknameDuplicate = async () => {
    // 빈 닉네임 체크 추가
    if (!nickname.trim()) {
      setIsNicknameValid(false);
      setErrorMessage("닉네임을 입력해주세요.");
      return;
    }

    // 이모지만 체크하고 특수문자와 숫자는 허용
    const hasEmoji = /\p{Extended_Pictographic}/u.test(nickname);
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
      const token = localStorage.getItem("token");
      const response = await api.get(`/api/user/nickname-check`, {
        params: { nickname },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // console.log("닉네임 중복 확인 응답:", response.data); // 디버깅용

      if (response.data.success) {
        const isDuplicate = response.data.data; // true면 중복
        setIsNicknameValid(!isDuplicate); // 중복이면 false, 아니면 true
        setIsNicknameValidated(!isDuplicate); // 중복이면 false, 아니면 true
        setErrorMessage(isDuplicate ? "이미 사용 중인 닉네임입니다." : "사용 가능한 닉네임입니다.");
      }
    } catch (error) {
      // console.error("닉네임 중복 확인 오류:", error);
      setIsNicknameValidated(false);
      setErrorMessage("닉네임 중복 확인 중 오류가 발생했습니다.");
    }
  };

  const handleFindAddress = () => {
    setIsAddressModalOpen(true);
  };

  const handleCloseAddressModal = () => {
    setIsAddressModalOpen(false);
  };

  // Daum Postcode 실행 함수
  const execDaumPostcode = () => {
    if (window.daum && window.daum.Postcode) {
      new window.daum.Postcode({
        width: "100%",
        height: "100%",
        animation: true,
        autoClose: false,
        oncomplete: function (data: any) {
          // 우편번호와 주소 정보 가져오기
          const zonecode = data.zonecode;
          let fullAddress = data.roadAddress || data.jibunAddress;
          let oldAddress = data.jibunAddress; // 지번 주소 저장
          let extraAddress = "";

          // 법정동명이 있을 경우 추가
          if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) {
            extraAddress += data.bname;
          }
          // 건물명이 있고, 공동주택일 경우 추가
          if (data.buildingName !== "" && data.apartment === "Y") {
            extraAddress += extraAddress !== "" ? ", " + data.buildingName : data.buildingName;
          }
          // 표시할 참고항목이 있을 경우 괄호까지 추가한 최종 문자열 생성
          if (extraAddress !== "") {
            fullAddress += ` (${extraAddress})`;
          }

          // 주소 정보 설정
          setZipcode(zonecode);
          setAddress(fullAddress);
          setOldAddress(oldAddress); // 지번 주소 상태 설정
          setIsAddressModalOpen(false);

          document.getElementById("detailAddress")?.focus();
        },
      }).embed(document.getElementById("addressLayer") as HTMLElement);
    }
  };

  // 주소 모달이 열릴 때 Daum Postcode 실행
  useEffect(() => {
    if (isAddressModalOpen) {
      execDaumPostcode();
    }
  }, [isAddressModalOpen]);

  // state 추가
  const [birthdateError, setBirthdateError] = useState("");

  const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      if (value.length <= 8) {
        setBirthdate(value);
        setBirthdateError(""); // 입력 시 에러 메시지 초기화

        if (value.length === 8) {
          const year = parseInt(value.substring(0, 4));
          const month = parseInt(value.substring(4, 6));
          const day = parseInt(value.substring(6, 8));

          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth() + 1;
          const currentDay = new Date().getDate();

          // 미래 날짜 체크
          if (
            year > currentYear ||
            (year === currentYear && month > currentMonth) ||
            (year === currentYear && month === currentMonth && day > currentDay)
          ) {
            setBirthdateError("미래의 날짜는 입력할 수 없습니다");
            return;
          }

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

  // JSX 부분 수정
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
  </InputGroup>;

  const formatBirthdate = (date: string): string => {
    if (date.length !== 8) return "";
    return `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
  };

  // handleSubmit 함수 수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // handleSubmit 함수 내부의 성별 처리 로직 수정
    let genderCode;
    if (gender === "남성") {
      genderCode = "M";
    } else if (gender === "여성") {
      genderCode = "F";
    } else if (gender === "기타") {
      genderCode = "O";
    } else {
      genderCode = "N"; // "설정안함"일 때 "N"으로 설정
    }

    const payload = {
      nickname,
      gender: genderCode,
      birthdate: formatBirthdate(birthdate),
      address: {
        zipcode,
        roadAddress: detailAddress ? `${address} ${detailAddress}` : address,
        oldAddress: oldAddress, // 지번 주소 추가
      },
    };

    try {
      const response = await api.put("/api/user/update", payload);
      if (response.data.success) {
        // console.log("회원 정보가 성공적으로 업데이트되었습니다.");
        navigate("/eval-book");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || "회원 정보 업데이트에 실패했습니다.";
      setErrorMessage(errorMessage);
    }
  };

  return (
    <Container>
      <Title>BookNEST</Title>

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
          <Label>
            성별<Required>*</Required>
          </Label>
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
          <Label>
            생년월일<Required>*</Required>
          </Label>
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
            type="text"
            placeholder="상세 주소를 입력해주세요"
            value={detailAddress}
            onChange={(e) => setDetailAddress(e.target.value)}
          />
        </InputGroup>

        <SubmitButton
          type="submit"
          disabled={!isNicknameValidated || gender === "" || birthdate.length !== 8 || birthdateError !== ""}
          style={{
            backgroundColor:
              isNicknameValidated && gender !== "" && birthdate.length === 8 && birthdateError === ""
                ? "#7bc47f"
                : "#cccccc",
            cursor:
              isNicknameValidated && gender !== "" && birthdate.length === 8 && birthdateError === ""
                ? "pointer"
                : "not-allowed",
          }}
        >
          {!isNicknameValidated
            ? "닉네임: 필수 정보입니다."
            : gender === ""
            ? "성별: 필수 정보입니다."
            : birthdate.length !== 8 || birthdateError !== ""
            ? "생년월일: 필수 정보입니다."
            : "정보 입력 완료"}
        </SubmitButton>
      </form>

      {isAddressModalOpen && (
        <AddressModal>
          <AddressModalContent>
            <CloseButton onClick={handleCloseAddressModal}>×</CloseButton>
            <div id="addressLayer" style={{ width: "100%", height: "400px" }}></div>
          </AddressModalContent>
        </AddressModal>
      )}
    </Container>
  );
};

export default InputInfoPage;
