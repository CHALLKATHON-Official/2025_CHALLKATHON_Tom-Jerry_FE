import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// HuggingFace 요약 API 관련 상수 및 함수
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn';
const HUGGINGFACE_API_TOKEN = process.env.EXPO_PUBLIC_HUGGINGFACE_API_TOKEN; // 환경변수로 관리

// 뉴스 본문 요약 함수
async function summarizeText(text, maxLen = 255) {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  try {
    const response = await fetch(HUGGINGFACE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text })
    });
    const data = await response.json();
    if (Array.isArray(data) && data[0]?.summary_text) {
      return data[0].summary_text.slice(0, maxLen);
    }
    return text.slice(0, maxLen);
  } catch (e) {
    return text.slice(0, maxLen);
  }
}

const NewsDetailScreen = ({ route, navigation }) => {
  const { news } = route.params;
  const [summary, setSummary] = useState(news.summary || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 뉴스 요약이 없고 description이 있으면 요약 시도
    if (!news.summary && news.description) {
      setLoading(true);
      const plainDesc = news.description.replace(/<[^>]+>/g, '');
      summarizeText(plainDesc).then(s => {
        setSummary(s);
        setLoading(false);
      });
    }
  }, [news]);

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 뉴스 제목 (HTML 태그 제거) */}
        <Text style={styles.title}>{news.title.replace(/<[^>]+>/g, '')}</Text>
        {/* 요약 로딩 중이면 인디케이터, 아니면 요약문 */}
        {loading ? (
          <ActivityIndicator size="small" color="#3897f0" style={{ marginVertical: 20 }} />
        ) : (
          <Text style={styles.content}>{summary}</Text>
        )}
        {/* 발행일 */}
        {news.pubDate ? <Text style={styles.date}>{news.pubDate}</Text> : null}
        {/* 원문 링크 */}
        <Text style={styles.link} onPress={() => Linking.openURL(news.link || news.url)}>
          원문 보기
        </Text>
      </ScrollView>
      {/* 오른쪽 하단 플로팅 버튼: 여론조사 개설로 이동 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('PollCreate', { article: news })}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  content: { fontSize: 16, marginBottom: 20 },
  date: { color: '#888', fontSize: 13, marginBottom: 12 },
  link: { color: '#3897f0', textDecorationLine: 'underline', fontSize: 15 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3897f0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});

export default NewsDetailScreen; 