import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { pollsAPI } from '../api/polls';

const MyParticipatedPollsScreen = ({ navigation }) => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 실제로는 내 계정 기준으로 필터링 필요
    pollsAPI.getPolls().then(res => {
      setPolls((res.data.polls || []).filter(p => p.isParticipated)); // isParticipated는 예시
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#3897f0" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>내가 참여 중인 여론조사</Text>
      <FlatList
        data={polls}
        keyExtractor={item => item.poll_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.pollRow}>
            <Text style={styles.pollTitle}>{item.title}</Text>
            <Text style={styles.participant}>{item.participant_count || 0}명 참여 중</Text>
            <TouchableOpacity style={styles.resultBtn} onPress={() => navigation.navigate('PollDetail', { pollId: item.poll_id })}>
              <Text style={styles.resultBtnText}>상세 보기</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', margin: 32, color: '#aaa' }}>참여한 여론조사가 없습니다.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  pollRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: '#f7faff', borderRadius: 8, padding: 12 },
  pollTitle: { flex: 2, fontWeight: 'bold', fontSize: 16 },
  participant: { flex: 1, color: '#3897f0', fontWeight: 'bold', textAlign: 'center' },
  resultBtn: { backgroundColor: '#3897f0', borderRadius: 8, padding: 8, flex: 1, alignItems: 'center' },
  resultBtnText: { color: '#fff', fontWeight: 'bold' },
});

export default MyParticipatedPollsScreen; 