import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Linking, Modal, Pressable, ScrollView } from 'react-native';
import { fetchNaverNews } from '../api/news';

const NEWS_CATEGORIES = ['All', '정치', '경제', '사회', '생활/문화', 'IT/과학', '세계', '엔터', '스포츠'];

const NewsHomeScreen = ({ navigation }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchNaverNews()
      .then(setNews)
      .catch(err => {
        alert('뉴스를 불러오지 못했습니다: ' + (err?.message || '네트워크 오류'));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;

  // 네이버 뉴스는 title/description에 HTML 태그가 포함되어 있으므로, 간단히 태그 제거
  const stripHtml = (html) => html.replace(/<[^>]+>/g, '');

  // 카테고리별 필터링
  const filteredNews = selectedCategory === 'All'
    ? news
    : news.filter(n => n.category === selectedCategory || (n.category == null && n.title && n.title.includes(selectedCategory)));

  return (
    <SafeAreaView style={styles.container}>
      {/* 카테고리 버튼 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar}>
        {NEWS_CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryBtn, selectedCategory === cat && styles.categoryBtnSelected]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={{ color: selectedCategory === cat ? '#fff' : '#3897f0', fontWeight: 'bold' }}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList
        data={filteredNews}
        keyExtractor={item => item.link}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              navigation.navigate('NewsDetail', { news: item });
            }}
          >
            <Text style={styles.title}>{stripHtml(item.title)}</Text>
            <Text style={styles.desc} numberOfLines={2}>{stripHtml(item.description)}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>뉴스가 없습니다.</Text>}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  item: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 16, fontWeight: 'bold' },
  desc: { fontSize: 14, color: '#666', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '85%', maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  modalDesc: { fontSize: 15, color: '#444', marginBottom: 20 },
  urlButton: { backgroundColor: '#3897f0', borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 12 },
  urlButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  closeButton: { alignItems: 'center', padding: 8 },
  closeButtonText: { color: '#3897f0', fontSize: 15 },
  categoryBar: {
    flexDirection: 'row',
    marginBottom: 12,
    marginTop: 8,
  },
  categoryBtn: {
    borderWidth: 1,
    borderColor: '#3897f0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  categoryBtnSelected: {
    backgroundColor: '#3897f0',
  },
});

export default NewsHomeScreen; 