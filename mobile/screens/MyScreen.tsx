import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const MyScreen = ({ navigation }) => {
  // 프로필 이미지 상태
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // 프로필 이미지 선택 함수
  const pickImage = async () => {
    // 앨범 접근 권한 요청
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('권한 필요', '앨범 접근 권한이 필요합니다.');
      return;
    }
    // 이미지 선택
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri); // 이미지 경로 저장
    }
  };

  // TODO: 실제 사용자 정보 연동 시 아래 값 대체
  const nickname = '닉네임';
  const phone = '010-0000-0000';

  return (
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, paddingHorizontal: 32 },
  profileBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#eaf4ff', marginRight: 16 },
  avatarPlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#eaf4ff', marginRight: 16, justifyContent: 'center', alignItems: 'center' },
  nickname: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  phone: { color: '#888', fontSize: 14 },
  menuCard: { backgroundColor: '#f7faff', borderRadius: 12, padding: 20, paddingHorizontal: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  menuTitle: { fontSize: 18, fontWeight: 'bold', color: '#3897f0', marginBottom: 6 },
  menuDesc: { color: '#555', fontSize: 14 },
});

export default MyScreen; 