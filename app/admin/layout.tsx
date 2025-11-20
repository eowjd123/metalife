'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import styles from './admin.module.css'

// 인증이 필요 없는 페이지 경로
const PUBLIC_PATHS = ['/admin/login', '/admin/register']

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      // 공개 페이지는 인증 체크 제외
      if (pathname && PUBLIC_PATHS.includes(pathname)) {
        setIsLoading(false)
        return
      }

      // 인증 확인
      const auth = localStorage.getItem('isAuthenticated')
      if (auth === 'true') {
        setIsAuthenticated(true)
      } else {
        router.push('/admin/login')
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [router, pathname])

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    )
  }

  // 공개 페이지 (로그인, 회원가입)
  if (pathname && PUBLIC_PATHS.includes(pathname)) {
    return <>{children}</>
  }

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    return null
  }

  // 인증된 관리자 페이지
  const isDashboard = pathname === '/admin/dashboard'
  
  return (
    <div className={styles.adminContainer}>
      <Header />
      <Sidebar />
      <main className={`${styles.mainContent} ${isDashboard ? styles.dashboardMainContent : ''}`}>
        {children}
      </main>
    </div>
  )
}
