import apiClient from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authAPI = {
  // 로그인
  login: (phoneNumber: string, password: string) => {
    return apiClient.post('/auth/login', {
      phone_number: phoneNumber,
      password
    });
  },

  // 회원가입
  register: (userData: any) => {
    return apiClient.post('/auth/register', userData);
  },

  // 로그아웃
  logout: async () => {
    await AsyncStorage.removeItem('token');
  },

  // 토큰 검증
  verifyToken: () => {
    return apiClient.get('/auth/verify');
  }
}; 