import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { fetchNaverNews } from '../api/news';

const NewsHomeScreen = ({ navigation }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={news}
        keyExtractor={item => item.link}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('NewsDetail', { news: item })}
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
});

export default NewsHomeScreen; 