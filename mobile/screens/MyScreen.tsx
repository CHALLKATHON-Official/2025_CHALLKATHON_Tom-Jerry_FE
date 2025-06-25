import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { pollsAPI } from '../api/polls';

const MyScreen = ({ navigation }) => {
  // 별명 상태 (초기값: '닉네임')
  const [nickname, setNickname] = useState('닉네임');

  // 프로필 이미지 상태
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // 여론조사 수 상태
  const [participatedCount, setParticipatedCount] = useState(0);
  const [createdCount, setCreatedCount] = useState(0);

  // 별명 불러오기 (회원가입/로그인 시 저장된 값)
  useEffect(() => {
    const loadNickname = async () => {
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        setNickname(userInfo.nickname || '닉네임');
      }
    };
    loadNickname();
  }, []);

  // 프로필 이미지 선택 함수
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('권한 필요', '앨범 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // 여론조사 수 불러오기
  useEffect(() => {
    pollsAPI.getPolls().then(res => {
      const polls = res.data.polls || [];
      setParticipatedCount(polls.filter(p => p.isParticipated).length);
      setCreatedCount(polls.filter(p => p.isMine).length);
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* 상단 프로필 정보 */}
      <View style={styles.profileBox}>
        <TouchableOpacity onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={{ color: '#aaa', fontSize: 24 }}>+</Text>
            </View>
          )}
        </TouchableOpacity>
        <View>
          <Text style={styles.nickname}>{nickname}</Text>
        </View>
      </View>
      {/* 여론조사 수 표시 */}
      <View style={styles.countBox}>
        <Text style={styles.countText}>참여한 여론조사: {participatedCount}개</Text>
        <Text style={styles.countText}>개설한 여론조사: {createdCount}개</Text>
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
  profileBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#eaf4ff', marginRight: 16 },
  avatarPlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#eaf4ff', marginRight: 16, justifyContent: 'center', alignItems: 'center' },
  nickname: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  countBox: { flexDirection: 'row', marginBottom: 24, marginLeft: 72 },
  countText: { marginRight: 16, color: '#3897f0', fontWeight: 'bold' },
  menuCard: { backgroundColor: '#f7faff', borderRadius: 12, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  menuTitle: { fontSize: 18, fontWeight: 'bold', color: '#3897f0', marginBottom: 6 },
  menuDesc: { color: '#555', fontSize: 14 },
});

export default MyScreen; 