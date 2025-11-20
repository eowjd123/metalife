# Prisma 설정 가이드

## 설치

Prisma와 Prisma Client가 이미 설치되어 있습니다.

## 데이터베이스 연결 설정

`.env.local` 파일에 다음 형식으로 데이터베이스 연결 정보를 설정하세요:

```env
DATABASE_URL="postgresql://사용자명:비밀번호@호스트:포트/데이터베이스명?schema=public"
```

예시:
```env
DATABASE_URL="postgresql://admin:password@localhost:5432/admin_panel?schema=public"
```

## Prisma 스키마

프로젝트의 데이터베이스 스키마는 `prisma/schema.prisma` 파일에 정의되어 있습니다.

### 주요 모델

1. **User** - 회원 정보
2. **Admin** - 관리자 정보
3. **Group** - 그룹 정보
4. **UserGroup** - 사용자-그룹 관계 (다대다)
5. **AdminAccessHistory** - 관리자 접속 이력
6. **UserAccessHistory** - 사용자 접속 이력
7. **License** - 라이선스 정보
8. **AccessStatistics** - 접속 통계 (일별/주별/월별)

## 사용 방법

### 1. Prisma Client 생성

```bash
npm run prisma:generate
```

### 2. 데이터베이스 마이그레이션

기존 데이터베이스가 있는 경우:
```bash
npm run prisma:pull
```

새로운 마이그레이션 생성:
```bash
npm run prisma:migrate
```

스키마 변경사항을 데이터베이스에 직접 적용 (개발용):
```bash
npm run prisma:push
```

### 3. Prisma Studio 실행 (데이터베이스 GUI)

```bash
npm run prisma:studio
```

## 코드에서 사용하기

```typescript
import { prisma } from '@/lib/prisma'

// 사용자 조회
const users = await prisma.user.findMany()

// 관리자 조회
const admins = await prisma.admin.findMany({
  where: {
    status: '활성'
  }
})

// 라이선스 조회
const licenses = await prisma.license.findMany({
  include: {
    user: true
  }
})
```

## 주의사항

- `.env.local` 파일은 Git에 커밋하지 마세요 (이미 .gitignore에 포함됨)
- 프로덕션 환경에서는 마이그레이션을 신중하게 실행하세요
- 데이터베이스 백업을 정기적으로 수행하세요

