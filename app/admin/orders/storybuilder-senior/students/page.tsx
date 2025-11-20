'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from '../../orders.module.css'

interface Student {
  id: number
  sequence: number
  memberId: string
  name: string
  nicname: string
  email: string
  phone: string
  role: string
  status: string
  grade: number
  groupIdx: number | null
  groupName: string
  registeredDate: string
  lastLoginDate: string
  loginCount: number
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  })

  // 검색 상태
  const [searchName, setSearchName] = useState('')
  const [filterStatus, setFilterStatus] = useState('전체상태')
  const [filterGroup, setFilterGroup] = useState('전체기수')
  const [groups, setGroups] = useState<Array<{ group_idx: number; group_name: string }>>([])

  // 그룹 목록 로드
  useEffect(() => {
    fetch('/api/groups?limit=1000')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setGroups(data.data)
        }
      })
      .catch(err => console.error('그룹 로드 오류:', err))
  }, [])

  // 데이터 로드
  const loadStudents = async (page: number = 1) => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', pageSize.toString())

      if (searchName) {
        params.append('name', searchName)
      }

      if (filterStatus !== '전체상태') {
        params.append('status', filterStatus)
      }

      if (filterGroup !== '전체기수') {
        const selectedGroup = groups.find(g => g.group_name === filterGroup)
        if (selectedGroup) {
          params.append('groupIdx', selectedGroup.group_idx.toString())
        }
      }

      const response = await fetch(`/api/students?${params.toString()}`)
      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.')
      }
      const result = await response.json()
      setStudents(result.data)
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
    loadStudents(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, filterStatus, filterGroup])

  // 통계 로드
  useEffect(() => {
    fetch('/api/students?limit=1')
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
    loadStudents(1)
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
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>스토리빌더 시니어 · 수강생 관리</h1>
          <p className={styles.subtitle}>수강생 정보와 로그인 현황을 확인하고 관리합니다.</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.secondaryButton}>수강생 가져오기</button>
          <button className={styles.primaryButton}>+ 수강생 초대</button>
        </div>
      </div>

      {/* 통계 카드 */}
      {!isLoading && !error && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--primary-100)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>전체 수강생</h3>
              <p className={styles.statNumber}>{stats.total.toLocaleString()}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--success-100)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success-600)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>활성 수강생</h3>
              <p className={styles.statNumber}>{stats.active.toLocaleString()}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--gray-100)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gray-600)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>비활성 수강생</h3>
              <p className={styles.statNumber}>{stats.inactive.toLocaleString()}</p>
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
            placeholder="수강생 이름 검색"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
          <div className={styles.filterGroup}>
            <select
              className={styles.select}
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="전체상태">상태 전체</option>
              <option value="활성">활성</option>
              <option value="비활성">비활성</option>
            </select>
            <select
              className={styles.select}
              value={filterGroup}
              onChange={(e) => {
                setFilterGroup(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="전체기수">기수 전체</option>
              {groups.map((group) => (
                <option key={group.group_idx} value={group.group_name}>
                  {group.group_name}
                </option>
              ))}
            </select>
            <button className={styles.searchButton} onClick={handleSearch}>
              검색
            </button>
          </div>
        </div>
      )}

      {/* 테이블 */}
      {!isLoading && !error && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>수강생</th>
                <th>기수/클래스</th>
                <th>이메일</th>
                <th>최근 로그인</th>
                <th>로그인 횟수</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id}>
                    <td className={styles.numberCell}>{student.sequence}</td>
                    <td style={{ fontWeight: 600 }}>{student.name}</td>
                    <td>{student.groupName}</td>
                    <td>{student.email}</td>
                    <td className={styles.dateCell}>{student.lastLoginDate}</td>
                    <td>{student.loginCount}회</td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          student.status === '활성'
                            ? styles.active
                            : styles.inactive
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.tableActions}>
                        <Link
                          href={`/admin/users/${student.id}`}
                          className={styles.linkButton}
                        >
                          프로필
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className={styles.emptyState}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h3>수강생 데이터가 없습니다</h3>
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
