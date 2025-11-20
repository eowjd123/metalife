'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from '../../orders.module.css'

interface Storybook {
  id: number
  storybookId: string
  title: string
  thumbnailUrl: string | null
  imageUrl: string | null
  registrant: string
  registrantName?: string
  registrantEmail?: string
  registeredDate: string
  usageStatus: string
  shared: string
}

export default function StorybooksPage() {
  const [storybooks, setStorybooks] = useState<Storybook[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // 필터 상태
  const [period, setPeriod] = useState<string>('') // 'today', '3days', '7days', '1month', 'custom'
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [keywordType, setKeywordType] = useState('전체')
  const [keyword, setKeyword] = useState('')
  const [usageStatus, setUsageStatus] = useState('전체')

  // 데이터 로드 함수
  const loadStorybooks = async (page: number = 1) => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      
      // 페이징 파라미터
      params.append('page', page.toString())
      params.append('limit', pageSize.toString())
      
      // 필터 파라미터
      if (keyword) {
        params.append('keyword', keyword)
        params.append('keywordType', keywordType)
      }
      
      if (usageStatus !== '전체') {
        params.append('usageStatus', usageStatus)
      }

      // 제작기간 필터
      if (period === 'today') {
        const today = new Date().toISOString().split('T')[0]
        params.append('dateStart', today)
        params.append('dateEnd', today)
      } else if (period === '3days') {
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(endDate.getDate() - 3)
        params.append('dateStart', startDate.toISOString().split('T')[0])
        params.append('dateEnd', endDate.toISOString().split('T')[0])
      } else if (period === '7days') {
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(endDate.getDate() - 7)
        params.append('dateStart', startDate.toISOString().split('T')[0])
        params.append('dateEnd', endDate.toISOString().split('T')[0])
      } else if (period === '1month') {
        const endDate = new Date()
        const startDate = new Date()
        startDate.setMonth(endDate.getMonth() - 1)
        params.append('dateStart', startDate.toISOString().split('T')[0])
        params.append('dateEnd', endDate.toISOString().split('T')[0])
      } else if (period === 'custom' && dateStart && dateEnd) {
        params.append('dateStart', dateStart)
        params.append('dateEnd', dateEnd)
      }

      const response = await fetch(`/api/storybooks?${params.toString()}`)
      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.')
      }
      const result = await response.json()
      setStorybooks(result.data)
      setTotalCount(result.total || 0)
      setCurrentPage(result.page || 1)
      setTotalPages(result.totalPages || 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      console.error('데이터 로드 오류:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStorybooks(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize])

  const handleSearch = () => {
    setCurrentPage(1)
    loadStorybooks(1)
  }

  const handlePeriodClick = (p: string) => {
    setPeriod(p)
    setDateStart('')
    setDateEnd('')
    setCurrentPage(1)
  }

  // 기간 변경 시 자동 검색
  useEffect(() => {
    if (period && period !== 'custom') {
      loadStorybooks(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  // 전체 통계 (API에서 가져오기)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
  })

  useEffect(() => {
    fetch('/api/storybooks?limit=1')
      .then(res => res.json())
      .then(data => {
        if (data.stats) {
          setStats(data.stats)
        }
      })
      .catch(err => console.error('통계 로드 오류:', err))
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>시니어 스토리북 관리</h1>
        </div>
      </div>

      {/* 필터 영역 */}
      {!isLoading && !error && (
        <div className={styles.filterSection}>
          {/* 제작기간 */}
          <div className={styles.filterRow}>
            <label className={styles.filterLabel}>제작기간</label>
            <div className={styles.periodButtons}>
              <button
                className={`${styles.periodButton} ${period === 'today' ? styles.active : ''}`}
                onClick={() => handlePeriodClick('today')}
              >
                오늘
              </button>
              <button
                className={`${styles.periodButton} ${period === '3days' ? styles.active : ''}`}
                onClick={() => handlePeriodClick('3days')}
              >
                3일
              </button>
              <button
                className={`${styles.periodButton} ${period === '7days' ? styles.active : ''}`}
                onClick={() => handlePeriodClick('7days')}
              >
                7일
              </button>
              <button
                className={`${styles.periodButton} ${period === '1month' ? styles.active : ''}`}
                onClick={() => handlePeriodClick('1month')}
              >
                1개월
              </button>
              <div className={styles.dateRangeInputs}>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={dateStart}
                  onChange={(e) => {
                    setDateStart(e.target.value)
                    setPeriod('custom')
                  }}
                />
                <span style={{ margin: '0 8px', color: 'var(--gray-500)' }}>~</span>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={dateEnd}
                  onChange={(e) => {
                    setDateEnd(e.target.value)
                    setPeriod('custom')
                  }}
                />
              </div>
            </div>
          </div>

          {/* 키워드 */}
          <div className={styles.filterRow}>
            <label className={styles.filterLabel}>키워드</label>
            <div className={styles.keywordGroup}>
              <select
                className={styles.select}
                value={keywordType}
                onChange={(e) => setKeywordType(e.target.value)}
              >
                <option value="전체">-전체-</option>
                <option value="제목">제목</option>
                <option value="아이디">아이디</option>
              </select>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="키워드를 입력하세요"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
              />
            </div>
          </div>

          {/* 사용 여부 */}
          <div className={styles.filterRow}>
            <label className={styles.filterLabel}>사용 여부</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="usageStatus"
                  value="전체"
                  checked={usageStatus === '전체'}
                  onChange={(e) => setUsageStatus(e.target.value)}
                />
                <span>전체</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="usageStatus"
                  value="사용중"
                  checked={usageStatus === '사용중'}
                  onChange={(e) => setUsageStatus(e.target.value)}
                />
                <span>사용중</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="usageStatus"
                  value="사용중지"
                  checked={usageStatus === '사용중지'}
                  onChange={(e) => setUsageStatus(e.target.value)}
                />
                <span>사용중지</span>
              </label>
            </div>
          </div>

          {/* 검색 버튼 */}
          <div className={styles.filterRow}>
            <button className={styles.searchButton} onClick={handleSearch}>
              검색
            </button>
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

      {/* 목록 영역 */}
      {!isLoading && !error && (
        <>
          <div className={styles.listHeader}>
            <div>
              <h2 className={styles.listTitle}>목록</h2>
              <p className={styles.listSummary}>
                총 등록 스토리북 <strong>{stats.total.toLocaleString()}</strong>개 | 검색 결과 <strong>{totalCount.toLocaleString()}</strong>개
              </p>
            </div>
            <select
              className={styles.pageSizeSelect}
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              <option value={10}>10개씩 보기</option>
              <option value={20}>20개씩 보기</option>
              <option value={50}>50개씩 보기</option>
              <option value={100}>100개씩 보기</option>
            </select>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>스토리북 아이디</th>
                  <th>표지썸네일</th>
                  <th>스토리북 제목</th>
                  <th>등록일</th>
                  <th>등록자</th>
                  <th>사용여부</th>
                </tr>
              </thead>
              <tbody>
                {storybooks.length > 0 ? (
                  storybooks.map((book, index) => (
                    <tr key={book.id}>
                      <td className={styles.numberCell}>
                        {totalCount - ((currentPage - 1) * pageSize + index)}
                      </td>
                      <td className={styles.idCell}>
                        <code>{book.storybookId}</code>
                      </td>
                      <td className={styles.thumbnailCell}>
                        {book.thumbnailUrl ? (
                          <img
                            src={book.thumbnailUrl}
                            alt={book.title}
                            className={styles.thumbnailImage}
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="60" viewBox="0 0 80 60"%3E%3Crect fill="%23e2e8f0" width="80" height="60"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-size="12"%3E이미지 없음%3C/text%3E%3C/svg%3E'
                            }}
                          />
                        ) : (
                          <div className={styles.thumbnailPlaceholder}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                              <circle cx="8.5" cy="8.5" r="1.5"></circle>
                              <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className={styles.titleCell}>
                        {book.title || '-'}
                      </td>
                      <td className={styles.dateCell}>{book.registeredDate}</td>
                      <td className={styles.registrantCell}>{book.registrant}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            book.usageStatus === '사용중'
                              ? styles.active
                              : styles.inactive
                          }`}
                        >
                          {book.usageStatus}
                        </span>
                      </td>
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
                      <h3>스토리북 데이터가 없습니다</h3>
                      <p>검색 조건을 변경해주세요.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
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
        </>
      )}
    </div>
  )
}
