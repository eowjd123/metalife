import styles from './settings.module.css'

export default function SettingsPage() {
  return (
    <div className={styles.settingsPage}>
      <h1 className={styles.title}>설정</h1>

      <div className={styles.settingsGrid}>
        <div className={styles.settingCard}>
          <h2>일반 설정</h2>
          <div className={styles.settingItem}>
            <label>사이트 이름</label>
            <input type="text" defaultValue="관리자 페이지" />
          </div>
          <div className={styles.settingItem}>
            <label>이메일</label>
            <input type="email" defaultValue="admin@example.com" />
          </div>
          <div className={styles.settingItem}>
            <label>언어</label>
            <select>
              <option>한국어</option>
              <option>English</option>
            </select>
          </div>
          <button className={styles.saveButton}>저장</button>
        </div>

        <div className={styles.settingCard}>
          <h2>보안 설정</h2>
          <div className={styles.settingItem}>
            <label>비밀번호 변경</label>
            <input type="password" placeholder="새 비밀번호" />
          </div>
          <div className={styles.settingItem}>
            <label>비밀번호 확인</label>
            <input type="password" placeholder="비밀번호 확인" />
          </div>
          <div className={styles.settingItem}>
            <label>
              <input type="checkbox" />
              2단계 인증 활성화
            </label>
          </div>
          <button className={styles.saveButton}>저장</button>
        </div>

        <div className={styles.settingCard}>
          <h2>알림 설정</h2>
          <div className={styles.settingItem}>
            <label>
              <input type="checkbox" defaultChecked />
              이메일 알림 받기
            </label>
          </div>
          <div className={styles.settingItem}>
            <label>
              <input type="checkbox" defaultChecked />
              주문 알림 받기
            </label>
          </div>
          <div className={styles.settingItem}>
            <label>
              <input type="checkbox" />
              마케팅 알림 받기
            </label>
          </div>
          <button className={styles.saveButton}>저장</button>
        </div>
      </div>
    </div>
  )
}

