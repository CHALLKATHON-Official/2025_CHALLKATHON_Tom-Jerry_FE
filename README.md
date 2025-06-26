# 2025_CHALLKATHON_Tom-Jerry_FE

## 📱 프로젝트 소개
easypoll은 누구나 쉽고 빠르게 여론조사를 만들고, 참여하고, 결과를 시각적으로 확인할 수 있는 모바일 앱입니다.

---

## 🚀 주요 기능
- 회원가입/로그인 (JWT 인증)
- 여론조사 생성/참여/삭제
- 지도 히트맵, 성별/연령/직업별 차트
- 내가 개설/참여한 여론조사 관리
- 실시간 UI/UX, 반응형 디자인

---

## 🖼️ 스크린샷
| 홈 화면 | 여론조사 결과 | 프로필 |
|---------|--------------|--------|
| ![home](./screenshots/home.png) | ![result](./screenshots/result.png) | ![profile](./screenshots/profile.png) |

---

## 🗂️ 폴더 구조

mobile/
├── api/ # API 연동 모듈
├── screens/ # 주요 화면 컴포넌트
├── assets/ # 이미지 등 정적 리소스
├── App.tsx # 앱 진입점
└── ...

---

## ⚙️ 설치 및 실행

1. 의존성 설치
   ```bash
   npm install
   # 또는
   yarn install
   ```

2. Expo 앱 실행
   ```bash
   npx expo start
   ```

3. 시뮬레이터/실기기에서 QR코드로 접속

---

## 🔑 환경변수/설정

- API 서버 주소 등은 `mobile/api/config.ts`에서 관리
- 필요시 `.env` 파일 사용

---


## 🔗 주요 라이브러리

- React Native (Expo)
- react-native-gifted-charts
- axios
- @react-navigation/native
- expo-checkbox, expo-image-picker 등

---

## 🛠️ API 연동

- Node.js(Express) 기반 REST API 서버와 연동
- JWT 토큰 기반 인증 필요(Authorization 헤더 자동 포함)
- 주요 엔드포인트 예시:
  - `POST /polls` (여론조사 생성)
  - `DELETE /polls/:id` (여론조사 삭제)
  - `GET /polls/:id/results` (결과 조회)
- [백엔드 레포/문서 링크](https://github.com/CHALLKATHON-Official/2025_CHALLKATHON_Tom-Jerry_BE)

---

# 🧩 개발/운영 팁

- StyleSheet로 UI 커스터마이징
- 삭제/수정 등 민감 기능은 본인 인증/권한 체크 필수
- PR/이슈는 명확한 제목과 설명 작성

---

## ❓ Troubleshooting

- **expo-checkbox 설치 오류**:  
  `npm install expo-checkbox --legacy-peer-deps`로 설치
- **API 401/403 에러**:  
  토큰 만료/누락 여부 확인

---

## 🤝 기여/문의

- 버그/기능 제안: GitHub Issue 등록
- 문의: 팀원 또는 관리자에게 직접 연락

---

## 📝 라이선스

- 본 프로젝트는 [MIT License](./LICENSE)를 따릅니다.
