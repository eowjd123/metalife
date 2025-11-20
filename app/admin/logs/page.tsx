'use client'

import Link from 'next/link'
import styles from './logs.module.css'

export default function LogsPage() {
  const logTypes = [
    {
      title: '관리자 작업 로그',
      description: '관리자의 모든 작업 이력을 확인합니다',
      path: '/admin/logs/admin-work',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
      ),
      color: 'var(--primary-500)',
    },
    {
      title: '다운로드 로그',
      description: '파일 다운로드 이력을 확인합니다',
      path: '/admin/logs/download',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      ),
      color: 'var(--success-500)',
    },
    {
      title: 'NFC 로그인 로그',
      description: 'NFC 기반 로그인 이력을 확인합니다',
      path: '/admin/logs/nfc',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      ),
      color: 'var(--warning-500)',
    },
    {
      title: '회원 추적 로그',
      description: '회원의 활동 추적 이력을 확인합니다',
      path: '/admin/logs/member-trace',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      ),
      color: 'var(--error-500)',
    },
  ]

  return (
    <div className={styles.logsPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>로그 관리</h1>
          <p style={{ marginTop: '8px', color: 'var(--gray-600)', fontSize: '14px' }}>
            시스템의 모든 로그를 통합 관리합니다
          </p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {logTypes.map((logType) => (
          <Link
            key={logType.path}
            href={logType.path}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className={styles.statCard} style={{ cursor: 'pointer' }}>
              <div className={styles.statIcon} style={{ background: `${logType.color}15`, color: logType.color }}>
                {logType.icon}
              </div>
              <div className={styles.statContent}>
                <h3>{logType.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '4px 0 0 0' }}>
                  {logType.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

