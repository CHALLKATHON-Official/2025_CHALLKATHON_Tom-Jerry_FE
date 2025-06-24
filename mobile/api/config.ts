import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API 기본 설정
const API_BASE_URL = 'http://180.64.227.60:3001/api';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 자동 추가
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰이 만료되었거나 유효하지 않은 경우
      await AsyncStorage.removeItem('token');
      // 네비게이션 처리는 각 컴포넌트에서 처리
    }
    return Promise.reject(error);
  }
);

export default apiClient; 