import React from 'react';
import { ImageBackground, View, Text, StyleSheet, Dimensions } from 'react-native';
import koreaMap from '../assets/korea_map.png';

// 화면 크기 가져오기
const { width: screenWidth } = Dimensions.get('window');

// 지도 이미지 원본 크기 (실제 이미지 크기와 일치시켜야 함)
const originalImageWidth = 900;
const originalImageHeight = 1213;

// 화면에 맞춰 지도 크기 계산 (화면 너비의 90% 사용)
const mapWidth = screenWidth * 0.9;
const mapHeight = (mapWidth * originalImageHeight) / originalImageWidth;

// 비례 계산을 위한 스케일 팩터
const scaleX = mapWidth / originalImageWidth;
const scaleY = mapHeight / originalImageHeight;

// 900x1213 지도 이미지에 맞춘 시/도별 중심 좌표
const originalRegionCenters = {
  '서울특별시': { x: 260, y: 265 }, // 실제 측정값 적용
  '인천광역시': { x: 270, y: 200 },
  '경기도': { x: 320, y: 220 },
  '강원도': { x: 520, y: 120 }, // REGIONS와 동일하게 수정
  '대전광역시': { x: 340, y: 420 },
  '세종특별자치시': { x: 350, y: 370 },
  '충청북도': { x: 400, y: 340 },
  '충청남도': { x: 270, y: 350 },
  '광주광역시': { x: 220, y: 600 },
  '전라북도': { x: 300, y: 540 },
  '전라남도': { x: 250, y: 700 },
  '대구광역시': { x: 520, y: 520 },
  '경상북도': { x: 600, y: 400 },
  '경상남도': { x: 600, y: 650 },
  '부산광역시': { x: 700, y: 750 },
  '울산광역시': { x: 670, y: 700 },
  '제주특별자치도': { x: 500, y: 950 }
};

// 화면 크기에 맞춰 좌표 변환
const regionCenters = {};
Object.keys(originalRegionCenters).forEach(region => {
  const original = originalRegionCenters[region];
  regionCenters[region] = {
    x: original.x * scaleX,
    y: original.y * scaleY
  };
});

// regionStats는 [{ region: '서울특별시', count: 120 }, ...] 형태로 props로 전달
const KoreaMapHeatmap = ({ regionStats }) => {
  const maxCount = Math.max(...regionStats.map(r => r.count), 1);
  return (
    <ImageBackground source={koreaMap} style={styles.map}>
      {regionStats.map(r => {
        const center = regionCenters[r.region];
        if (!center) return null;
        // 투표 수에 따라 원 크기/색상 조절
        // 최소 18, 최대 38로 크기 확대
        const size = 18 + (r.count / maxCount) * 20;
        const color = `rgba(67,162,202,${0.3 + 0.7 * (r.count / maxCount)})`;
        return (
          <View
            key={r.region}
            style={{
              position: 'absolute',
              left: center.x - size / 2,
              top: center.y - size / 2,
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>{r.count}</Text>
          </View>
        );
      })}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  map: { 
    width: mapWidth, 
    height: mapHeight,
    alignSelf: 'center' // 화면 중앙 정렬
  },
});

export default KoreaMapHeatmap; 