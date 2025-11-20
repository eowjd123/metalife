'use client'

import { useState, useEffect } from 'react'
import styles from '../users.module.css'
import AdvancedSearch from '@/components/AdvancedSearch'

interface UserHistory {
  id: number
  memberIdx: number | null
  memberId: string
  memberName: string
  email: string
  loginTime: string
  ip: string
  domain: string
}

export default function UserHistoryPage() {
  const [history, setHistory] = useState<UserHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
  })

  // 데이터 로드 함수
  const loadHistory = async (searchParams?: Record<string, string>, page: number = 1) => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      
      // 페이징 파라미터
      params.append('page', page.toString())
      params.append('limit', pageSize.toString())
      
      if (searchParams) {
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value) {
            params.append(key, value)
          }
        })
      }

      const response = await fetch(`/api/user-history?${params.toString()}`)
      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.')
      }
      const result = await response.json()
      setHistory(result.data)
      setTotalCount(result.total || 0)
      setCurrentPage(result.page || 1)
      setTotalPages(result.totalPages || 1)
      if (result.stats) {
        setStats(result.stats)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      console.error('데이터 로드 오류:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadHistory(undefined, currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize])

  const searchFields = [
    { type: 'text' as const, name: 'memberName', label: '회원명', placeholder: '회원명을 입력하세요' },
    { type: 'text' as const, name: 'email', label: '이메일', placeholder: '이메일을 입력하세요' },
    { type: 'text' as const, name: 'ip', label: 'IP 주소', placeholder: 'IP 주소를 입력하세요' },
    { type: 'dateRange' as const, name: 'loginTime', label: '로그인 시간' },
  ]

  const handleSearch = (values: Record<string, string>) => {
    setCurrentPage(1) // 검색 시 첫 페이지로 이동
    loadHistory(values, 1)
  }

  const handleReset = () => {
    setCurrentPage(1)
    loadHistory(undefined, 1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  return (
    <div className={styles.usersPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>사용자 접속 이력</h1>
      </div>

      <AdvancedSearch fields={searchFields} onSearch={handleSearch} onReset={handleReset} />

      {/* 통계 카드 */}
      {!isLoading && !error && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--primary-100)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>총 접속 이력</h3>
              <p className={styles.statNumber}>{stats.total.toLocaleString()}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--success-100)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>오늘 접속</h3>
              <p className={styles.statNumber}>
                {stats.today.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 오류 메시지 */}
      {error && (
        <div className={styles.errorMessage}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      )}

      {/* 테이블 */}
      {!isLoading && !error && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>회원ID</th>
                <th>회원명</th>
                <th>이메일</th>
                <th>로그인 시간</th>
                <th>IP 주소</th>
                <th>도메인</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((item, index) => (
                  <tr key={item.id}>
                    <td className={styles.numberCell}>
                      <span className={styles.sequenceNumber}>
                        {((currentPage - 1) * pageSize + index + 1).toLocaleString()}
                      </span>
                    </td>
                    <td className={styles.idCell}>
                      <code>{item.memberId}</code>
                    </td>
                    <td className={styles.nameCell}>
                      <strong>{item.memberName}</strong>
                    </td>
                    <td className={styles.emailCell}>
                      <a href={`mailto:${item.email}`} className={styles.emailLink}>
                        {item.email}
                      </a>
                    </td>
                    <td className={styles.dateCell}>{item.loginTime}</td>
                    <td className={styles.phoneCell}>{item.ip}</td>
                    <td className={styles.phoneCell}>{item.domain}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h3>접속 이력 데이터가 없습니다</h3>
                    <p>검색 조건을 변경해주세요.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 페이지네이션 */}
      {!isLoading && !error && totalPages > 1 && (
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
            <span>
              전체 <strong>{totalCount.toLocaleString()}</strong>개 중{' '}
              <strong>
                {((currentPage - 1) * pageSize + 1).toLocaleString()}-
                {Math.min(currentPage * pageSize, totalCount).toLocaleString()}
              </strong>
              개 표시
            </span>
            <select
              className={styles.pageSizeSelect}
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              <option value={10}>10개씩</option>
              <option value={20}>20개씩</option>
              <option value={50}>50개씩</option>
              <option value={100}>100개씩</option>
            </select>
          </div>
          <div className={styles.pagination}>
            <button
              className={styles.paginationButton}
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              처음
            </button>
            <button
              className={styles.paginationButton}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                if (totalPages <= 7) return true
                if (page === 1 || page === totalPages) return true
                if (Math.abs(page - currentPage) <= 2) return true
                return false
              })
              .map((page, index, array) => {
                if (index > 0 && array[index - 1] !== page - 1) {
                  return (
                    <span key={`ellipsis-${page}`} className={styles.paginationEllipsis}>
                      ...
                    </span>
                  )
                }
                return (
                  <button
                    key={page}
                    className={`${styles.paginationButton} ${styles.paginationNumber} ${
                      currentPage === page ? styles.active : ''
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )
              })}
            <button
              className={styles.paginationButton}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              다음
            </button>
            <button
              className={styles.paginationButton}
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              마지막
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
