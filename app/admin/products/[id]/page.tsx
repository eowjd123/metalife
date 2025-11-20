'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import styles from '../products.module.css'

interface LicenseDetail {
  id: number
  licenseCode: string
  licenseName: string
  type: string
  typeLabel: string
  level: string
  levelLabel: string
  period: number
  limit: number
  startDate: string
  endDate: string
  usedYN: string
  status: string
  currentUsers: number
  createdAt: string
  adminIdx: number
}

export default function LicenseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const licenseId = params?.id as string

  const [license, setLicense] = useState<LicenseDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // 폼 데이터
  const [formData, setFormData] = useState({
    licenseName: '',
    licenseType: 'school',
    licenseLevel: 'home',
    period: 1,
    limit: 1,
    startDate: '',
    endDate: '',
    usedYN: 'Y',
  })

  // 라이선스 상세 정보 로드
  const loadLicense = async () => {
    if (!licenseId) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/licenses/${licenseId}`)
      if (!response.ok) {
        throw new Error('라이선스 정보를 불러오는데 실패했습니다.')
      }
      const data = await response.json()
      setLicense(data)
      setFormData({
        licenseName: data.licenseName,
        licenseType: data.type,
        licenseLevel: data.level,
        period: data.period,
        limit: data.limit,
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        usedYN: data.usedYN,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      console.error('라이선스 로드 오류:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (licenseId) {
      loadLicense()
    }
  }, [licenseId])

  // 라이선스 수정
  const handleUpdate = async () => {
    if (!licenseId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/licenses/${licenseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('라이선스 수정에 실패했습니다.')
      }

      const result = await response.json()
      alert(result.message || '라이선스 정보가 수정되었습니다.')
      setIsEditing(false)
      loadLicense()
    } catch (err) {
      alert(err instanceof Error ? err.message : '수정 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 라이선스 삭제
  const handleDelete = async () => {
    if (!licenseId) return

    const confirmed = confirm('정말 이 라이선스를 삭제하시겠습니까?')
    if (!confirmed) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/licenses/${licenseId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('라이선스 삭제에 실패했습니다.')
      }

      const result = await response.json()
      alert(result.message || '라이선스가 삭제되었습니다.')
      router.push('/admin/products')
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !license) {
    return (
      <div className={styles.productsPage}>
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid var(--gray-200)', borderTopColor: 'var(--primary-500)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--gray-600)' }}>데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !license) {
    return (
      <div className={styles.productsPage}>
        <div style={{ padding: '16px', background: 'var(--error-50)', color: 'var(--error-700)', borderRadius: 'var(--radius-md)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error || '라이선스를 찾을 수 없습니다.'}</span>
        </div>
        <Link href="/admin/products" className={styles.addButton} style={{ marginTop: '20px', display: 'inline-block', textDecoration: 'none' }}>
          목록으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.productsPage}>
      <div className={styles.header}>
        <div>
          <Link href="/admin/products" style={{ color: 'var(--gray-600)', textDecoration: 'none', marginBottom: '8px', display: 'inline-block' }}>
            ← 라이선스 목록으로
          </Link>
          <h1 className={styles.title}>{license.licenseName}</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {isEditing ? (
            <>
              <button
                className={styles.addButton}
                onClick={handleUpdate}
                disabled={isLoading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}>
                  <path d="M20 6L9 17l-5-5"></path>
                </svg>
                저장
              </button>
              <button
                className={styles.deleteButton}
                onClick={() => {
                  setIsEditing(false)
                  loadLicense()
                }}
                disabled={isLoading}
                style={{ background: 'var(--gray-500)', padding: '12px 24px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                취소
              </button>
            </>
          ) : (
            <>
              <button className={styles.addButton} onClick={() => setIsEditing(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                수정
              </button>
              <button className={styles.deleteButton} onClick={handleDelete} disabled={isLoading} style={{ padding: '12px 24px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}>
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                삭제
              </button>
            </>
          )}
        </div>
      </div>

      {/* 라이선스 정보 */}
      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', padding: '24px' }}>
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                라이선스 코드
              </label>
              <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                <code style={{ fontFamily: 'monospace', fontSize: '14px' }}>{license.licenseCode || '-'}</code>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                라이선스명
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.licenseName}
                  onChange={(e) => setFormData({ ...formData, licenseName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                  }}
                />
              ) : (
                <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                  {license.licenseName}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                타입
              </label>
              {isEditing ? (
                <select
                  value={formData.licenseType}
                  onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                  }}
                >
                  <option value="school">스쿨</option>
                  <option value="metaware">메타웨어</option>
                  <option value="storybuilder">스토리빌더</option>
                </select>
              ) : (
                <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                  {license.typeLabel}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                등급
              </label>
              {isEditing ? (
                <select
                  value={formData.licenseLevel}
                  onChange={(e) => setFormData({ ...formData, licenseLevel: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                  }}
                >
                  <option value="home">홈</option>
                  <option value="class">클래스</option>
                  <option value="storybuilder">스토리빌더</option>
                  <option value="tutor">튜터</option>
                </select>
              ) : (
                <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                  {license.levelLabel}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                상태
              </label>
              {isEditing ? (
                <select
                  value={formData.usedYN}
                  onChange={(e) => setFormData({ ...formData, usedYN: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                  }}
                >
                  <option value="Y">활성</option>
                  <option value="N">비활성</option>
                </select>
              ) : (
                <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                  <span className={`${styles.status} ${styles[license.status]}`}>
                    {license.status}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                기간
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: parseInt(e.target.value) || 1 })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                  }}
                />
              ) : (
                <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                  {license.period}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                사용자 제한
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: parseInt(e.target.value) || 1 })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                  }}
                />
              ) : (
                <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                  {license.limit}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                시작일
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                  }}
                />
              ) : (
                <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                  {license.startDate || '-'}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                만료일
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                  }}
                />
              ) : (
                <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                  {license.endDate || '-'}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                현재 사용자 수
              </label>
              <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontWeight: 600, color: 'var(--primary-600)' }}>{license.currentUsers}</span> / {license.limit}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                생성일
              </label>
              <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                {license.createdAt}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

