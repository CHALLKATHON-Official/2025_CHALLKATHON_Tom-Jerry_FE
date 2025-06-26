import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { pollsAPI } from '../api/polls';

const MyPollsScreen = ({ navigation }) => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 실제로는 내 계정 기준으로 필터링 필요
    pollsAPI.getPolls().then(res => {
      setPolls((res.data.polls || []).filter(p => p.isMine)); // isMine은 예시
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // 여론조사 삭제 함수
  const handleDelete = (pollId) => {
    Alert.alert(
      '정말 삭제하시겠습니까?',
      '삭제한 여론조사는 복구할 수 없습니다.',
      [
        { text: '아니오', style: 'cancel' },
        {
          text: '예',
          style: 'destructive',
          onPress: async () => {
            try {
              await pollsAPI.deletePoll(pollId.toString());
              // 삭제 후 목록 새로고침
              setPolls(prev => prev.filter(p => p.poll_id !== pollId));
            } catch (e) {
              Alert.alert('삭제 실패', '서버 오류로 삭제에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#3897f0" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>내가 개설한 여론조사</Text>
      <FlatList
        data={polls}
        keyExtractor={item => item.poll_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.pollRow}>
            <Text style={styles.pollTitle}>{item.title}</Text>
            <Text style={styles.participant}>{item.participant_count || 0}명 참여 중</Text>
            <TouchableOpacity style={styles.resultBtn} onPress={() => navigation.navigate('PollResult', { pollId: item.poll_id })}>
              <Text style={styles.resultBtnText}>결과 보기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.poll_id)}>
              <Text style={styles.deleteBtnText}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', margin: 32, color: '#aaa' }}>내가 개설한 여론조사가 없습니다.</Text>}
      />
    </SafeAreaView>
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
  deleteBtn: { backgroundColor: '#fff0f0', borderRadius: 8, padding: 8, marginLeft: 8, flex: 0.7, alignItems: 'center', borderWidth: 1, borderColor: '#ff4757' },
  deleteBtnText: { color: '#ff4757', fontWeight: 'bold' },
});

export default MyPollsScreen; 