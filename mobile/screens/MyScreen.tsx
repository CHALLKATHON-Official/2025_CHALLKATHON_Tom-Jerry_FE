import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const MyScreen = ({ navigation }) => {
  // TODO: 실제 사용자 정보 연동 시 아래 값 대체
  const nickname = '닉네임';
  const phone = '010-0000-0000';

  return (
    <View style={styles.container}>
      {/* 상단 프로필 정보 */}
      <View style={styles.profileBox}>
        <View style={styles.avatar} />
        <View>
          <Text style={styles.nickname}>{nickname}</Text>
          <Text style={styles.phone}>{phone}</Text>
        </View>
      </View>
      {/* 2개의 주요 메뉴 카드 */}
      <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('MyParticipatedPolls')}>
        <Text style={styles.menuTitle}>내가 참여한 여론조사</Text>
        <Text style={styles.menuDesc}>내가 투표에 참여한 모든 여론조사 결과를 볼 수 있습니다.</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('MyPolls')}>
        <Text style={styles.menuTitle}>내가 개설한 여론조사</Text>
        <Text style={styles.menuDesc}>내가 직접 개설한 여론조사만 모아볼 수 있습니다.</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  profileBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#eaf4ff', marginRight: 16 },
  nickname: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  phone: { color: '#888', fontSize: 14 },
  menuCard: { backgroundColor: '#f7faff', borderRadius: 12, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  menuTitle: { fontSize: 18, fontWeight: 'bold', color: '#3897f0', marginBottom: 6 },
  menuDesc: { color: '#555', fontSize: 14 },
});

export default MyScreen; 