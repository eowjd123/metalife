'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './board.module.css'

interface Board {
  id: number
  title: string
  contents: string
  gubun: string
  gubunName: string
  depth: number
  sort: number
  image1: string | null
  image2: string | null
  registeredDate: string
  registeredIp: string | null
  memberIdx: number | null
  memberId: string | null
  memberName: string | null
  memberEmail: string | null
}

export default function BoardPage() {
  const pathname = usePathname()
  const [boards, setBoards] = useState<Board[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [stats, setStats] = useState({
    total: 0,
    notice: 0,
    faq: 0,
    general: 0,
  })

  // 현재 게시판 구분 결정
  const getBoardGubun = () => {
    if (pathname?.includes('/notice')) return 'NO'
    if (pathname?.includes('/faq')) return 'FR'
    if (pathname?.includes('/general')) return 'BO'
    return null
  }

  const boardGubun = getBoardGubun()
  const boardGubunNameMap: Record<string, string> = {
    NO: '공지사항',
    FR: 'FAQ',
    BO: '일반게시판',
  }
  const boardGubunName = boardGubun ? boardGubunNameMap[boardGubun] || '게시판' : '게시판'

  // 검색 상태
  const [searchTitle, setSearchTitle] = useState('')

  // 데이터 로드
  const loadBoards = async (page: number = 1) => {
    if (!boardGubun) return

    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', pageSize.toString())
      params.append('boardGubun', boardGubun)

      if (searchTitle) {
        params.append('title', searchTitle)
      }

      const response = await fetch(`/api/board?${params.toString()}`)
      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.')
      }
      const result = await response.json()
      setBoards(result.data)
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
    loadBoards(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, boardGubun])

  // 통계 로드
  useEffect(() => {
    fetch('/api/board?limit=1')
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
    loadBoards(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/board/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('삭제에 실패했습니다.')
      }

      alert('게시글이 삭제되었습니다.')
      loadBoards(currentPage)
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.')
    }
  }

  if (!boardGubun) {
    return (
      <div className={styles.boardPage}>
        <div className={styles.header}>
          <h1 className={styles.title}>게시판 관리</h1>
        </div>
        <div className={styles.emptyState}>
          <h3>게시판을 선택해주세요</h3>
          <p>사이드바에서 공지사항, FAQ, 일반게시판 중 하나를 선택하세요.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.boardPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{boardGubunName} 관리</h1>
        </div>
        <Link href={`/admin/board/${boardGubun.toLowerCase()}/new`} className={styles.addButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          새 글 작성
        </Link>
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
              <h3>전체 게시글</h3>
              <p className={styles.statNumber}>{stats.total.toLocaleString()}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--error-100)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--error-600)" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>공지사항</h3>
              <p className={styles.statNumber}>{stats.notice.toLocaleString()}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--primary-100)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>FAQ</h3>
              <p className={styles.statNumber}>{stats.faq.toLocaleString()}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'var(--gray-100)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gray-600)" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>일반게시판</h3>
              <p className={styles.statNumber}>{stats.general.toLocaleString()}</p>
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
            placeholder="제목 검색"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
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
                <th>제목</th>
                <th>내용</th>
                <th>작성자</th>
                <th>등록일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {boards.length > 0 ? (
                boards.map((board) => (
                  <tr key={board.id}>
                    <td className={styles.titleCell}>
                      <Link href={`/admin/board/${boardGubun.toLowerCase()}/${board.id}`}>
                        {board.title || '(제목 없음)'}
                      </Link>
                    </td>
                    <td className={styles.contentsCell}>
                      {board.contents ? board.contents.replace(/<[^>]*>/g, '').substring(0, 50) + '...' : '-'}
                    </td>
                    <td>{board.memberName || board.memberId || '-'}</td>
                    <td className={styles.dateCell}>{board.registeredDate}</td>
                    <td>
                      <div className={styles.tableActions}>
                        <Link
                          href={`/admin/board/${boardGubun.toLowerCase()}/${board.id}`}
                          className={styles.linkButton}
                        >
                          수정
                        </Link>
                        <button
                          className={`${styles.linkButton} ${styles.danger}`}
                          onClick={() => handleDelete(board.id)}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
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
                    <h3>게시글이 없습니다</h3>
                    <p>새 글을 작성해주세요.</p>
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

