import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking } from 'react-native';

const NewsDetailScreen = ({ route }) => {
  const { news } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{news.title}</Text>
      {news.summary ? <Text style={styles.content}>{news.summary}</Text> : null}
      {news.pubDate ? <Text style={styles.date}>{news.pubDate}</Text> : null}
      <Text style={styles.link} onPress={() => Linking.openURL(news.url)}>
        원문 보기
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  content: { fontSize: 16, marginBottom: 20 },
  date: { color: '#888', fontSize: 13, marginBottom: 12 },
  link: { color: '#3897f0', textDecorationLine: 'underline', fontSize: 15 },
});

export default NewsDetailScreen; 