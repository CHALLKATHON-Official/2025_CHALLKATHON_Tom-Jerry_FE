import React, { useState, useCallback } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { pollsAPI } from '../api/polls';
import { useFocusEffect } from '@react-navigation/native';

const CATEGORIES = ['All', '정치', '경제', '사회', '생활/문화', 'IT/과학', '세계', '엔터', '스포츠'];

const PollsScreen = ({ navigation }) => {
  const [polls, setPolls] = useState([]);
  const [popularPolls, setPopularPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const res = await pollsAPI.getPolls();
      setPolls(res.data.polls || []);
      setPopularPolls((res.data.polls || []).slice(0, 5));
    } catch (e) {
      // 에러 발생 시 처리
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPolls();
    }, [])
  );

  const filteredPolls = polls.filter(poll =>
    (selectedCategory === 'All' || poll.category === selectedCategory) &&
    (search === '' || poll.title.includes(search) || poll.description.includes(search))
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#3897f0" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  // FlatList의 헤더에 고정 UI(검색, 인기, 카테고리, 개설 버튼 등) 배치
  const renderHeader = () => (
    <>
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
    </>
  );

  // 여론조사 항목 렌더링: 카테고리 뱃지를 오른쪽 상단에 배치, 각 영역 분리
  const renderPollItem = ({ item, index }) => {
    const totalVotes = typeof item.participant_count === 'number' ? item.participant_count : (item.Options?.reduce((sum, option) => sum + Number(option.response_count || 0), 0) || 0);
    const bgColor = index % 2 === 0 ? '#eaf4ff' : '#fff';
    return (
      <TouchableOpacity
        style={[styles.pollItem, { backgroundColor: bgColor, borderRadius: 12, marginBottom: 12 }]}
        onPress={() => navigation.navigate('PollDetail', { pollId: item.poll_id })}
      >
        {/* 상단: 제목(좌), 카테고리(우) */}
        <View style={styles.pollHeaderRow}>
          <Text
            style={[styles.title, { flex: 1, marginRight: 8 }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.title}
          </Text>
          <View style={[styles.categoryBadge, { flexShrink: 0 }]}>
            <Text style={styles.pollCategory}>{item.category}</Text>
          </View>
        </View>
        {/* 설명 */}
        <Text style={styles.desc}>{item.description}</Text>
        {/* 오른쪽 하단에 총 참여수 */}
        <View style={styles.pollFooter}>
          <View style={{ flex: 1 }} />
          <Text style={styles.pollVotes}>총 참여수: {totalVotes}명</Text>
        </View>
        {/* 뉴스 기반 여론조사라면 기사 제목 표시 */}
        {item.article && item.article.title && (
          <Text style={styles.articleTitle}>📰 {item.article.title}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredPolls}
        keyExtractor={item => item.poll_id.toString()}
        renderItem={renderPollItem}
        extraData={filteredPolls}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={<Text style={{ textAlign: 'center', margin: 32, color: '#aaa' }}>여론조사가 없습니다.</Text>}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 32 },
  searchBar: { backgroundColor: '#f0f0f0', borderRadius: 8, padding: 14, margin: 16, alignItems: 'center' },
  searchText: { color: '#3897f0', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 16, marginBottom: 8 },
  popularCard: { backgroundColor: '#eaf4ff', borderRadius: 12, padding: 16, paddingHorizontal: 20, marginRight: 12, width: 220 },
  popularTitle: { fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  popularDesc: { color: '#555', fontSize: 13 },
  categoryBar: { flexDirection: 'row', marginBottom: 8, marginLeft: 8 },
  categoryBtn: { borderWidth: 1, borderColor: '#3897f0', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, backgroundColor: '#fff' },
  categoryBtnSelected: { backgroundColor: '#3897f0', borderColor: '#3897f0' },
  createPollBox: { backgroundColor: '#f7faff', borderRadius: 10, padding: 18, margin: 16, alignItems: 'center', borderWidth: 1, borderColor: '#3897f0' },
  createPollText: { color: '#3897f0', fontWeight: 'bold', fontSize: 16 },
  pollItem: { 
    padding: 16, 
    borderBottomWidth: 0, // 블럭형으로 변경
  },
  pollHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    minHeight: 24,
  },
  title: { fontWeight: 'bold', fontSize: 16 },
  desc: { color: '#666', marginTop: 4 },
  trendingCard: { backgroundColor: '#f7faff', borderRadius: 12, padding: 16, paddingHorizontal: 20, marginRight: 12, width: 220 },
  articleTitle: { color: '#888', fontSize: 13, marginTop: 4, fontStyle: 'italic' },
  categoryBadge: {
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: 8,
    marginBottom: 0,
  },
  pollCategory: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: 'bold',
    marginBottom: 0,
  },
  pollFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  pollVotes: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: 'bold',
    textAlign: 'right',
  },
});

export default PollsScreen; 