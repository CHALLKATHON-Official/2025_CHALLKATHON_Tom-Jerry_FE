import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { authAPI } from '../api/auth';
import { Picker } from '@react-native-picker/picker';

const REGIONS = [
  '서울특별시', '인천광역시', '대전광역시', '대구광역시', '울산광역시', '부산광역시', '광주광역시', '세종특별자치시',
  '경기도', '강원도', '충청남도', '충청북도', '경상북도', '전라북도', '경상남도', '전라남도', '제주특별자치도',
];
const CATEGORIES = ['정치', '경제', '사회', '생활/문화', 'IT/과학', '세계', '엔터', '스포츠'];
const JOBS = [
  '전문직', '교직', '관리직', '사무직', '자영업', '판매직', '서비스직', '생산/노무직', '기능직',
  '농/축/광/수산업', '학생', '주부', '무직', '기타',
];
const GENDERS = [
  { label: '남성', value: 'male' },
  { label: '여성', value: 'female' },
  { label: '기타', value: 'other' },
];

const RegisterScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [realName, setRealName] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [region, setRegion] = useState(REGIONS[0]);
  const [job, setJob] = useState(JOBS[0]);
  const [gender, setGender] = useState('male');
  const [interestCategories, setInterestCategories] = useState([]);
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

  // 생년월일 하이픈 자동 입력 함수
  function formatBirthDate(value) {
    const onlyNums = value.replace(/[^0-9]/g, '');
    if (onlyNums.length < 5) return onlyNums;
    if (onlyNums.length < 7) {
      return onlyNums.slice(0, 4) + '-' + onlyNums.slice(4);
    }
    return onlyNums.slice(0, 4) + '-' + onlyNums.slice(4, 6) + '-' + onlyNums.slice(6, 8);
  }

  const toggleCategory = (cat) => {
    if (interestCategories.includes(cat)) {
      setInterestCategories(interestCategories.filter((c) => c !== cat));
    } else if (interestCategories.length < 3) {
      setInterestCategories([...interestCategories, cat]);
    } else {
      Alert.alert('관심 카테고리는 3개만 선택할 수 있습니다.');
    }
  };

  const handleRegister = async () => {
    if (!phoneNumber || !password || !realName || !nickname || !birthDate || !region || !job || !gender || interestCategories.length !== 3) {
      Alert.alert('모든 필드를 올바르게 입력해주세요. (관심 카테고리 3개 선택 필수)');
      return;
    }
    setLoading(true);
    try {
      await authAPI.register({
        phone_number: phoneNumber,
        password,
        real_name: realName,
        nickname,
        birth_date: birthDate,
        region,
        job,
        gender,
        interest_categories: interestCategories,
      });
      Alert.alert('회원가입 성공', '로그인 화면으로 이동합니다.', [
        { text: '확인', onPress: () => navigation.replace('Login') },
      ]);
    } catch (err) {
      Alert.alert('회원가입 실패', err.response?.data?.message || '서버 오류');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.logo}>회원가입</Text>
        <TextInput
          style={styles.input}
          placeholder="휴대폰 번호 (010-xxxx-xxxx)"
          value={phoneNumber}
          onChangeText={text => setPhoneNumber(formatPhoneNumber(text))}
          keyboardType="phone-pad"
          autoCapitalize="none"
          maxLength={13}
        />
        <TextInput style={styles.input} placeholder="비밀번호" value={password} onChangeText={setPassword} secureTextEntry />
        <TextInput
          style={styles.input}
          placeholder="성명"
          value={realName}
          onChangeText={setRealName}
          keyboardType="default"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="별명"
          value={nickname}
          onChangeText={setNickname}
          keyboardType="default"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="생년월일 (YYYY-MM-DD)"
          value={birthDate}
          onChangeText={text => setBirthDate(formatBirthDate(text))}
          keyboardType="number-pad"
          maxLength={10}
        />
        <Text style={styles.label}>성별</Text>
        <View style={styles.row}>
          {GENDERS.map((g) => (
            <TouchableOpacity key={g.value} style={styles.radioWrap} onPress={() => setGender(g.value)}>
              <View style={[styles.radio, gender === g.value && styles.radioSelected]} />
              <Text>{g.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>거주지</Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={region}
            onValueChange={setRegion}
            style={styles.input}
          >
            {REGIONS.map(region => (
              <Picker.Item label={region} value={region} key={region} />
            ))}
          </Picker>
        </View>
        <Text style={styles.label}>직업</Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={job}
            onValueChange={setJob}
            style={styles.input}
          >
            {JOBS.map(job => (
              <Picker.Item label={job} value={job} key={job} />
            ))}
          </Picker>
        </View>
        <Text style={styles.label}>관심 카테고리 (3개 선택)</Text>
        <View style={styles.rowWrap}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catBox, interestCategories.includes(cat) && styles.catBoxSelected]}
              onPress={() => toggleCategory(cat)}
            >
              <Text style={{ color: interestCategories.includes(cat) ? '#fff' : '#333' }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? '가입 중...' : '가입'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.link}>
          <Text style={styles.linkText}>이미 계정이 있으신가요? 로그인</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 32, paddingHorizontal: 32 },
  logo: { fontSize: 32, fontWeight: 'bold', marginBottom: 32 },
  input: { width: '80%', height: 48, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, marginBottom: 16, paddingHorizontal: 12 },
  label: { alignSelf: 'flex-start', marginLeft: '10%', fontWeight: 'bold', marginTop: 8 },
  row: { flexDirection: 'row', marginBottom: 16 },
  radioWrap: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: '#333', marginRight: 6 },
  radioSelected: { backgroundColor: '#3897f0' },
  pickerWrap: { width: '80%', marginBottom: 16 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', width: '80%', marginBottom: 16 },
  catBox: { borderWidth: 1, borderColor: '#3897f0', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, margin: 4 },
  catBoxSelected: { backgroundColor: '#3897f0', borderColor: '#3897f0' },
  button: { width: '80%', height: 48, backgroundColor: '#3897f0', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  link: { marginTop: 24 },
  linkText: { color: '#3897f0', fontSize: 16 },
});

export default RegisterScreen; 