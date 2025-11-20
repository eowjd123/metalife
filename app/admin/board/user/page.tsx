'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from '../board.module.css'

interface BoardUser {
  id: number
  name: string
  email: string
  title: string
  contents: string
  replyYN: string
  replyStatus: string
  registeredDate: string
  memberIdx: number | null
  memberId: string | null
  memberName: string | null
  memberEmail: string | null
  companyWorkplaceCode: string | null
}

export default function BoardUserPage() {
  const [boardUsers, setBoardUsers] = useState<BoardUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [stats, setStats] = useState({
    total: 0,
    replied: 0,
    pending: 0,
  })

  // 검색 상태
  const [searchName, setSearchName] = useState('')
  const [searchEmail, setSearchEmail] = useState('')
  const [searchTitle, setSearchTitle] = useState('')
  const [filterReply, setFilterReply] = useState('전체')

  // 데이터 로드
  const loadBoardUsers = async (page: number = 1) => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', pageSize.toString())

      if (searchName) params.append('name', searchName)
      if (searchEmail) params.append('email', searchEmail)
      if (searchTitle) params.append('title', searchTitle)
      if (filterReply !== '전체') params.append('replyYN', filterReply)

      const response = await fetch(`/api/board-user?${params.toString()}`)
      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.')
      }
      const result = await response.json()
      setBoardUsers(result.data)
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
    loadBoardUsers(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize])

  // 통계 로드
  useEffect(() => {
    fetch('/api/board-user?limit=1')
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
    loadBoardUsers(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const handleReplyToggle = async (id: number, currentReplyYN: string) => {
    const newReplyYN = currentReplyYN === 'Y' ? 'N' : 'Y'
    try {
      const response = await fetch(`/api/board-user/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ replyYN: newReplyYN }),
      })

      if (!response.ok) {
        throw new Error('답변 상태 변경에 실패했습니다.')
      }

      alert('답변 상태가 변경되었습니다.')
      loadBoardUsers(currentPage)
    } catch (err) {
      alert(err instanceof Error ? err.message : '답변 상태 변경 중 오류가 발생했습니다.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/board-user/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('삭제에 실패했습니다.')
      }

      alert('게시글이 삭제되었습니다.')
      loadBoardUsers(currentPage)
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className={styles.boardPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>사용자 문의 관리</h1>
        </div>
      </div>

      {/* 통계 카드 */}
      {!isLoading && !error && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--primary-100)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>전체 문의</h3>
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
              <h3>답변완료</h3>
              <p className={styles.statNumber}>{stats.replied.toLocaleString()}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--warning-100)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--warning-600)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>답변대기</h3>
              <p className={styles.statNumber}>{stats.pending.toLocaleString()}</p>
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
            placeholder="작성자명 검색"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <input
            className={styles.searchInput}
            placeholder="이메일 검색"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />
          <input
            className={styles.searchInput}
            placeholder="제목 검색"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
          <select
            className={styles.select}
            value={filterReply}
            onChange={(e) => setFilterReply(e.target.value)}
          >
            <option value="전체">답변 상태 전체</option>
            <option value="Y">답변완료</option>
            <option value="N">답변대기</option>
          </select>
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
                <th>제목</th>
                <th>작성자</th>
                <th>이메일</th>
                <th>답변상태</th>
                <th>등록일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {boardUsers.length > 0 ? (
                boardUsers.map((boardUser) => (
                  <tr key={boardUser.id}>
                    <td className={styles.titleCell}>
                      <Link href={`/admin/board/user/${boardUser.id}`}>
                        {boardUser.title || '(제목 없음)'}
                      </Link>
                    </td>
                    <td>{boardUser.name || boardUser.memberName || '-'}</td>
                    <td>{boardUser.email || boardUser.memberEmail || '-'}</td>
                    <td>
                      <span
                        className={`${styles.gubunBadge} ${
                          boardUser.replyYN === 'Y' ? styles.notice : styles.faq
                        }`}
                        style={
                          boardUser.replyYN === 'Y'
                            ? { background: 'var(--success-100)', color: 'var(--success-700)' }
                            : { background: 'var(--warning-100)', color: 'var(--warning-700)' }
                        }
                      >
                        {boardUser.replyStatus}
                      </span>
                    </td>
                    <td className={styles.dateCell}>{boardUser.registeredDate}</td>
                    <td>
                      <div className={styles.tableActions}>
                        <Link
                          href={`/admin/board/user/${boardUser.id}`}
                          className={styles.linkButton}
                        >
                          상세
                        </Link>
                        <button
                          className={styles.linkButton}
                          onClick={() => handleReplyToggle(boardUser.id, boardUser.replyYN)}
                        >
                          {boardUser.replyYN === 'Y' ? '답변취소' : '답변완료'}
                        </button>
                        <button
                          className={`${styles.linkButton} ${styles.danger}`}
                          onClick={() => handleDelete(boardUser.id)}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h3>문의가 없습니다</h3>
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

