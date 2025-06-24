import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api/auth';
import { CommonActions } from '@react-navigation/native';

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
    <View style={styles.container}>
      <Text style={styles.logo}>여론조사</Text>
      <TextInput
        style={styles.input}
        placeholder="휴대폰 번호 (010-xxxx-xxxx)"
        value={phoneNumber}
        onChangeText={text => setPhoneNumber(formatPhoneNumber(text))}
        keyboardType="phone-pad"
        autoCapitalize="none"
        maxLength={13}
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? '로그인 중...' : '로그인'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
        <Text style={styles.linkText}>계정이 없으신가요? 회원가입</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  logo: { fontSize: 32, fontWeight: 'bold', marginBottom: 32 },
  input: { width: '80%', height: 48, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, marginBottom: 16, paddingHorizontal: 12 },
  button: { width: '80%', height: 48, backgroundColor: '#3897f0', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  link: { marginTop: 24 },
  linkText: { color: '#3897f0', fontSize: 16 },
});

export default LoginScreen; 