'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../products.module.css'

const typeOptions = [
  { value: 'school', label: '스쿨' },
  { value: 'metaware', label: '메타웨어' },
  { value: 'storybuilder', label: '스토리빌더' },
]

const levelOptions = [
  { value: 'home', label: '홈' },
  { value: 'class', label: '클래스' },
  { value: 'storybuilder', label: '스토리빌더' },
  { value: 'tutor', label: '튜터' },
]

export default function NewLicensePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    licenseCode: '',
    licenseName: '',
    licenseType: 'school',
    licenseLevel: 'home',
    period: 12,
    limit: 1,
    startDate: '',
    endDate: '',
    usedYN: 'Y',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleGenerateCode = () => {
    const randomSegment = Math.random().toString(36).substring(2, 8).toUpperCase()
    const timestampSegment = Date.now().toString().slice(-4)
    const generated = `LIC-${randomSegment}-${timestampSegment}`
    setFormData(prev => ({
      ...prev,
      licenseCode: generated,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.licenseName.trim()) {
      setError('라이선스명을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch('/api/licenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || '라이선스 생성에 실패했습니다.')
      }

      const result = await response.json()
      alert(result.message || '새 라이선스가 발급되었습니다.')
      router.push('/admin/products')
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.productsPage}>
      <div className={styles.header}>
        <div>
          <Link href="/admin/products" style={{ color: 'var(--gray-600)', textDecoration: 'none', marginBottom: '8px', display: 'inline-block' }}>
            ← 라이선스 목록으로
          </Link>
          <h1 className={styles.title}>새 라이선스 발급</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', padding: '24px', display: 'grid', gap: '24px' }}>
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--error-50)', color: 'var(--error-700)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>라이선스 코드</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={formData.licenseCode}
                  onChange={(e) => handleChange('licenseCode', e.target.value)}
                  placeholder="미입력 시 자동 생성"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    flex: 1,
                  }}
                />
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--gray-300)',
                    background: 'var(--gray-100)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    minWidth: '120px',
                  }}
                >
                  자동생성
                </button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>라이선스명 *</label>
              <input
                type="text"
                value={formData.licenseName}
                onChange={(e) => handleChange('licenseName', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--gray-300)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>타입</label>
              <select
                value={formData.licenseType}
                onChange={(e) => handleChange('licenseType', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--gray-300)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                }}
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>등급</label>
              <select
                value={formData.licenseLevel}
                onChange={(e) => handleChange('licenseLevel', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--gray-300)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                }}
              >
                {levelOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>상태</label>
              <select
                value={formData.usedYN}
                onChange={(e) => handleChange('usedYN', e.target.value)}
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
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>기간 (개월)</label>
              <input
                type="number"
                min={1}
                value={formData.period}
                onChange={(e) => handleChange('period', parseInt(e.target.value) || 1)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--gray-300)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>사용자 제한</label>
              <input
                type="number"
                min={1}
                value={formData.limit}
                onChange={(e) => handleChange('limit', parseInt(e.target.value) || 1)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--gray-300)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>시작일</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--gray-300)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>만료일</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--gray-300)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Link
              href="/admin/products"
              className={styles.deleteButton}
              style={{ background: 'var(--gray-500)', padding: '12px 24px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              취소
            </Link>
            <button
              type="submit"
              className={styles.addButton}
              disabled={isSubmitting}
              style={{ padding: '12px 36px' }}
            >
              {isSubmitting ? '발급 중...' : '라이선스 발급'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

