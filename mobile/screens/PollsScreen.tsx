import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { pollsAPI } from '../api/polls';

const CATEGORIES = ['All', '정치', '경제', '사회', '생활/문화', 'IT/과학', '세계', '엔터', '스포츠'];

const PollsScreen = ({ navigation }) => {
  const [polls, setPolls] = useState([]);
  const [popularPolls, setPopularPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    pollsAPI.getPolls().then(res => {
      setPolls(res.data.polls || []);
      setPopularPolls((res.data.polls || []).slice(0, 5)); // 예시: 상위 5개 인기
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredPolls = polls.filter(poll =>
    (selectedCategory === 'All' || poll.category === selectedCategory) &&
    (search === '' || poll.title.includes(search) || poll.description.includes(search))
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#3897f0" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* 검색 버튼/입력창 */}
      <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('PollSearch')}>
        <Text style={styles.searchText}>여론조사 검색하기</Text>
      </TouchableOpacity>

      {/* 실시간 인기 여론조사 (가로 스크롤) */}
      <Text style={styles.sectionTitle}>실시간 인기 여론조사</Text>
      <FlatList
        data={popularPolls}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.poll_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.popularCard} onPress={() => navigation.navigate('PollDetail', { pollId: item.poll_id })}>
            <Text style={styles.popularTitle}>{item.title}</Text>
            <Text style={styles.popularDesc} numberOfLines={2}>{item.description}</Text>
          </TouchableOpacity>
        )}
        style={{ marginBottom: 16 }}
      />

      {/* 카테고리 선택 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryBtn, selectedCategory === cat && styles.categoryBtnSelected]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={{ color: selectedCategory === cat ? '#fff' : '#3897f0', fontWeight: 'bold' }}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 여론조사 개설 버튼 */}
      <TouchableOpacity style={styles.createPollBox} onPress={() => navigation.navigate('PollCreate')}>
        <Text style={styles.createPollText}>여론조사를 개설하고 싶으신가요?</Text>
      </TouchableOpacity>

      {/* 여론조사 목록 */}
      <FlatList
        data={filteredPolls}
        keyExtractor={item => item.poll_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.pollItem}
            onPress={() => navigation.navigate('PollDetail', { pollId: item.poll_id })}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.description}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', margin: 32, color: '#aaa' }}>여론조사가 없습니다.</Text>}
        style={{ marginTop: 16 }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchBar: { backgroundColor: '#f0f0f0', borderRadius: 8, padding: 14, margin: 16, alignItems: 'center' },
  searchText: { color: '#3897f0', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 16, marginBottom: 8 },
  popularCard: { backgroundColor: '#eaf4ff', borderRadius: 12, padding: 16, marginRight: 12, width: 220 },
  popularTitle: { fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  popularDesc: { color: '#555', fontSize: 13 },
  categoryBar: { flexDirection: 'row', marginBottom: 8, marginLeft: 8 },
  categoryBtn: { borderWidth: 1, borderColor: '#3897f0', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, backgroundColor: '#fff' },
  categoryBtnSelected: { backgroundColor: '#3897f0', borderColor: '#3897f0' },
  createPollBox: { backgroundColor: '#f7faff', borderRadius: 10, padding: 18, margin: 16, alignItems: 'center', borderWidth: 1, borderColor: '#3897f0' },
  createPollText: { color: '#3897f0', fontWeight: 'bold', fontSize: 16 },
  pollItem: { padding: 16, borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontWeight: 'bold', fontSize: 16 },
  desc: { color: '#666', marginTop: 4 },
});

export default PollsScreen; 