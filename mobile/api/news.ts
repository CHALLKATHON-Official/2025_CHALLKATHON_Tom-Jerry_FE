import apiClient from './config';

export const fetchRealtimeNews = async () => {
  const res = await apiClient.get('/news/google');
  return res.data.articles;
};

export const fetchNews = async (limit = 10, offset = 0) => {
  const res = await apiClient.get('/news', { params: { limit, offset } });
  return res.data.news;
}; 