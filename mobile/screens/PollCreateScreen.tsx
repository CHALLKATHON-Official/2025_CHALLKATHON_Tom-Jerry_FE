import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { pollsAPI } from '../api/polls';

const CATEGORIES = ['정치', '경제', '사회', '생활/문화', 'IT/과학', '세계', '엔터', '스포츠'];

const PollCreateScreen = ({ navigation, route }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);

  // 기사에서 개설 시 기사 정보 표시
  const article = route?.params?.article;

  const handleOptionChange = (text, idx) => {
    const newOptions = [...options];
    newOptions[idx] = text;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 5) setOptions([...options, '']);
  };

  const removeOption = (idx) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== idx));
  };

  const handleCreate = async () => {
    if (!title.trim() || !options.every(opt => opt.trim()) || options.length < 2) {
      Alert.alert('질문과 2개 이상의 옵션을 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      await pollsAPI.createPoll({
        title,
        description,
        category,
        options,
        article: article || null,
      });
      Alert.alert('여론조사 개설 완료!', '', [
        { text: '확인', onPress: () => navigation.navigate('Polls') }
      ]);
    } catch (err) {
      Alert.alert('개설 실패', err.response?.data?.message || '서버 오류');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>여론조사 개설</Text>
      {article && (
        <View style={styles.articleBox}>
          <Text style={styles.articleTitle}>{article.title}</Text>
          <Text style={styles.articleDesc}>{article.description}</Text>
        </View>
      )}
      <TextInput
        style={styles.input}
        placeholder="질문을 입력하세요"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="설명을 입력하세요 (선택)"
        value={description}
        onChangeText={setDescription}
      />
      <Text style={styles.label}>카테고리</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryBtn, category === cat && styles.categoryBtnSelected]}
            onPress={() => setCategory(cat)}
          >
            <Text style={{ color: category === cat ? '#fff' : '#3897f0', fontWeight: 'bold' }}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={styles.label}>옵션</Text>
      {options.map((opt, idx) => (
        <View key={idx} style={styles.optionRow}>
          <TextInput
            style={styles.optionInput}
            placeholder={`옵션 ${idx + 1}`}
            value={opt}
            onChangeText={text => handleOptionChange(text, idx)}
          />
          {options.length > 2 && (
            <TouchableOpacity onPress={() => removeOption(idx)}>
              <Text style={styles.removeBtn}>삭제</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      {options.length < 5 && (
        <TouchableOpacity style={styles.addOptionBtn} onPress={addOption}>
          <Text style={styles.addOptionText}>+ 옵션 추가</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={loading}>
        <Text style={styles.createBtnText}>{loading ? '개설 중...' : '개설하기'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', alignItems: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  articleBox: { backgroundColor: '#f7faff', borderRadius: 8, padding: 12, marginBottom: 16, width: '100%' },
  articleTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  articleDesc: { color: '#555', fontSize: 13 },
  input: { width: '100%', height: 48, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, marginBottom: 16, paddingHorizontal: 12 },
  label: { alignSelf: 'flex-start', fontWeight: 'bold', marginTop: 8, marginBottom: 4 },
  categoryBar: { flexDirection: 'row', marginBottom: 8 },
  categoryBtn: { borderWidth: 1, borderColor: '#3897f0', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, backgroundColor: '#fff' },
  categoryBtnSelected: { backgroundColor: '#3897f0', borderColor: '#3897f0' },
  optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '100%' },
  optionInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginRight: 8 },
  removeBtn: { color: '#ff4757', fontWeight: 'bold' },
  addOptionBtn: { backgroundColor: '#eaf4ff', borderRadius: 8, padding: 10, marginBottom: 16 },
  addOptionText: { color: '#3897f0', fontWeight: 'bold' },
  createBtn: { backgroundColor: '#3897f0', borderRadius: 8, padding: 16, alignItems: 'center', width: '100%' },
  createBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default PollCreateScreen; 