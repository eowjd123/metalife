# Prisma 스키마 분석 보고서

## 📊 개요

- **데이터베이스**: MySQL
- **총 모델 수**: 24개
- **Enum 타입 수**: 20개
- **데이터베이스**: VRWARE

## 🗂️ 모델 분류

### 1. 사용자 및 관리자 관리

#### **TB_ADMIN** (관리자)
- **주요 필드**:
  - `admin_idx`: 관리자 고유 ID (PK)
  - `admin_id`: 관리자 ID
  - `admin_name`: 이름
  - `admin_nicname`: 닉네임
  - `admin_email`: 이메일
  - `admin_password`: 비밀번호
  - `admin_gubun`: 관리자 구분 (S, A, N, G)
  - `admin_del_YN`: 삭제 여부 (Y/N)
- **특징**: 관리자 계정 정보 관리

#### **TB_MEMBER** (회원)
- **주요 필드**:
  - `member_idx`: 회원 고유 ID (PK)
  - `member_id`: 회원 ID
  - `member_name`: 이름
  - `member_nicname`: 닉네임
  - `member_email`: 이메일
  - `member_password`: 비밀번호
  - `member_gubun`: 회원 구분 (S, T, N, I)
  - `member_join_gubun`: 가입 구분 (W, G, A, E)
  - `member_used_YN`: 사용 여부
  - `member_del_YN`: 삭제 여부
  - `member_grade`: 등급
  - `member_login_cnt`: 로그인 횟수
  - `group_idx`: 그룹 ID
- **특징**: 일반 회원 정보 관리

#### **TB_MEMBER_LST** (회원 목록)
- **주요 필드**:
  - `mem_idx`: 회원 목록 ID (PK)
  - `email`: 이메일
  - `pwd`: 비밀번호
  - `nickname`: 닉네임
  - `license_YN`: 라이선스 여부
  - `licenseType`: 라이선스 타입 (school 등)
  - `licenseGrade`: 라이선스 등급 (class 등)
  - `expireDate`: 만료일
- **특징**: 회원 목록 및 라이선스 정보

### 2. 그룹 관리

#### **TB_GROUP** (그룹)
- **주요 필드**:
  - `group_idx`: 그룹 ID (PK)
  - `group_name`: 그룹명
  - `group_phone`: 전화번호
  - `group_email`: 이메일
  - `group_address`: 주소
  - `group_type`: 그룹 타입 (A-H)
  - `group_del_YN`: 삭제 여부
- **특징**: 소속 그룹 정보 관리

### 3. 라이선스 관리

#### **TB_LICENSE_CODE** (라이선스 코드)
- **주요 필드**:
  - `license_idx`: 라이선스 ID (PK)
  - `license_code`: 라이선스 코드
  - `license_name`: 라이선스명
  - `license_type`: 타입 (metaware, school, storybuilder)
  - `license_level`: 등급 (home, class, storybuilder, tutor)
  - `license_period`: 기간
  - `license_limit`: 제한
  - `license_startdate`: 시작일
  - `license_enddate`: 종료일
  - `license_used_YN`: 사용 여부
  - `license_del_YN`: 삭제 여부
- **특징**: 라이선스 코드 및 정보 관리

#### **TB_LICENSE_HST** (라이선스 이력)
- **주요 필드**:
  - `license_hst_idx`: 이력 ID (PK)
  - `license_idx`: 라이선스 ID
  - `member_idx`: 회원 ID
  - `license_hst_reg_date`: 등록일
  - `license_hst_del_YN`: 삭제 여부
- **특징**: 라이선스 사용 이력 추적

### 4. 접속 및 로그 관리

#### **TB_ADMIN_LOGIN_LOG** (관리자 로그인 로그)
- **주요 필드**:
  - `admin_login_idx`: 로그 ID (PK)
  - `admin_idx`: 관리자 ID
  - `admin_login_domain`: 로그인 도메인
  - `admin_login_reg_ip`: 로그인 IP
  - `admin_login_reg_date`: 로그인 시간
- **특징**: 관리자 로그인 이력 추적

#### **TB_ADMIN_WORK_LOG** (관리자 작업 로그)
- **주요 필드**:
  - `work_idx`: 작업 로그 ID (PK)
  - `admin_idx`: 관리자 ID
  - `work_admin`: 작업 관리자
  - `work_reg_ip`: 작업 IP
  - `work_reg_date`: 작업 시간
- **특징**: 관리자 작업 이력 추적

#### **TB_MEMBER_LOGIN_LOG** (회원 로그인 로그)
- **주요 필드**:
  - `member_login_idx`: 로그 ID (PK)
  - `member_idx`: 회원 ID
  - `member_login_domain`: 로그인 도메인
  - `member_login_reg_ip`: 로그인 IP
  - `member_login_reg_date`: 로그인 시간
- **특징**: 회원 로그인 이력 추적

#### **TB_MEMBER_CONNECT_CNT** (회원 접속 통계)
- **주요 필드**:
  - `connect_cnt_idx`: 통계 ID (PK)
  - `connect_cnt`: 접속 횟수
  - `connect_cnt_domain`: 접속 도메인
  - `connect_cnt_domain_detail`: 접속 도메인 상세
  - `connect_cnt_date`: 접속 날짜
- **특징**: 회원 접속 통계 (일별/주별/월별 통계에 활용 가능)

#### **TB_MEMBER_TRACE_LOG** (회원 추적 로그)
- **주요 필드**:
  - `member_trace_idx`: 추적 로그 ID (PK)
  - `member_idx`: 회원 ID
  - `member_trace_domain`: 추적 도메인
  - `member_trace_reg_date`: 추적 시간
- **특징**: 회원 활동 추적

### 5. 게시판 관리

#### **TB_BOARD** (게시판)
- **주요 필드**:
  - `board_idx`: 게시글 ID (PK)
  - `board_title`: 제목
  - `board_contents`: 내용
  - `board_gubun`: 게시판 구분 (BO, NO, FR)
  - `board_depth`: 깊이 (답글 계층)
  - `board_sort`: 정렬 순서
  - `board_image_1`, `board_image_2`: 이미지
  - `member_idx`: 작성자 회원 ID
  - `board_del_YN`: 삭제 여부
- **특징**: 관리자 게시판

#### **TB_BOARD_USER** (사용자 게시판)
- **주요 필드**:
  - `board_user_idx`: 게시글 ID (PK)
  - `board_user_name`: 작성자명
  - `board_user_email`: 이메일
  - `board_user_title`: 제목
  - `board_user_contents`: 내용
  - `board_user_reply_YN`: 답글 여부
  - `member_idx`: 회원 ID
  - `company_workplace_code`: 회사/직장 코드
  - `board_user_del_YN`: 삭제 여부
- **특징**: 사용자 게시판

### 6. 콘텐츠 관리 (CMS)

#### **TB_CMS_MST** (CMS 마스터)
- **주요 필드**:
  - `cms_idx`: CMS ID (PK)
  - `cms_name`: CMS명
  - `cms_name_eng`: 영문명
  - `cms_dtl_txt`: 상세 텍스트
  - `cms_code`: 코드
  - `cms_tag`: 태그
  - `cms_url`: URL
  - `cms_image_1`, `cms_image_2`, `cms_image_3`: 이미지
  - `cms_movie_1`: 동영상
  - `admin_idx`: 관리자 ID
  - `cms_del_YN`: 삭제 여부
- **특징**: CMS 콘텐츠 마스터 정보

#### **TB_CMS_DTL** (CMS 상세)
- **주요 필드**:
  - `cms_dtl_idx`: 상세 ID (PK)
  - `MC00AA` ~ `MC000A`: 27개의 코드 필드 (VarChar(20))
  - `cms_idx`: CMS 마스터 ID
  - `cms_dtl_del_YN`: 삭제 여부
- **특징**: CMS 상세 데이터 (코드 기반 구조)

### 7. 코드 관리

#### **TB_CODE_MST** (코드 마스터)
- **주요 필드**:
  - `code_idx`: 코드 ID (PK)
  - `code_gcode`: 그룹 코드
  - `code_scode`: 서브 코드
  - `code_name`: 코드명
  - `code_name_eng`: 영문명
  - `code_type`: 코드 타입 (RA, CK, IP)
  - `code_basic`: 기본 코드 여부
  - `admin_idx`: 관리자 ID
  - `code_del_YN`: 삭제 여부
- **특징**: 시스템 코드 관리

### 8. 링크 관리

#### **TB_LINK_MST** (링크 마스터)
- **주요 필드**:
  - `link_idx`: 링크 ID (PK)
  - `link_name`: 링크명
  - `link_domain`: 도메인
  - `link_code`: 링크 코드
  - `link_cnt`: 클릭 횟수
  - `link_from_url`: 출발 URL
  - `link_to_url`: 도착 URL
  - `admin_idx`: 관리자 ID
  - `link_del_YN`: 삭제 여부
- **특징**: 링크 관리 및 클릭 추적

#### **TB_LINK_DTL** (링크 상세)
- **주요 필드**:
  - `link_dtl_idx`: 상세 ID (PK)
  - `link_code`: 링크 코드
  - `link_dtl_from`: 출발지
  - `link_dtl_reg_date`: 등록일
- **특징**: 링크 클릭 상세 이력

### 9. 매뉴얼 관리

#### **TB_MANUAL_MST** (매뉴얼 마스터)
- **주요 필드**:
  - `manual_idx`: 매뉴얼 ID (PK)
  - `manual_code`: 매뉴얼 코드 (SCHOOL, STORY, METAWARE)
  - `manual_name`: 매뉴얼명
  - `manual_cnt`: 조회수
  - `admin_idx`: 관리자 ID
  - `manual_del_YN`: 삭제 여부
- **특징**: 매뉴얼 카테고리 관리

#### **TB_MANUAL_DTL** (매뉴얼 상세)
- **주요 필드**:
  - `manual_dtl_idx`: 상세 ID (PK)
  - `manual_idx`: 매뉴얼 마스터 ID
  - `manual_dtl_name`: 상세명
  - `manual_dtl_file`: 파일명
  - `admin_idx`: 관리자 ID
  - `manual_dtl_del_YN`: 삭제 여부
- **특징**: 매뉴얼 파일 관리

### 10. 기타 기능

#### **TB_STORYBOOK** (스토리북)
- **주요 필드**:
  - `storybook_idx`: 스토리북 ID (PK)
  - `storybook_id`: 스토리북 고유 ID
  - `storybook_title`: 제목
  - `storybook_image_url`: 이미지 URL
  - `storybook_thumbnail_url`: 썸네일 URL
  - `storybook_data_url`: 데이터 URL
  - `storybook_voice_url`: 음성 URL
  - `storybook_shared`: 공유 여부 (Y/N)
  - `member_idx`: 회원 ID
  - `member_id`: 회원 ID (문자열)
  - `storybook_del_YN`: 삭제 여부
- **특징**: 스토리북 콘텐츠 관리

#### **TB_NFC_LOGIN** (NFC 로그인)
- **주요 필드**:
  - `nfc_idx`: NFC 로그인 ID (PK)
  - `nfc_key`: NFC 키
  - `nfc_userid`: 사용자 ID
  - `nfc_username`: 사용자명
  - `nfc_reg_ip`: 등록 IP
  - `nfc_reg_date`: 등록일
- **특징**: NFC 기반 로그인 추적

#### **TB_DOWNLOAD_LOG** (다운로드 로그)
- **주요 필드**:
  - `download_idx`: 다운로드 로그 ID (PK)
  - `download_work`: 작업명
  - `download_gubun`: 다운로드 구분 (A, B, C, D)
  - `member_id`: 회원 ID
  - `download_reg_ip`: 등록 IP
  - `download_reg_date`: 등록일
- **특징**: 다운로드 이력 추적

#### **TB_MEMBER_RULE** (회원 규칙)
- **주요 필드**:
  - `member_rule_idx`: 규칙 ID (PK)
  - `member_rule_name`: 규칙명
  - `member_rule_gubun`: 규칙 구분
- **특징**: 회원 규칙 관리

## 🔑 주요 Enum 타입

### 관리자 관련
- `TB_ADMIN_admin_gubun`: S, A, N, G
- `TB_ADMIN_admin_del_YN`: Y, N

### 회원 관련
- `TB_MEMBER_member_gubun`: S, T, N, I
- `TB_MEMBER_member_join_gubun`: W, G, A, E
- `TB_MEMBER_member_used_YN`: Y, N
- `TB_MEMBER_member_del_YN`: Y, N

### 라이선스 관련
- `TB_LICENSE_CODE_license_type`: metaware, school, storybuilder
- `TB_LICENSE_CODE_license_level`: home, class, storybuilder, tutor
- `TB_LICENSE_CODE_license_used_YN`: Y, N
- `TB_LICENSE_CODE_license_del_YN`: Y, N

### 그룹 관련
- `TB_GROUP_group_type`: A, B, C, D, E, F, G, H
- `TB_GROUP_group_del_YN`: Y, N

### 게시판 관련
- `TB_BOARD_board_gubun`: BO, NO, FR
- `TB_BOARD_board_del_YN`: Y, N

### 코드 관련
- `TB_CODE_MST_code_type`: RA, CK, IP
- `TB_CODE_MST_code_basic`: Y, N

## 📌 주요 특징

### 1. Soft Delete 패턴
- 대부분의 모델에 `*_del_YN` 필드가 있어 논리적 삭제(Soft Delete)를 사용
- 실제 데이터는 삭제하지 않고 삭제 여부만 표시

### 2. 인덱스 전략
- 삭제 여부 필드에 인덱스가 많이 설정되어 있음 (조회 성능 최적화)
- 외래키로 사용되는 ID 필드에도 인덱스 설정

### 3. 감사(Audit) 필드
- 대부분의 모델에 다음 필드들이 공통적으로 존재:
  - `*_reg_ip`: 등록 IP
  - `*_reg_date`: 등록일시
  - `*_del_YN`: 삭제 여부

### 4. 관계(Relations) 부재
- 현재 스키마에는 Prisma 관계(@relation)가 정의되어 있지 않음
- 외래키는 Int 타입으로만 존재 (예: `admin_idx`, `member_idx`, `group_idx`)
- 필요시 관계를 추가하여 조인 쿼리 최적화 가능

## 🔍 프로젝트 매핑

### 관리자 패널 기능과의 매핑

1. **회원관리** (`/admin/users`)
   - `TB_MEMBER`: 회원 정보
   - `TB_MEMBER_LST`: 회원 목록

2. **관리자 관리** (`/admin/users/admins`)
   - `TB_ADMIN`: 관리자 정보

3. **관리자 접속 이력** (`/admin/users/admin-history`)
   - `TB_ADMIN_LOGIN_LOG`: 관리자 로그인 로그

4. **소속 그룹 관리** (`/admin/users/groups`)
   - `TB_GROUP`: 그룹 정보

5. **사용자 접속 이력** (`/admin/users/user-history`)
   - `TB_MEMBER_LOGIN_LOG`: 회원 로그인 로그

6. **라이선스 관리** (`/admin/products`)
   - `TB_LICENSE_CODE`: 라이선스 코드
   - `TB_LICENSE_HST`: 라이선스 이력

7. **접속현황** (`/admin/access-status`)
   - `TB_MEMBER_CONNECT_CNT`: 회원 접속 통계
   - `TB_MEMBER_LOGIN_LOG`: 회원 로그인 로그
   - `TB_ADMIN_LOGIN_LOG`: 관리자 로그인 로그

## ⚠️ 주의사항

1. **관계 정의 부재**: 외래키 관계가 Prisma 관계로 정의되지 않아 조인 쿼리 시 수동으로 처리 필요
2. **날짜 형식**: 일부 필드(`license_startdate`, `license_enddate` 등)가 String 타입으로 저장됨
3. **기본값**: 많은 필드에 기본값이 설정되어 있어 NULL 처리가 제한적
4. **데이터베이스 코멘트**: 일부 모델과 필드에 데이터베이스 코멘트가 있어 마이그레이션 시 추가 설정 필요

## 💡 개선 제안

1. **관계 추가**: 외래키 필드에 Prisma 관계를 추가하여 타입 안전성 향상
2. **날짜 타입 통일**: String 타입 날짜 필드를 DateTime으로 변경 검토
3. **인덱스 최적화**: 자주 조회되는 필드 조합에 복합 인덱스 추가 검토
4. **모델명 정리**: TB_ 접두사 제거 또는 CamelCase로 변환 검토

