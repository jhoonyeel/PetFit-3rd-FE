import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { kakaoLogout } from '@/apis/auth';
import { axiosInstance } from '@/apis/axiosInstance';
import { BaseModal } from '@/components/common/BaseModal';
import { ENV } from '@/constants/env';
import { logout } from '@/store/authSlice';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoutModal = ({ isOpen, onClose }: Props) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onConfirm = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // 1) 백엔드 로그아웃 API 호출(Prod: 쿠키 제거, Dev: body로 RT 전달)
      await kakaoLogout();

      // 2) 개발환경이면 로컬 토큰 정리
      if (ENV.IS_DEV) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        delete axiosInstance.defaults.headers.common.Authorization;
      }

      // 3) 전역 상태/캐시 초기화
      dispatch(logout());
      await queryClient.cancelQueries(); // 진행중 요청 중단
      queryClient.removeQueries({ predicate: () => true }); // 민감 캐시 제거

      // 4) 로그인 화면으로 이동
      navigate('/login', { replace: true });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div>
      <BaseModal isOpen={isOpen} onClose={onClose}>
        <Message>정말 로그아웃하시겠어요?</Message>
        <ButtonRow>
          <CancelButton onClick={onClose}>취소</CancelButton>
          <ConfirmButton onClick={onConfirm}>로그아웃</ConfirmButton>
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

  color: #373737;
  background: #ffc533;
  border-radius: 6px;
`;
