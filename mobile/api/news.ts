import apiClient from './config';

export const fetchRealtimeNews = async () => {
  const res = await apiClient.get('/news/realtime');
  return res.data.articles;
}; 