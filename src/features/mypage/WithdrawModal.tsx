import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { kakaoWithdraw } from '@/apis/auth';
import { axiosInstance } from '@/apis/axiosInstance';
import { BaseModal } from '@/components/common/BaseModal';
import { ENV } from '@/constants/env';
import { clearAuth } from '@/store/authSlice';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawModal = ({ isOpen, onClose }: Props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);

  const onConfirm = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // 1) 회원 탈퇴 요청 (서버에서 계정 삭제 + 세션/쿠키 무효화 권장)
      await kakaoWithdraw();

      // 2) 클라이언트 상태/캐시 정리
      if (ENV.IS_DEV) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        delete axiosInstance.defaults.headers.common.Authorization;
      }

      dispatch(clearAuth());
      await queryClient.cancelQueries();
      queryClient.removeQueries({ predicate: () => true });

      // 3) 라우팅
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('회원 탈퇴 failed:', error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div>
      <BaseModal isOpen={isOpen} onClose={onClose}>
        <Message>정말 탈퇴하시겠어요?</Message>
        <ButtonRow>
          <CancelButton onClick={onClose}>취소</CancelButton>
          <ConfirmButton onClick={onConfirm}>탈퇴하기</ConfirmButton>
        </ButtonRow>
      </BaseModal>
    </div>
  );
};

const Message = styled.p`
  font-size: 18px;
  font-weight: 500;
  text-align: center;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 8px 12px;
  font-size: 14px;

  color: #a5a5a5;
  background: #f0f0f0;
  border-radius: 6px;
`;

const ConfirmButton = styled.button`
  flex: 1;
  padding: 8px 12px;
  font-size: 14px;

  color: #ffffff;
  background: #ff5c33;
  border-radius: 6px;
`;
