'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Header.module.css'

export default function Header() {
  const pathname = usePathname()

  const mainMenuItems = [
    { path: '/admin/dashboard', label: '대시보드' },
    { path: '/admin/access-status', label: '접속현황' },
    { path: '/admin/users', label: '이용자관리' },
    { path: '/admin/products', label: '라이선스 관리' },
    { path: '/admin/orders', label: '서비스 계정 관리' },
    { path: '/admin/board/notice', label: '게시판 관리' },
    { path: '/admin/logs', label: '로그 관리' },
    { path: '/admin/settings', label: '크레딧 관리' },
  ]

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <Link href="/admin/dashboard">
            <h1>Metalife</h1>
          </Link>
        </div>
        <nav className={styles.nav}>
          {mainMenuItems.map((item) => {
            // 현재 경로가 해당 메뉴의 하위 경로인지 확인
            // 게시판 관리의 경우 /admin/board로 시작하는 모든 경로에서 활성화
            // 로그 관리의 경우 /admin/logs로 시작하는 모든 경로에서 활성화
            let isActive = pathname?.startsWith(item.path)
            if (item.path === '/admin/board/notice') {
              isActive = pathname?.startsWith('/admin/board')
            }
            if (item.path === '/admin/logs') {
              isActive = pathname?.startsWith('/admin/logs')
            }
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className={styles.headerActions}>
          <button 
            className={styles.logoutButton}
            onClick={() => {
              localStorage.removeItem('isAuthenticated')
              localStorage.removeItem('userInfo')
              window.location.href = '/admin/login'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 16L21 12M21 12L17 8M21 12H7M13 16H5C3.89543 16 3 15.1046 3 14V6C3 4.89543 3.89543 4 5 4H13" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            로그아웃
          </button>
        </div>
      </div>
    </header>
  )
}

