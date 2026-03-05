import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import api from '../api/axios';
import axios from 'axios';

interface CommentFormProps {
  bookId: number;
  reviewId?: number;
  initialContent?: string;
  onCommentSubmit?: () => void;
  onCommentDelete?: (reviewId: number) => void;
  isEdit?: boolean;
  onCancel?: () => void;
}

interface ReviewRequest {
  content: string;
}

interface ReviewResponse {
  success: boolean;
  data: null;
  error: null | {
    code: string;
    message: string;
    retryAfter?: number;
  };
}

const FormContainer = styled.div`
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
`;

const Title = styled.h3`
  font-size: 18px;
  color: #333;
  margin-bottom: 16px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #00c437;
    box-shadow: 0 0 0 2px rgba(0, 196, 55, 0.1);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled(Button)`
  background-color: #00c437;

  &:hover:not(:disabled) {
    background-color: #00b030;
  }
`;

const CancelButton = styled(SubmitButton)`
  background-color: #e9ecef;
  color: #495057;

  &:hover {
    background-color: #dee2e6;
  }
`;

const DeleteButton = styled(Button)`
  background-color: #9e9e9e;

  &:hover:not(:disabled) {
    background-color: #757575;
  }
`;

const ErrorMessage = styled.div`
  color: #ff0000;
  font-size: 14px;
  margin-top: 8px;
`;

const CommentForm = ({ 
  bookId, 
  reviewId, 
  initialContent = '', 
  onCommentSubmit,
  onCommentDelete,
  isEdit = false,
  onCancel
}: CommentFormProps) => {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('한줄평이 입력되지 않았습니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const requestData = {
        content: content.trim()
      };

      // console.log('Sending request with data:', requestData);

      if (isEdit && reviewId) {
        // 수정 요청
        const response = await api.put<ReviewResponse>(
          `/api/book/review/${reviewId}`,
          requestData,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          onCommentSubmit?.();
          onCancel?.(); // 수정 모드 종료
        } else {
          setError(response.data.error?.message || '한줄평 수정에 실패했습니다.');
        }
      } else {
        // 새 리뷰 작성 요청
        const response = await api.post<ReviewResponse>(
          `/api/book/${bookId}/review`,
          requestData,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          setContent('');  // 새 리뷰 작성시에만 내용을 비움
          onCommentSubmit?.();
        } else {
          setError(response.data.error?.message || '한줄평 등록에 실패했습니다.');
        }
      }
    } catch (err) {
      // console.error('Full error object:', err);
      if (axios.isAxiosError(err)) {
        // console.log('Response data:', err.response?.data);
        const errorMessage = err.response?.data?.error?.message || '서버 오류가 발생했습니다.';
        setError(errorMessage);
      } else {
        setError('서버 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!reviewId) return;
    
    if (!window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await api.delete<ReviewResponse>(`/api/book/review/${reviewId}`);
      if (response.data.success) {
        if (onCommentDelete) {
          onCommentDelete(reviewId);
        }
      } else {
        setError(response.data.error?.message || '한줄평 삭제에 실패했습니다.');
      }
    } catch (err) {
      // console.error('Delete API Error:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('로그인이 필요한 서비스입니다.');
        } else if (err.response?.status === 403) {
          setError('이 요청을 수행할 권한이 없습니다.');
        } else if (err.response?.status === 404) {
          setError('도서를 찾을 수 없습니다.');
        } else {
          setError(err.response?.data?.error?.message || '리뷰 삭제에 실패했습니다.');
        }
      } else {
        setError('리뷰 삭제 중 오류가 발생했습니다.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setContent(initialContent);
    setError(null);
  };

  return (
    <FormContainer>
      <Form onSubmit={handleSubmit}>
        <TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="이 책에 대한 의견을 남겨주세요..."
          disabled={isSubmitting || isDeleting}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <ButtonContainer>
          {isEdit ? (
            <>
              {onCancel && (
                <CancelButton type="button" onClick={onCancel}>
                  취소
                </CancelButton>
              )}
              <ActionButtons>
                <SubmitButton 
                  type="submit" 
                  disabled={isSubmitting || isDeleting}
                >
                  {isSubmitting ? '수정 중...' : '수정'}
                </SubmitButton>
              </ActionButtons>
            </>
          ) : (
            <ActionButtons>
              <SubmitButton 
                type="submit" 
                disabled={isSubmitting || isDeleting}
              >
                {isSubmitting ? '등록 중...' : '등록'}
              </SubmitButton>
            </ActionButtons>
          )}
        </ButtonContainer>
      </Form>
    </FormContainer>
  );
};

export default CommentForm; 