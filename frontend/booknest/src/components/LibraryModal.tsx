import React from 'react';
import styled from '@emotion/styled';

interface LibraryBook {
  libraryName: string;
  availability: string;
  link: string;
}

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  libraryBooks: LibraryBook[] | null;
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
  position: relative;
`;

const Title = styled.h2`
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const LibraryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LibraryCard = styled.div`
  padding: 16px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background-color: #f8f9fa;
`;

const LibraryName = styled.h3`
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
`;

const AvailabilityTag = styled.span<{ isAvailable: boolean }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 12px;
  background-color: ${props => props.isAvailable ? '#e6f4ea' : '#fce8e8'};
  color: ${props => props.isAvailable ? '#1e7e34' : '#dc3545'};
`;

const LibraryLink = styled.a`
  display: inline-block;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 14px;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #45a049;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
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

const NoLibrariesMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
`;

const LibraryModal: React.FC<LibraryModalProps> = ({
  isOpen,
  onClose,
  libraryBooks,
  isLoading,
  error
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <Title>전자도서관 대출 가능 여부</Title>
        
        {isLoading && (
          <LoadingMessage>전자도서관 정보를 불러오는 중...</LoadingMessage>
        )}
        
        {error && (
          <ErrorMessage>{error}</ErrorMessage>
        )}
        
        {!isLoading && !error && libraryBooks && (
          <LibraryList>
            {libraryBooks.length > 0 ? (
              libraryBooks.map((library, index) => (
                <LibraryCard key={index}>
                  <LibraryName>{library.libraryName}</LibraryName>
                  <AvailabilityTag isAvailable={library.availability === '대출 가능'}>
                    {library.availability}
                  </AvailabilityTag>
                  <div>
                    <LibraryLink 
                      href={library.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ opacity: library.availability === '대출 중' ? 0.6 : 1 }}
                    >
                      도서관 바로가기
                    </LibraryLink>
                  </div>
                </LibraryCard>
              ))
            ) : (
              <NoLibrariesMessage>
                이용 가능한 전자도서관이 없습니다.
              </NoLibrariesMessage>
            )}
          </LibraryList>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default LibraryModal;
