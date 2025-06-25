import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NewsDetailScreen = ({ route, navigation }) => {
  const { news } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{news.title}</Text>
        {news.summary ? <Text style={styles.content}>{news.summary}</Text> : null}
        {news.pubDate ? <Text style={styles.date}>{news.pubDate}</Text> : null}
        <Text style={styles.link} onPress={() => Linking.openURL(news.url)}>
          원문 보기
        </Text>
      </ScrollView>

      {/* 오른쪽 하단 플로팅 원형 버튼 */}
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
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
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