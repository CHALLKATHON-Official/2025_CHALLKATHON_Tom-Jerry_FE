import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Linking, Modal, Pressable, ScrollView } from 'react-native';
import { fetchNaverNews } from '../api/news';

const NewsHomeScreen = ({ navigation }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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
            onPress={() => {
              setSelectedNews(item);
              setModalVisible(true);
            }}
          >
            <Text style={styles.title}>{stripHtml(item.title)}</Text>
            <Text style={styles.desc} numberOfLines={2}>{stripHtml(item.description)}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>뉴스가 없습니다.</Text>}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
      />
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{selectedNews ? stripHtml(selectedNews.title) : ''}</Text>
              <Text style={styles.modalDesc}>{selectedNews ? stripHtml(selectedNews.description) : ''}</Text>
              <Pressable
                style={styles.urlButton}
                onPress={() => selectedNews && Linking.openURL(selectedNews.link)}
              >
                <Text style={styles.urlButtonText}>원문 보기</Text>
              </Pressable>
              <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>닫기</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
});

export default NewsHomeScreen; 