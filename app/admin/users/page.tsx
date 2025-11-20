'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './users.module.css'
import AdvancedSearch from '@/components/AdvancedSearch'

interface User {
  id: number
  memberId: string
  name: string
  email: string
  phone: string
  role: string
  roleCode: string
  status: string
  joinDate: string
  loginDate: string | null
  loginCount: number
  grade: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
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
    newMembers: 0,
  })

  // 데이터 로드 함수
  const loadUsers = async (searchParams?: Record<string, string>, page: number = 1) => {
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

      const response = await fetch(`/api/users?${params.toString()}`)
      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.')
      }
      const result = await response.json()
      setUsers(result.data)
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
    loadUsers(undefined, currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize])

  const searchFields = [
    { type: 'text' as const, name: 'name', label: '이름', placeholder: '이름을 입력하세요' },
    { type: 'text' as const, name: 'email', label: '이메일', placeholder: '이메일을 입력하세요' },
    { type: 'select' as const, name: 'role', label: '역할', options: [
      { value: '학생', label: '학생' },
      { value: '교사', label: '교사' },
      { value: '일반', label: '일반' },
      { value: '기관', label: '기관' },
    ]},
    { type: 'select' as const, name: 'status', label: '상태', options: [
      { value: '활성', label: '활성' },
      { value: '비활성', label: '비활성' },
    ]},
    { type: 'dateRange' as const, name: 'joinDate', label: '가입일' },
  ]

  const handleSearch = (values: Record<string, string>) => {
    setCurrentPage(1) // 검색 시 첫 페이지로 이동
    loadUsers(values, 1)
  }

  const handleReset = () => {
    setCurrentPage(1)
    loadUsers(undefined, 1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const router = useRouter()

  // 회원 삭제
  const handleDeleteUser = async (userId: number, userName: string) => {
    const confirmed = confirm(`정말 "${userName}" 회원을 삭제하시겠습니까?`)
    if (!confirmed) return

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('회원 삭제에 실패했습니다.')
      }

      const result = await response.json()
      alert(result.message || '회원이 삭제되었습니다.')
      loadUsers(undefined, currentPage)
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className={styles.usersPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>회원관리</h1>
        <button className={styles.addButton}>+ 새 회원 추가</button>
      </div>

      <AdvancedSearch fields={searchFields} onSearch={handleSearch} onReset={handleReset} />

      {/* 통계 카드 */}
      {!isLoading && !error && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--primary-100)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>총 회원 수</h3>
              <p className={styles.statNumber}>{stats.total.toLocaleString()}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--success-100)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>활성 회원</h3>
              <p className={styles.statNumber}>
                {stats.active.toLocaleString()}
              </p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--warning-100)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>신규 가입 (30일)</h3>
              <p className={styles.statNumber}>
                {stats.newMembers.toLocaleString()}
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
                <th>이름</th>
                <th>이메일</th>
                <th>전화번호</th>
                <th>역할</th>
                <th>상태</th>
                <th>등급</th>
                <th>가입일</th>
                <th>최종 로그인</th>
                <th>로그인 횟수</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={user.id}>
                    <td className={styles.numberCell}>
                      <span className={styles.sequenceNumber}>
                        {((currentPage - 1) * pageSize + index + 1).toLocaleString()}
                      </span>
                    </td>
                    <td className={styles.idCell}>
                      <code>{user.memberId}</code>
                    </td>
                    <td className={styles.nameCell}>
                      <div className={styles.nameWrapper}>
                        <strong>{user.name}</strong>
                      </div>
                    </td>
                    <td className={styles.emailCell}>
                      <a href={`mailto:${user.email}`} className={styles.emailLink}>
                        {user.email}
                      </a>
                    </td>
                    <td className={styles.phoneCell}>{user.phone || '-'}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[user.role] || styles.일반}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.status} ${styles[user.status]}`}>
                        <span className={styles.statusDot}></span>
                        {user.status}
                      </span>
                    </td>
                    <td className={styles.numberCell}>
                      <span className={styles.gradeBadge}>{user.grade}</span>
                    </td>
                    <td className={styles.dateCell}>{user.joinDate}</td>
                    <td className={styles.dateCell}>{user.loginDate || '-'}</td>
                    <td className={styles.numberCell}>
                      <span className={styles.countBadge}>{user.loginCount.toLocaleString()}</span>
                    </td>
                    <td className={styles.actionsCell}>
                      <div className={styles.actions}>
                        <Link href={`/admin/users/${user.id}`}>
                          <button className={styles.editButton} title="수정">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                        </Link>
                        <button className={styles.deleteButton} title="삭제" onClick={() => handleDeleteUser(user.id, user.name)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12}>
                    <div className={styles.emptyState}>
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <h3>회원 데이터가 없습니다</h3>
                      <p>검색 조건을 변경하거나 새 회원을 추가해보세요.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 페이지네이션 */}
      {!isLoading && !error && users.length > 0 && (
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
            <span>
              전체 <strong>{totalCount.toLocaleString()}</strong>개 중{' '}
              <strong>{(currentPage - 1) * pageSize + 1}</strong>-
              <strong>{Math.min(currentPage * pageSize, totalCount)}</strong>개 표시
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
              title="첫 페이지"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="11 17 6 12 11 7"></polyline>
                <polyline points="18 17 13 12 18 7"></polyline>
              </svg>
            </button>
            <button
              className={styles.paginationButton}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title="이전 페이지"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // 현재 페이지 주변 2페이지씩만 표시
                return (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 2 && page <= currentPage + 2)
                )
              })
              .map((page, index, array) => {
                // 이전 페이지와의 간격이 2 이상이면 ... 표시
                const showEllipsis = index > 0 && page - array[index - 1] > 1
                return (
                  <div key={page} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {showEllipsis && <span className={styles.paginationEllipsis}>...</span>}
                    <button
                      className={`${styles.paginationButton} ${styles.paginationNumber} ${
                        currentPage === page ? styles.active : ''
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  </div>
                )
              })}
            
            <button
              className={styles.paginationButton}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="다음 페이지"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            <button
              className={styles.paginationButton}
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              title="마지막 페이지"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="13 17 18 12 13 7"></polyline>
                <polyline points="6 17 11 12 6 7"></polyline>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

