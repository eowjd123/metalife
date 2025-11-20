'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../products.module.css'
import AdvancedSearch from '@/components/AdvancedSearch'

interface License {
  id: number
  licenseCode: string
  licenseName: string
  type: string
  level: string
  period: number
  limit: number
  startDate: string
  endDate: string
  status: string
  usedYN: string
  currentUsers: number
  maxUsers: number
  createdAt: string
}

export default function ExpiredLicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
  })

  // 데이터 로드 함수
  const loadLicenses = async (searchParams?: Record<string, string>, page: number = 1) => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      
      // 만료된 라이선스만 필터링
      params.append('status', '만료')
      
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

      const response = await fetch(`/api/licenses?${params.toString()}`)
      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.')
      }
      const result = await response.json()
      setLicenses(result.data)
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
    loadLicenses(undefined, currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize])

  const searchFields = [
    { type: 'text' as const, name: 'licenseCode', label: '라이선스 코드', placeholder: '라이선스 코드를 입력하세요' },
    { type: 'text' as const, name: 'licenseName', label: '라이선스명', placeholder: '라이선스명을 입력하세요' },
    { type: 'select' as const, name: 'licenseType', label: '타입', options: [
      { value: 'school', label: '스쿨' },
      { value: 'metaware', label: '메타웨어' },
      { value: 'storybuilder', label: '스토리빌더' },
    ]},
    { type: 'select' as const, name: 'licenseLevel', label: '등급', options: [
      { value: 'home', label: '홈' },
      { value: 'class', label: '클래스' },
      { value: 'storybuilder', label: '스토리빌더' },
      { value: 'tutor', label: '튜터' },
    ]},
    { type: 'dateRange' as const, name: 'startDate', label: '시작일' },
    { type: 'dateRange' as const, name: 'endDate', label: '만료일' },
  ]

  const handleSearch = (values: Record<string, string>) => {
    setCurrentPage(1)
    loadLicenses(values, 1)
  }

  const handleReset = () => {
    setCurrentPage(1)
    loadLicenses(undefined, 1)
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

  // 라이선스 삭제
  const handleDeleteLicense = async (licenseId: number, licenseName: string) => {
    const confirmed = confirm(`정말 "${licenseName}" 라이선스를 삭제하시겠습니까?`)
    if (!confirmed) return

    try {
      const response = await fetch(`/api/licenses/${licenseId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('라이선스 삭제에 실패했습니다.')
      }

      const result = await response.json()
      alert(result.message || '라이선스가 삭제되었습니다.')
      loadLicenses(undefined, currentPage)
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className={styles.productsPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>만료된 라이선스</h1>
        <Link href="/admin/products/new" className={styles.addButton} style={{ textDecoration: 'none' }}>
          + 새 라이선스 발급
        </Link>
      </div>

      <AdvancedSearch fields={searchFields} onSearch={handleSearch} onReset={handleReset} />

      {/* 통계 카드 */}
      {!isLoading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--error-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--error-600)" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-600)', margin: 0 }}>만료된 라이선스</h3>
                <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--gray-900)', margin: 0 }}>{stats.expired.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 오류 메시지 */}
      {error && (
        <div style={{ padding: '16px', background: 'var(--error-50)', color: 'var(--error-700)', borderRadius: 'var(--radius-md)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
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
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid var(--gray-200)', borderTopColor: 'var(--primary-500)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--gray-600)' }}>데이터를 불러오는 중...</p>
        </div>
      )}

      {/* 테이블 */}
      {!isLoading && !error && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>라이선스 코드</th>
                <th>라이선스명</th>
                <th>타입</th>
                <th>등급</th>
                <th>시작일</th>
                <th>만료일</th>
                <th>사용자 수</th>
                <th>상태</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {licenses.length > 0 ? (
                licenses.map((license, index) => (
                  <tr key={license.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>
                        {((currentPage - 1) * pageSize + index + 1).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <code className={styles.licenseKey}>{license.licenseCode}</code>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{license.licenseName}</div>
                    </td>
                    <td>{license.type}</td>
                    <td>{license.level}</td>
                    <td>{license.startDate}</td>
                    <td>{license.endDate}</td>
                    <td>
                      <div className={styles.userCount}>
                        <span className={styles.currentUsers}>{license.currentUsers}</span>
                        <span className={styles.separator}>/</span>
                        <span className={styles.maxUsers}>{license.maxUsers}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.status} ${styles[license.status]}`}>
                        {license.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.editButton}
                          onClick={() => router.push(`/admin/products/${license.id}`)}
                        >
                          갱신
                        </button>
                        <button className={styles.deleteButton} onClick={() => handleDeleteLicense(license.id, license.licenseName)}>
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} style={{ padding: '60px', textAlign: 'center' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 16px', color: 'var(--gray-400)' }}>
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '8px' }}>만료된 라이선스 데이터가 없습니다</h3>
                    <p style={{ color: 'var(--gray-500)' }}>검색 조건을 변경해주세요.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 페이지네이션 */}
      {!isLoading && !error && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', padding: '20px', background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
              전체 <strong>{totalCount.toLocaleString()}</strong>개 중{' '}
              <strong>
                {((currentPage - 1) * pageSize + 1).toLocaleString()}-
                {Math.min(currentPage * pageSize, totalCount).toLocaleString()}
              </strong>
              개 표시
            </span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                background: 'white',
              }}
            >
              <option value={10}>10개씩</option>
              <option value={20}>20개씩</option>
              <option value={50}>50개씩</option>
              <option value={100}>100개씩</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              style={{
                padding: '8px 16px',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                background: currentPage === 1 ? 'var(--gray-100)' : 'white',
                color: currentPage === 1 ? 'var(--gray-400)' : 'var(--gray-700)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              처음
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '8px 16px',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                background: currentPage === 1 ? 'var(--gray-100)' : 'white',
                color: currentPage === 1 ? 'var(--gray-400)' : 'var(--gray-700)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
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
                    <span key={`ellipsis-${page}`} style={{ padding: '8px', color: 'var(--gray-400)' }}>
                      ...
                    </span>
                  )
                }
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid var(--gray-300)',
                      borderRadius: 'var(--radius-md)',
                      background: currentPage === page ? 'var(--primary-500)' : 'white',
                      color: currentPage === page ? 'white' : 'var(--gray-700)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: currentPage === page ? 600 : 400,
                    }}
                  >
                    {page}
                  </button>
                )
              })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 16px',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                background: currentPage === totalPages ? 'var(--gray-100)' : 'white',
                color: currentPage === totalPages ? 'var(--gray-400)' : 'var(--gray-700)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              다음
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 16px',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-md)',
                background: currentPage === totalPages ? 'var(--gray-100)' : 'white',
                color: currentPage === totalPages ? 'var(--gray-400)' : 'var(--gray-700)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              마지막
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
