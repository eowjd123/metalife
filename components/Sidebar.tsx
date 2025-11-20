'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  const pathname = usePathname()

  // 현재 경로에 따라 서브 메뉴를 동적으로 표시
  const getSubMenuItems = () => {
    if (pathname?.startsWith('/admin/access-status')) {
      return [
        { path: '/admin/access-status', label: '일별 접속자 수' },
        { path: '/admin/access-status/weekly', label: '주별 접속자 수' },
        { path: '/admin/access-status/monthly', label: '월별 접속자 수' },
      ]
    }
    if (pathname?.startsWith('/admin/users')) {
      return [
        { path: '/admin/users', label: '회원관리' },
        { path: '/admin/users/admins', label: '관리자 관리' },
        { path: '/admin/users/admin-history', label: '관리자 접속 이력' },
        { path: '/admin/users/groups', label: '소속 그룹 관리' },
        { path: '/admin/users/user-history', label: '사용자 접속 이력' },
      ]
    }
    if (pathname?.startsWith('/admin/orders')) {
      return [
        {
          path: '/admin/orders',
          label: '서비스 계정 현황',
        },
        {
          path: '/admin/orders/storybuilder-senior/storybooks',
          label: '스토리북 관리',
        },
        {
          path: '/admin/orders/storybuilder-senior/students',
          label: '수강생 관리',
        },
        {
          path: '/admin/orders/storybuilder-senior/student-logins',
          label: '수강생 로그인 이력',
        },
      ]
    }
    if (pathname?.startsWith('/admin/products')) {
      return [
        { path: '/admin/products', label: '라이선스 관리' },
        { path: '/admin/products/active', label: '사용중인 라이선스' },
        { path: '/admin/products/expired', label: '만료된 라이선스' },
      ]
    }
    if (pathname?.startsWith('/admin/board')) {
      return [
        { path: '/admin/board/notice', label: '공지사항' },
        { path: '/admin/board/faq', label: 'FAQ' },
        { path: '/admin/board/general', label: '일반게시판' },
        { path: '/admin/board/user', label: '사용자 문의 관리' },
      ]
    }
    if (pathname?.startsWith('/admin/logs')) {
      return [
        { path: '/admin/logs', label: '로그 관리' },
        { path: '/admin/logs/admin-work', label: '관리자 작업 로그' },
        { path: '/admin/logs/download', label: '다운로드 로그' },
        { path: '/admin/logs/nfc', label: 'NFC 로그인 로그' },
        { path: '/admin/logs/member-trace', label: '회원 추적 로그' },
      ]
    }
    // 기본 서브 메뉴
    return []
  }

  const subMenuItems = getSubMenuItems()

  // 서브 메뉴가 있는 경우에만 사이드바 표시
  if (subMenuItems.length === 0) {
    return null
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarTitle}>
        <h3>
          {pathname?.startsWith('/admin/access-status') && '기간별 현황'}
          {pathname?.startsWith('/admin/users') && '이용자관리'}
          {pathname?.startsWith('/admin/orders') && '서비스 계정 관리'}
          {pathname?.startsWith('/admin/products') && '라이선스 관리'}
          {pathname?.startsWith('/admin/board') && '게시판 관리'}
          {pathname?.startsWith('/admin/logs') && '로그 관리'}
        </h3>
      </div>
      <nav className={styles.nav}>
        <ul className={styles.menuList}>
          {subMenuItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`${styles.menuItem} ${
                  pathname === item.path ? styles.active : ''
                }`}
              >
                <span className={styles.menuLabel}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

