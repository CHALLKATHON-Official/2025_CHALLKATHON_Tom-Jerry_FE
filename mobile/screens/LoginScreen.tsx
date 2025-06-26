import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api/auth';
import { CommonActions } from '@react-navigation/native';
import Checkbox from 'expo-checkbox';

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 전화번호 하이픈 자동 입력 함수
  function formatPhoneNumber(value) {
    const onlyNums = value.replace(/[^0-9]/g, '');
    if (onlyNums.length < 4) return onlyNums;
    if (onlyNums.length < 8) {
      return onlyNums.slice(0, 3) + '-' + onlyNums.slice(3);
    }
    return onlyNums.slice(0, 3) + '-' + onlyNums.slice(3, 7) + '-' + onlyNums.slice(7, 11);
  }

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      Alert.alert('오류', '휴대폰 번호와 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login(phoneNumber, password);
      await AsyncStorage.setItem('token', res.data.token);

      // 로그인 후 별도 API로 사용자 정보 요청 (토큰 인증 기반)
      const verifyRes = await authAPI.verifyToken();
      if (verifyRes.data && verifyRes.data.nickname) {
        await AsyncStorage.setItem('userInfo', JSON.stringify({ nickname: verifyRes.data.nickname }));
      }

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        })
      );
    } catch (err) {
      Alert.alert('로그인 실패', err.response?.data?.message || '서버 오류');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoBox}>
        {/* 인스타그램 느낌의 텍스트 로고 또는 심플 이미지 로고 */}
        {/* <Image source={require('../assets/logo.png')} style={styles.logoImg} /> */}
        <Text style={styles.logoText}>Easypoll</Text>
      </View>
      <View style={styles.formBox}>
        <TextInput
          style={styles.input}
          placeholder="휴대폰 번호 (010-xxxx-xxxx)"
          value={phoneNumber}
          onChangeText={text => setPhoneNumber(formatPhoneNumber(text))}
          keyboardType="phone-pad"
          autoCapitalize="none"
          maxLength={13}
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#aaa"
        />
        <View style={styles.rememberRow}>
          <Checkbox
            value={rememberMe}
            onValueChange={setRememberMe}
            color="#3897f0"
          />
          <Text style={styles.rememberText}>Remember me</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? '로그인 중...' : '로그인'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomBox}>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>계정이 없으신가요? <Text style={styles.linkBold}>회원가입</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  logoBox: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoText: {
    fontFamily: 'System',
    fontSize: 38,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#222',
    marginBottom: 4,
  },
  // logoImg: { width: 64, height: 64, marginBottom: 8 },
  formBox: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    marginBottom: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#222',
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#3897f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#3897f0',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  bottomBox: {
    alignItems: 'center',
    marginTop: 32,
  },
  linkText: {
    color: '#888',
    fontSize: 15,
  },
  linkBold: {
    color: '#3897f0',
    fontWeight: 'bold',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  rememberText: {
    color: '#888',
    fontSize: 15,
    marginLeft: 8,
  },
});

export default LoginScreen; 