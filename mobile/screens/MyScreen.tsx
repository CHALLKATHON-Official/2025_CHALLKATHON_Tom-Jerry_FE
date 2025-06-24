import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const MyScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>마이페이지</Text>
      <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('MyPolls')}>
        <Text style={styles.menuText}>내가 개발한 여론조사</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('MyParticipatedPolls')}>
        <Text style={styles.menuText}>내가 참여 중인 여론조사</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 32 },
  menuBtn: { backgroundColor: '#eaf4ff', borderRadius: 8, padding: 18, marginBottom: 16, width: '80%', alignItems: 'center' },
  menuText: { color: '#3897f0', fontWeight: 'bold', fontSize: 18 },
});

export default MyScreen; 