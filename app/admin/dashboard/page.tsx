'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './dashboard.module.css'

interface DashboardStats {
  totalMembers: {
    value: number
    change: number
    changeType: 'increase' | 'decrease'
  }
  activeMembers: {
    value: number
  }
  todayLogins: {
    value: number
    change: number
    changeType: 'increase' | 'decrease'
  }
  activeLicenses: {
    value: number
  }
  unansweredInquiries: {
    value: number
  }
  totalAdmins: {
    value: number
  }
  todayAdminLogins: {
    value: number
  }
  totalGroups: {
    value: number
  }
}

interface Activity {
  type: string
  message: string
  time: string
  timestamp: Date
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [statsResponse, activitiesResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/activities?limit=10'),
      ])

      if (!statsResponse.ok || !activitiesResponse.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.')
      }

      const statsData = await statsResponse.json()
      const activitiesData = await activitiesResponse.json()

      setStats(statsData.stats)
      setActivities(activitiesData.activities)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      console.error('대시보드 데이터 로드 오류:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'member_register':
        return '👤'
      case 'member_login':
        return '🔐'
      case 'admin_login':
        return '👨‍💼'
      case 'inquiry':
        return '💬'
      default:
        return '✓'
    }
  }

  if (isLoading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.dashboardLoading}>
          <div className={styles.dashboardSpinner}></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.dashboardError}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error}</span>
          <button onClick={loadDashboardData} className={styles.retryButton}>
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>대시보드</h1>
      
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statContent}>
              <h3>총 회원</h3>
              <p className={styles.statNumber}>{stats.totalMembers.value.toLocaleString()}</p>
              {stats.totalMembers.change !== 0 && (
                <span className={`${styles.statChange} ${
                  stats.totalMembers.changeType === 'increase' ? styles.increase : styles.decrease
                }`}>
                  {stats.totalMembers.changeType === 'increase' ? '↑' : '↓'} {Math.abs(stats.totalMembers.change).toFixed(1)}% 이번 달
                </span>
              )}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statContent}>
              <h3>활성 회원</h3>
              <p className={styles.statNumber}>{stats.activeMembers.value.toLocaleString()}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>🔐</div>
            <div className={styles.statContent}>
              <h3>오늘 접속자</h3>
              <p className={styles.statNumber}>{stats.todayLogins.value.toLocaleString()}</p>
              {stats.todayLogins.change !== 0 && (
                <span className={`${styles.statChange} ${
                  stats.todayLogins.changeType === 'increase' ? styles.increase : styles.decrease
                }`}>
                  {stats.todayLogins.changeType === 'increase' ? '↑' : '↓'} {Math.abs(stats.todayLogins.change).toFixed(1)}% 어제 대비
                </span>
              )}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>🔑</div>
            <div className={styles.statContent}>
              <h3>활성 라이선스</h3>
              <p className={styles.statNumber}>{stats.activeLicenses.value.toLocaleString()}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>💬</div>
            <div className={styles.statContent}>
              <h3>미답변 문의</h3>
              <p className={styles.statNumber}>{stats.unansweredInquiries.value.toLocaleString()}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>👨‍💼</div>
            <div className={styles.statContent}>
              <h3>총 관리자</h3>
              <p className={styles.statNumber}>{stats.totalAdmins.value.toLocaleString()}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📊</div>
            <div className={styles.statContent}>
              <h3>오늘 관리자 로그인</h3>
              <p className={styles.statNumber}>{stats.todayAdminLogins.value.toLocaleString()}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statContent}>
              <h3>총 그룹</h3>
              <p className={styles.statNumber}>{stats.totalGroups.value.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      <div className={styles.contentGrid}>
        <div className={styles.card}>
          <h2>최근 활동</h2>
          {activities.length > 0 ? (
            <div className={styles.activityList}>
              {activities.map((activity, index) => (
                <div key={index} className={styles.activityItem}>
                  <div className={styles.activityIcon}>{getActivityIcon(activity.type)}</div>
                  <div className={styles.activityContent}>
                    <p>{activity.message}</p>
                    <span>{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>최근 활동이 없습니다.</p>
            </div>
          )}
        </div>

        <div className={styles.card}>
          <h2>빠른 작업</h2>
          <div className={styles.quickActions}>
            <Link href="/admin/users" className={styles.actionButton}>
              회원 관리
            </Link>
            <Link href="/admin/products" className={styles.actionButton}>
              라이선스 관리
            </Link>
            <Link href="/admin/board/user" className={styles.actionButton}>
              문의 관리
            </Link>
            <Link href="/admin/users/admins" className={styles.actionButton}>
              관리자 관리
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
