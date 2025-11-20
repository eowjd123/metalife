# Next.js 관리자 페이지

Next.js 14를 사용하여 만든 관리자 대시보드입니다.

## 기능

- 🔐 로그인 페이지
- 📊 대시보드 (통계 및 최근 활동)
- 👥 사용자 관리
- 📦 상품 관리
- 🛒 주문 관리
- ⚙️ 설정 페이지

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 로그인 정보

데모 계정:
- 이메일: `admin@example.com`
- 비밀번호: `admin123`

## 프로젝트 구조

```
admin-panel/
├── app/
│   ├── admin/
│   │   ├── login/          # 로그인 페이지
│   │   ├── dashboard/      # 대시보드
│   │   ├── users/          # 사용자 관리
│   │   ├── products/       # 상품 관리
│   │   ├── orders/         # 주문 관리
│   │   ├── settings/       # 설정
│   │   ├── layout.tsx      # 관리자 레이아웃
│   │   └── admin.module.css
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 홈 페이지 (리다이렉트)
│   └── globals.css         # 전역 스타일
├── components/
│   ├── Sidebar.tsx         # 사이드바 컴포넌트
│   └── Sidebar.module.css
└── package.json
```

## 기술 스택

- **Next.js 14** - React 프레임워크
- **TypeScript** - 타입 안정성
- **CSS Modules** - 스타일링

## 다음 단계

- [ ] 실제 인증 시스템 구현 (JWT, 세션 등)
- [ ] API 라우트 추가
- [ ] 데이터베이스 연동
- [ ] 반응형 디자인 개선
- [ ] 다크 모드 지원

