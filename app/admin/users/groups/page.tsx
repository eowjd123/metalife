'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../users.module.css'
import AdvancedSearch from '@/components/AdvancedSearch'

interface Group {
  id: number
  name: string
  description: string
  phone: string
  email: string
  address: string
  type: string
  memberCount: number
  createdAt: string
  status: string
  adminIdx: number
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
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

  // 데이터 로드 함수
  const loadGroups = async (searchParams?: Record<string, string>, page: number = 1) => {
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

      const response = await fetch(`/api/groups?${params.toString()}`)
      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.')
      }
      const result = await response.json()
      setGroups(result.data)
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
    loadGroups(undefined, currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize])

  const searchFields = [
    { type: 'text' as const, name: 'name', label: '그룹명', placeholder: '그룹명을 입력하세요' },
    { type: 'select' as const, name: 'status', label: '상태', options: [
      { value: '활성', label: '활성' },
      { value: '비활성', label: '비활성' },
    ]},
    { type: 'dateRange' as const, name: 'createdAt', label: '생성일' },
  ]

  const handleSearch = (values: Record<string, string>) => {
    setCurrentPage(1) // 검색 시 첫 페이지로 이동
    loadGroups(values, 1)
  }

  const handleReset = () => {
    setCurrentPage(1)
    loadGroups(undefined, 1)
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

  // 그룹 삭제
  const handleDeleteGroup = async (groupId: number, groupName: string) => {
    const confirmed = confirm(`정말 "${groupName}" 그룹을 삭제하시겠습니까?`)
    if (!confirmed) return

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('그룹 삭제에 실패했습니다.')
      }

      const result = await response.json()
      alert(result.message || '그룹이 삭제되었습니다.')
      loadGroups(undefined, currentPage)
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className={styles.usersPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>소속 그룹 관리</h1>
        <button className={styles.addButton}>+ 새 그룹 추가</button>
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
              <h3>총 그룹 수</h3>
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
              <h3>활성 그룹</h3>
              <p className={styles.statNumber}>
                {stats.active.toLocaleString()}
              </p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--error-100)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>비활성 그룹</h3>
              <p className={styles.statNumber}>
                {stats.inactive.toLocaleString()}
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
                <th>그룹명</th>
                <th>주소</th>
                <th>연락처</th>
                <th>멤버 수</th>
                <th>생성일</th>
                <th>상태</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {groups.length > 0 ? (
                groups.map((group, index) => (
                  <tr key={group.id}>
                    <td className={styles.numberCell}>
                      <span className={styles.sequenceNumber}>
                        {((currentPage - 1) * pageSize + index + 1).toLocaleString()}
                      </span>
                    </td>
                    <td className={styles.nameCell}>
                      <strong>{group.name}</strong>
                    </td>
                    <td className={styles.emailCell}>{group.address}</td>
                    <td className={styles.phoneCell}>
                      {group.phone !== '-' && (
                        <>
                          {group.phone}
                          {group.email !== '-' && <br />}
                        </>
                      )}
                      {group.email !== '-' && (
                        <a href={`mailto:${group.email}`} className={styles.emailLink}>
                          {group.email}
                        </a>
                      )}
                    </td>
                    <td className={styles.numberCell}>
                      <span className={styles.countBadge}>{group.memberCount.toLocaleString()}명</span>
                    </td>
                    <td className={styles.dateCell}>{group.createdAt}</td>
                    <td>
                      <span className={`${styles.status} ${styles[group.status]}`}>
                        <span className={styles.statusDot}></span>
                        {group.status}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <div className={styles.actions}>
                        <Link href={`/admin/users/groups/${group.id}`}>
                          <button className={styles.editButton} title="수정">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                        </Link>
                        <button className={styles.deleteButton} title="삭제" onClick={() => handleDeleteGroup(group.id, group.name)}>
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
                  <td colSpan={8} className={styles.emptyState}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h3>그룹 데이터가 없습니다</h3>
                    <p>검색 조건을 변경하거나 새 그룹을 추가해주세요.</p>
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

