import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { pollsAPI } from '../api/polls';
import KoreaMapHeatmap from './KoreaMapHeatmap';
import { BarChart, PieChart } from 'react-native-gifted-charts';

// 탭 항목 정의
const TABS = [
  { key: 'region', label: '거주지별' },
  { key: 'gender', label: '성별' },
  { key: 'age', label: '나이대' },
  { key: 'job', label: '직업' },
];

// =====================
// 인구통계 매핑 테이블
// =====================
const genderMap = { male: '남성', female: '여성' };
const genderColors = ['#4F8EF7', '#F76F8E'];
const ageOrder = ['10대', '20대', '30대', '40대', '50대', '60대 이상'];
const ageColors = ['#4F8EF7', '#F76F8E', '#7B61FF', '#2AC1BC', '#F2B263', '#A3A3A3'];
const jobMap = {
  student: '학생',
  office: '직장인',
  self: '자영업',
  public: '공무원',
  unemployed: '무직',
  etc: '기타',
};
const jobColors = ['#4F8EF7', '#F76F8E', '#7B61FF', '#2AC1BC', '#F2B263', '#A3A3A3', '#FFB6C1', '#B0E0E6'];

// =====================
// 데이터 변환 함수
// =====================
// 성별 데이터 변환
function getGenderChartData(genderArr) {
  return genderArr.map((item, idx) => ({
    label: genderMap[item.gender] || item.gender,
    value: item.count,
    frontColor: genderColors[idx % genderColors.length],
  }));
}
// 나이대 데이터 변환 (항상 ageOrder 순서로)
function getAgeChartData(ageArr) {
  const ageMapData = {};
  ageArr.forEach(item => { ageMapData[item.age_group] = item.count; });
  return ageOrder.map((label, idx) => ({
    label,
    value: ageMapData[label] || 0,
    frontColor: ageColors[idx % ageColors.length],
  }));
}
// 직업 데이터 변환
function getJobChartData(jobArr) {
  return jobArr.map((item, idx) => ({
    label: jobMap[item.job] || item.job,
    value: item.count,
    frontColor: jobColors[idx % jobColors.length],
  }));
}

const PollResultScreen = ({ route }) => {
  const { pollId } = route.params;
  const [selectedTab, setSelectedTab] = useState('region');
  const [regionStats, setRegionStats] = useState([]);
  const [optionSummary, setOptionSummary] = useState([]); // 항목별 득표수/비율
  const [optionGroupStats, setOptionGroupStats] = useState({ gender: [], age: [], job: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [demographics, setDemographics] = useState(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      pollsAPI.getPoll(pollId),
      pollsAPI.getRegionStats(pollId),
      pollsAPI.getOptionStatsByGroup(pollId, 'gender'),
      pollsAPI.getOptionStatsByGroup(pollId, 'age'),
      pollsAPI.getOptionStatsByGroup(pollId, 'job'),
      pollsAPI.getDemographics(pollId),
    ])
      .then(([pollRes, regionRes, genderRes, ageRes, jobRes, demographicsRes]) => {
        // 1. 항목별 득표수/비율 요약
        const options = pollRes.data.Options || [];
        const totalVotes = options.reduce((sum, opt) => sum + Number(opt.response_count || 0), 0);
        setOptionSummary(
          options.map(opt => ({
            option_id: opt.option_id,
            option_text: opt.option_text,
            count: Number(opt.response_count || 0),
            percent: totalVotes ? Math.round((Number(opt.response_count || 0) / totalVotes) * 100) : 0
          }))
        );
        setRegionStats(regionRes.data.region_stats || []);
        setOptionGroupStats({
          gender: genderRes.data.option_stats || [],
          age: ageRes.data.option_stats || [],
          job: jobRes.data.option_stats || [],
        });
        setDemographics(demographicsRes.data.demographics);
      })
      .catch(() => setError('투표 데이터 불러오기 실패'))
      .finally(() => setLoading(false));
  }, [pollId]);

  const handleAIClick = async () => {
    if (showAIAnalysis) {
      setShowAIAnalysis(false);
      return;
    }
    setShowAIAnalysis(true);
    setAiLoading(true);
    setAiError('');
    setAiAnalysis('');
    try {
      const res = await pollsAPI.getAIAssessment(pollId);
      setAiAnalysis(res.data.analysis || 'AI 분석 결과가 없습니다.');
    } catch (e) {
      setAiError('AI 분석 결과를 불러오지 못했습니다.');
    }
    setAiLoading(false);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (error) return <Text style={{ color: 'red', margin: 24 }}>{error}</Text>;

  // 상단: 항목별 득표수/비율 요약
  const renderOptionSummary = () => (
    <View style={styles.summaryRow}>
      {optionSummary.map(opt => (
        <View key={opt.option_id} style={styles.summaryBox}>
          <Text style={styles.summaryOption}>{opt.option_text}</Text>
          <Text style={styles.summaryCount}>{opt.count}표</Text>
          <Text style={styles.summaryPercent}>{opt.percent}%</Text>
        </View>
      ))}
    </View>
  );

  // =====================
  // 탭별 시각화 데이터 변환
  // =====================
  const genderChartData = demographics ? getGenderChartData(demographics.gender) : [];
  const ageChartData = demographics ? getAgeChartData(demographics.age) : [];
  const jobChartData = demographics ? getJobChartData(demographics.job) : [];

  // =====================
  // 탭별 BarChart/PieChart 렌더링 함수
  // =====================
  const renderTabContent = () => {
    if (selectedTab === 'region') {
      return <KoreaMapHeatmap regionStats={regionStats} />;
    }
    if (selectedTab === 'gender') {
      // x축: 남성/여성, y축: 인원수
      return (
        <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginTop: 48 }}>
          {/* BarChart - 성별별 인원수, 제목과 그래프 간격 넓힘 */}
          <BarChart
            data={genderChartData}
            barWidth={32}
            spacing={32}
            roundedTop
            yAxisThickness={0}
            xAxisLabelTextStyle={{ color: '#333', fontWeight: 'bold' }}
            showValuesAsTopLabel
            height={280}
            isAnimated
            noOfSections={5}
            maxValue={Math.max(1, ...genderChartData.map(b => b.value))}
          />
        </View>
      );
    }
    if (selectedTab === 'age') {
      return (
        <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginTop: 48 }}>
          <BarChart
            data={ageChartData}
            barWidth={32}
            spacing={32}
            roundedTop
            yAxisThickness={0}
            xAxisLabelTextStyle={{ color: '#333', fontWeight: 'bold' }}
            showValuesAsTopLabel
            height={280}
            isAnimated
            noOfSections={5}
            maxValue={Math.max(1, ...ageChartData.map(b => b.value))}
          />
        </View>
      );
    }
    if (selectedTab === 'job') {
      return (
        <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginTop: 48 }}>
          <BarChart
            data={jobChartData}
            barWidth={32}
            spacing={32}
            roundedTop
            yAxisThickness={0}
            xAxisLabelTextStyle={{ color: '#333', fontWeight: 'bold' }}
            showValuesAsTopLabel
            height={280}
            isAnimated
            noOfSections={5}
            maxValue={Math.max(1, ...jobChartData.map(b => b.value))}
          />
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단: 항목별 득표수/비율 요약 */}
      <Text style={styles.title}>항목별 득표 현황</Text>
      {renderOptionSummary()}
      {/* 탭 영역 */}
      <View style={styles.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, selectedTab === tab.key && styles.tabBtnActive]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Text style={[styles.tabLabel, selectedTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* 탭별 결과 시각화 */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text style={styles.title}>{TABS.find(t => t.key === selectedTab)?.label} 투표자 분포</Text>
        <View style={{ minHeight: 240, justifyContent: 'center', alignItems: 'center' }}>
          {renderTabContent()}
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ alignItems: 'center', marginVertical: 24 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#3897f0',
              paddingVertical: 12,
              paddingHorizontal: 32,
              borderRadius: 24,
            }}
            onPress={handleAIClick}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
              {showAIAnalysis ? 'AI 분석 닫기' : 'AI 분석 결과 보기'}
            </Text>
          </TouchableOpacity>
        </View>
        {showAIAnalysis && (
          <View style={{ backgroundColor: '#f7faff', borderRadius: 12, padding: 18, margin: 16, marginTop: 0, borderWidth: 1, borderColor: '#3897f0' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8, color: '#3897f0' }}>AI 인구통계 분석</Text>
            {aiLoading ? (
              <Text>로딩 중...</Text>
            ) : aiError ? (
              <Text style={{ color: 'red' }}>{aiError}</Text>
            ) : (
              <Text style={{ fontSize: 15, color: '#222', lineHeight: 22 }}>{aiAnalysis}</Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 0 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, marginTop: 8, textAlign: 'center' },
  summaryRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  summaryBox: { alignItems: 'center', marginHorizontal: 12, backgroundColor: '#F5F6FA', borderRadius: 8, padding: 10, minWidth: 70 },
  summaryOption: { fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
  summaryCount: { color: '#4F8EF7', fontWeight: 'bold', fontSize: 15 },
  summaryPercent: { color: '#888', fontSize: 13 },
  tabRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, backgroundColor: '#F5F6FA' },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20 },
  tabBtnActive: { backgroundColor: '#4F8EF7' },
  tabLabel: { fontSize: 16, color: '#333', fontWeight: 'bold' },
  tabLabelActive: { color: '#fff' },
});

export default PollResultScreen; 