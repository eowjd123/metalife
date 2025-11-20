# 데이터베이스 스키마 가져오기 가이드

## 현재 상황
기존 데이터베이스에 있는 테이블과 컬럼을 확인하여 Prisma 스키마를 생성해야 합니다.

## 설정 방법

### 1. DATABASE_URL 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 형식으로 DATABASE_URL을 입력하세요:

```env
DATABASE_URL="postgresql://사용자명:비밀번호@호스트:포트/데이터베이스명?schema=public"
```

**예시:**
```env
DATABASE_URL="postgresql://admin:password123@localhost:5432/admin_panel?schema=public"
```

### 2. 데이터베이스 스키마 가져오기

`.env` 파일에 DATABASE_URL을 설정한 후 다음 명령어를 실행하세요:

```bash
npm run prisma:pull
```

이 명령어는 기존 데이터베이스의 모든 테이블과 컬럼을 확인하여 `prisma/schema.prisma` 파일을 자동으로 생성합니다.

### 3. Prisma Client 재생성

스키마를 가져온 후 Prisma Client를 재생성하세요:

```bash
npm run prisma:generate
```

## 주의사항

- `.env` 파일은 Git에 커밋하지 마세요 (이미 .gitignore에 포함됨)
- `.env.local` 파일이 있다면 그 내용을 `.env` 파일로 복사하세요
- 데이터베이스 연결 정보는 안전하게 관리하세요

## 문제 해결

만약 `DATABASE_URL` 오류가 발생한다면:
1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. DATABASE_URL 형식이 올바른지 확인
3. 데이터베이스 서버가 실행 중인지 확인
4. 방화벽 설정 확인

