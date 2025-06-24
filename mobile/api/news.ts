import axios from 'axios';

export const fetchRealtimeNews = async () => {
  const res = await axios.get('http://localhost:3001/news/realtime');
  return res.data.articles;
}; 