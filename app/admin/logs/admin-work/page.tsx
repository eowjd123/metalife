'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from '../logs.module.css'

interface AdminWorkLog {
  id: number
  adminIdx: number | null
  adminId: string | null
  adminName: string | null
  adminEmail: string | null
  workAdmin: string
  registeredIp: string
  registeredDate: string
}

export default function AdminWorkLogPage() {
  const [logs, setLogs] = useState<AdminWorkLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [stats, setStats] = useState({ total: 0 })

  // 검색 상태
  const [searchAdminIdx, setSearchAdminIdx] = useState('')
  const [searchWorkAdmin, setSearchWorkAdmin] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')

  // 데이터 로드
  const loadLogs = async (page: number = 1) => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', pageSize.toString())

      if (searchAdminIdx) params.append('adminIdx', searchAdminIdx)
      if (searchWorkAdmin) params.append('workAdmin', searchWorkAdmin)
      if (dateStart) params.append('dateStart', dateStart)
      if (dateEnd) params.append('dateEnd', dateEnd)

      const response = await fetch(`/api/logs/admin-work?${params.toString()}`)
      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.')
      }
      const result = await response.json()
      setLogs(result.data)
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
    loadLogs(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize])

  // 통계 로드
  useEffect(() => {
    fetch('/api/logs/admin-work?limit=1')
      .then(res => res.json())
      .then(data => {
        if (data.stats) {
          setStats(data.stats)
        }
      })
      .catch(err => console.error('통계 로드 오류:', err))
  }, [])

  const handleSearch = () => {
    setCurrentPage(1)
    loadLogs(1)
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
    <div className={styles.logsPage}>
      <div className={styles.header}>
        <div>
          <Link href="/admin/logs" style={{ color: 'var(--gray-600)', textDecoration: 'none', marginBottom: '8px', display: 'inline-block' }}>
            ← 로그 관리로
          </Link>
          <h1 className={styles.title}>관리자 작업 로그</h1>
        </div>
      </div>

      {/* 통계 카드 */}
      {!isLoading && !error && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--primary-100)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>전체 작업 로그</h3>
              <p className={styles.statNumber}>{stats.total.toLocaleString()}</p>
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

      {/* 필터 바 */}
      {!isLoading && !error && (
        <div className={styles.filterBar}>
          <input
            className={styles.searchInput}
            placeholder="관리자 IDX 검색"
            value={searchAdminIdx}
            onChange={(e) => setSearchAdminIdx(e.target.value)}
          />
          <input
            className={styles.searchInput}
            placeholder="작업 관리자 검색"
            value={searchWorkAdmin}
            onChange={(e) => setSearchWorkAdmin(e.target.value)}
          />
          <input
            type="date"
            className={styles.dateInput}
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
          />
          <span style={{ color: 'var(--gray-500)' }}>~</span>
          <input
            type="date"
            className={styles.dateInput}
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
          />
          <button className={styles.searchButton} onClick={handleSearch}>
            검색
          </button>
        </div>
      )}

      {/* 테이블 */}
      {!isLoading && !error && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>관리자 ID</th>
                <th>관리자명</th>
                <th>작업 관리자</th>
                <th>등록 IP</th>
                <th>작업 일시</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className={styles.codeCell}>{log.adminId || log.adminIdx || '-'}</td>
                    <td>{log.adminName || '-'}</td>
                    <td>{log.workAdmin}</td>
                    <td className={styles.codeCell}>{log.registeredIp}</td>
                    <td className={styles.dateCell}>{log.registeredDate}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h3>로그 데이터가 없습니다</h3>
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

