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

const GENDER_SELECT = [
  { key: 'male', label: '남성', color: '#4F8EF7' },
  { key: 'female', label: '여성', color: '#F76F8E' },
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
// 성별 BarChart 데이터 변환 함수 (성별별 인원수, x축: 남성/여성)
function getGenderChartData(genderArr) {
  return genderArr.map((item, idx) => ({
    label: genderMap[item.gender] || item.gender, // '남성' 또는 '여성'
    value: item.count, // 투표자 수
    frontColor: genderColors[idx % genderColors.length], // 색상 지정
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

// =====================
// 성별 그룹형 BarChart 데이터 변환 함수 (항목별로 남/여 막대가 나란히)
// =====================
function getOptionGenderGroupBarData(optionStats) {
  // 항상 'male', 'female' 순서로 출력
  const genderOrder = ['male', 'female'];
  const genderLabelMap = { male: '남성', female: '여성' };
  const genderColorMap = { male: '#4F8EF7', female: '#F76F8E' };

  return (optionStats || []).map(opt => ({
    label: opt.option_text, // 항목명
    data: genderOrder.map(gender => {
      // stats 배열에서 해당 gender를 찾음
      const stat = (opt.stats || []).find(s => s.gender === gender);
      return {
        value: stat ? stat.count : 0, // 값이 없으면 0
        label: genderLabelMap[gender], // '남성' 또는 '여성'
        frontColor: genderColorMap[gender] // 색상 지정
      };
    })
  }));
}

// =====================
// 성별별 항목 득표수 BarChart 데이터 변환 함수
// =====================
function getOptionStatsByGender(optionStats, gender) {
  return (optionStats || []).map(opt => {
    const stat = (opt.stats || []).find(s => s.gender === gender);
    return {
      label: opt.option_text,
      value: stat ? stat.count : 0,
      frontColor: gender === 'male' ? '#4F8EF7' : '#F76F8E',
    };
  });
}

// =====================
// 모든 시/도 리스트 (회원가입 REGIONS와 동일하게)
const ALL_REGIONS = [
  '서울특별시', '인천광역시', '대전광역시', '대구광역시', '울산광역시', '부산광역시', '광주광역시', '세종특별자치시',
  '경기도', '강원도', '충청남도', '충청북도', '경상북도', '전라북도', '경상남도', '전라남도', '제주특별자치도'
];

// regionStats에 없는 지역은 count=0으로 채워서 반환
function fillMissingRegions(regionStats) {
  const regionMap = {};
  (regionStats || []).forEach(r => { regionMap[r.region] = r.count; });
  return ALL_REGIONS.map(region => ({
    region,
    count: regionMap[region] || 0
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
  const [selectedGender, setSelectedGender] = useState('male'); // 성별 선택 상태 추가

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

  // 변환 데이터
  const genderChartData = demographics ? getGenderChartData(demographics.gender) : [];
  const ageChartData = demographics ? getAgeChartData(demographics.age) : [];
  const jobChartData = demographics ? getJobChartData(demographics.job) : [];

  // regionStats 보정: 모든 시/도 포함
  const filledRegionStats = fillMissingRegions(regionStats);

  // =====================
  // 탭별 BarChart만 반환 (성별은 전체 남/여 인원수)
  // =====================
  const renderTabContent = () => {
    if (selectedTab === 'region') {
      // 모든 시/도가 지도에 표시되도록 보정된 데이터 전달
      return <KoreaMapHeatmap regionStats={filledRegionStats} />;
    }
    if (selectedTab === 'gender') {
      // 전체 남/여 인원수 BarChart: x축에 '남성', '여성', value에 각각의 투표자 수
      return (
        <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginTop: 48 }}>
          {/* 범례 */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
            {GENDER_SELECT.map((g, i) => (
              <View key={g.key} style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 6, marginBottom: 4 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: g.color, marginRight: 4 }} />
                <Text style={{ fontSize: 13, color: '#333', marginRight: 8 }}>{g.label}</Text>
              </View>
            ))}
          </View>
          {/* 전체 남/여 인원수 BarChart */}
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