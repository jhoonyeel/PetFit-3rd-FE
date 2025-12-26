import axios from 'axios';

import { ENV } from '@/constants/env';

import { axiosInstance, refreshAccessToken } from './axiosInstance';
import { unwrap, type ApiResponse } from '@/types/common';

/**
 * 카카오 로그인 요청
 * - dev: 응답에서 accessToken, refreshToken 반환
 * - prod: 쿠키(HttpOnly) 기반 자동 저장, 별도 응답 처리 없음
 */
export const kakaoLogin = async (code: string) => {
  const endpoint = ENV.IS_DEV ? '/auth/kakao/login/dev' : '/auth/kakao/login';
  try {
    await axiosInstance.get(endpoint, { params: { code } });
  } catch (error) {
    console.error('kakao login failed:', error);
    throw error;
  }
};

/**
 * 카카오 로그아웃 요청
 * - dev: refreshToken body로 전달
 * - prod: 쿠키 기반 로그아웃
 */
export const kakaoLogout = async () => {
  const endpoint = ENV.IS_DEV ? '/auth/kakao/logout/dev' : '/auth/kakao/logout';

  try {
    const body = ENV.IS_DEV ? { refreshToken: localStorage.getItem('refreshToken') } : undefined; // prod는 쿠키 기반이라 body 비움

    await axiosInstance.post(endpoint, body);
  } catch (error) {
    console.error('kakao logout failed:', error);
    throw error;
  }
};

/**
 * 카카오 회원탈퇴 (dev/prod 공통)
 */
export const kakaoWithdraw = async (memberId: number | null) => {
  try {
    await axios.post(`/auth/kakao/withdraw`, { memberId }, { withCredentials: true });
  } catch (error) {
    console.error('user delete failed: ', error);
    throw error;
  }
};

export const getNickname = async () => {
  try {
    const response = await axiosInstance.get(`members`);
    return response.data.content;
  } catch (error) {
    console.error('get nickname failed: ', error);
  }
};

export const editNickname = async (nickname: string) => {
  try {
    await axiosInstance.put(`members`, { nickname });
  } catch (error) {
    console.error('edit nickname failed: ', error);
  }
};

export type DemoScenario = 'noPet' | 'hasPet';

export const demoLogin = async (scenario: DemoScenario): Promise<void> => {
  await axiosInstance.post('/auth/demo-login', { scenario });
};

type AuthMeDto = { memberId: number; hasPet: boolean };
/**
 * 서버에 쿠키 기반 인증 상태 확인 요청
 */
export const getAuthMe = async (): Promise<AuthMeDto> => {
  const res = await axiosInstance.get<ApiResponse<AuthMeDto>>('/auth/me');
  return unwrap(res.data);
};

export const refreshAuth = async () => {
  await refreshAccessToken();
};
