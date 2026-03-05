import React, { useState } from "react";

interface WriteCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
}

const WriteCommentModal = ({ isOpen, onClose, bookTitle }: WriteCommentModalProps) => {
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "500px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{bookTitle}</h3>
        <textarea
          style={{
            width: "100%",
            height: "100px",
            margin: "10px 0",
            padding: "8px",
          }}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="한줄평을 작성해주세요"
        />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <button onClick={onClose}>취소</button>
          <button
            onClick={() => {
              // 나중에 저장 로직 추가
              onClose();
            }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default WriteCommentModal;
