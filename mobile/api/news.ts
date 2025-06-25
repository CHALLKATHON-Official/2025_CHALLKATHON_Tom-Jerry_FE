import apiClient from './config';

export const fetchNaverNews = async (query = '미국증시', display = 10) => {
  const res = await apiClient.get('/news/naver-open', { params: { query, display } });
  return res.data.items;
};

export const fetchNews = async (limit = 10, offset = 0) => {
  const res = await apiClient.get('/news', { params: { limit, offset } });
  return res.data.news;
}; 