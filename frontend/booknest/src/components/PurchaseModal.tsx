import React from 'react';
import styled from '@emotion/styled';
import kyoboLogo from '../assets/images/bookstore/kyobo.jpg';
import yes24Logo from '../assets/images/bookstore/yes24.png';
import aladinLogo from '../assets/images/bookstore/aladin.png';

interface PurchaseUrls {
  aladinUrl: string;
  kyoboUrl: string;
  yes24Url: string;
}

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseUrls: PurchaseUrls | null;
  isLoading: boolean;
  error: string | null;
}

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
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const LinkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PurchaseLink = styled.a`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: #333;
  background-color: #f8f9fa;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background-color: #e9ecef;
    transform: translateY(-2px);
  }
`;

const StoreLogoContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
`;

const StoreLogoLink = styled.a<{ disabled: boolean }>`
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
`;

const StoreLogo = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 12px;
  transition: transform 0.2s;
  object-fit: cover;
  border: 2px solid #00c437;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const StoreLogoCircle = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #00c437;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 196, 55, 0.3);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #dc3545;
`;

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  purchaseUrls,
  isLoading,
  error
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <Title>구매 가능한 온라인 서점</Title>
        
        {isLoading && (
          <LoadingMessage>구매 링크를 불러오는 중...</LoadingMessage>
        )}
        
        {error && (
          <ErrorMessage>{error}</ErrorMessage>
        )}
        
        {!isLoading && !error && purchaseUrls && (
          <>
            <StoreLogoContainer>
              <StoreLogoLink 
                href={purchaseUrls.kyoboUrl || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => !purchaseUrls.kyoboUrl && e.preventDefault()}
                disabled={!purchaseUrls.kyoboUrl}
              >
                <StoreLogoCircle>
                  <img src={kyoboLogo} alt="교보문고" />
                </StoreLogoCircle>
              </StoreLogoLink>
              
              <StoreLogoLink 
                href={purchaseUrls.yes24Url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => !purchaseUrls.yes24Url && e.preventDefault()}
                disabled={!purchaseUrls.yes24Url}
              >
                <StoreLogoCircle>
                  <img src={yes24Logo} alt="YES24" />
                </StoreLogoCircle>
              </StoreLogoLink>
              
              <StoreLogoLink 
                href={purchaseUrls.aladinUrl || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => !purchaseUrls.aladinUrl && e.preventDefault()}
                disabled={!purchaseUrls.aladinUrl}
              >
                <StoreLogoCircle>
                  <img src={aladinLogo} alt="알라딘" />
                </StoreLogoCircle>
              </StoreLogoLink>
            </StoreLogoContainer>
          </>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default PurchaseModal; 