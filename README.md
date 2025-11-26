# 관리자 문의 관리 시스템 (Admin Inquiry System)

사용자(학생, 강사, 제휴)로부터 접수된 문의를 효율적으로 관리하고, 데이터를 분석하여 시각화하는 관리자 전용 웹 시스템입니다.

## 기술 스택

- **React** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **Material UI** - UI 컴포넌트
- **Chart.js** - 데이터 시각화
- **React Router** - 라우팅
- **Vercel** - 배포 플랫폼

## 주요 기능

### 1. 로그인 페이지
- 관리자 계정 인증
- 테스트 계정: `admin` / `admin123`

### 2. 문의 목록 페이지
- 상단 현황판 (미답변, 오늘 접수, 전체 누적)
- 필터링 기능 (카테고리, 처리상태, 기간)
- 문의 목록 테이블
- 문의 상세 및 답변 모달

### 3. 문의 분석 페이지
- 기간별 추이 차트 (일별/주간별/월별)
- 카테고리별 분포
- 작성자 유형별 분포
- 인구통계 분석 (성별, 국가별, 연령대별)

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 배포

Vercel에 배포하려면:

1. GitHub에 프로젝트를 푸시
2. Vercel에 프로젝트 연결
3. 자동 배포 완료

또는 Vercel CLI 사용:

```bash
npm i -g vercel
vercel
```

## 프로젝트 구조

```
src/
├── components/       # 재사용 가능한 컴포넌트
│   ├── Layout.tsx
│   └── InquiryDetailModal.tsx
├── pages/           # 페이지 컴포넌트
│   ├── LoginPage.tsx
│   ├── InquiryListPage.tsx
│   └── InquiryAnalysisPage.tsx
├── types/           # TypeScript 타입 정의
│   └── inquiry.ts
├── data/            # 샘플 데이터
│   └── mockData.ts
├── utils/           # 유틸리티 함수
│   └── storage.ts
├── App.tsx          # 메인 앱 컴포넌트
└── main.tsx         # 진입점
```

## 데이터 모델

문의(Inquiry) 데이터는 다음 필드를 포함합니다:
- 기본 정보: id, category, title, content
- 작성자 정보: user_id, user_email, user_type, user_gender, user_country, user_age
- 첨부파일: has_attachment
- 답변 정보: status, answer_content, answerer_id, answered_at
- 타임스탬프: created_at

## 라이선스

MIT
