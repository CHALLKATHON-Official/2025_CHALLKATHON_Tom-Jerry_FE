import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { pollsAPI } from '../api/polls';

const PollSearchScreen = ({ navigation }) => {
  const [polls, setPolls] = useState([]);
  const [popularPolls, setPopularPolls] = useState([]);
  const [trendingPolls, setTrendingPolls] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pollsAPI.getPolls().then(res => {
      const allPolls = res.data.polls || [];
      setPolls(allPolls);
      setPopularPolls(allPolls.slice(0, 5)); // 예시: 상위 5개 인기
      setTrendingPolls(allPolls.slice(5, 10)); // 예시: 다음 5개 급상승
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (search === '') {
      setSearchResults([]);
    } else {
      setSearchResults(
        polls.filter(poll =>
          poll.title.includes(search) || poll.description.includes(search)
        )
      );
    }
  }, [search, polls]);

  if (loading) {
    return <ActivityIndicator size="large" color="#3897f0" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* 검색 입력창 */}
      <TextInput
        style={styles.searchInput}
        placeholder="여론조사 키워드 검색"
        value={search}
        onChangeText={setSearch}
      />

      {/* 실시간 인기 여론조사 */}
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

      {/* 급상승 여론조사 */}
      <Text style={styles.sectionTitle}>급상승 여론조사</Text>
      <FlatList
        data={trendingPolls}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.poll_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.trendingCard} onPress={() => navigation.navigate('PollDetail', { pollId: item.poll_id })}>
            <Text style={styles.trendingTitle}>{item.title}</Text>
            <Text style={styles.trendingDesc} numberOfLines={2}>{item.description}</Text>
          </TouchableOpacity>
        )}
        style={{ marginBottom: 16 }}
      />

      {/* 검색 결과 */}
      {search !== '' && (
        <>
          <Text style={styles.sectionTitle}>검색 결과</Text>
          <FlatList
            data={searchResults}
            keyExtractor={item => item.poll_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultCard} onPress={() => navigation.navigate('PollDetail', { pollId: item.poll_id })}>
                <Text style={styles.resultTitle}>{item.title}</Text>
                <Text style={styles.resultDesc} numberOfLines={2}>{item.description}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{ textAlign: 'center', margin: 32, color: '#aaa' }}>검색 결과가 없습니다.</Text>}
          />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchInput: { backgroundColor: '#f0f0f0', borderRadius: 8, padding: 14, margin: 16, fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 16, marginBottom: 8 },
  popularCard: { backgroundColor: '#eaf4ff', borderRadius: 12, padding: 16, marginRight: 12, width: 220 },
  popularTitle: { fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  popularDesc: { color: '#555', fontSize: 13 },
  trendingCard: { backgroundColor: '#fff3e6', borderRadius: 12, padding: 16, marginRight: 12, width: 220, borderWidth: 1, borderColor: '#ffd699' },
  trendingTitle: { fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  trendingDesc: { color: '#555', fontSize: 13 },
  resultCard: { backgroundColor: '#f7faff', borderRadius: 12, padding: 16, marginBottom: 12 },
  resultTitle: { fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  resultDesc: { color: '#555', fontSize: 13 },
});

export default PollSearchScreen; 