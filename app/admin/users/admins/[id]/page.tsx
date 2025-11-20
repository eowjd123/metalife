'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import styles from '../../users.module.css'

interface AdminDetail {
  id: number
  adminId: string
  name: string
  nicname: string
  email: string
  phone: string
  role: string
  roleCode: string
  permissions: string
  joinDate: string
  lastLogin: string
  status: string
}

export default function AdminDetailPage() {
  const router = useRouter()
  const params = useParams()
  const adminId = params?.id as string

  const [admin, setAdmin] = useState<AdminDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // 폼 데이터
  const [formData, setFormData] = useState({
    name: '',
    nicname: '',
    email: '',
    phone: '',
    role: '일반',
    status: '활성',
    password: '',
  })

  // 관리자 상세 정보 로드
  const loadAdmin = async () => {
    if (!adminId) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admins/${adminId}`)
      if (!response.ok) {
        throw new Error('관리자 정보를 불러오는데 실패했습니다.')
      }
      const data = await response.json()
      setAdmin(data)
      setFormData({
        name: data.name,
        nicname: data.nicname,
        email: data.email,
        phone: data.phone || '',
        role: data.role,
        status: data.status,
        password: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      console.error('관리자 로드 오류:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (adminId) {
      loadAdmin()
    }
  }, [adminId])

  // 관리자 수정
  const handleUpdate = async () => {
    if (!adminId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admins/${adminId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('관리자 수정에 실패했습니다.')
      }

      const result = await response.json()
      alert(result.message || '관리자 정보가 수정되었습니다.')
      setIsEditing(false)
      loadAdmin()
    } catch (err) {
      alert(err instanceof Error ? err.message : '수정 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 관리자 삭제
  const handleDelete = async () => {
    if (!adminId) return

    const confirmed = confirm('정말 이 관리자를 삭제하시겠습니까?')
    if (!confirmed) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admins/${adminId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('관리자 삭제에 실패했습니다.')
      }

      const result = await response.json()
      alert(result.message || '관리자가 삭제되었습니다.')
      router.push('/admin/users/admins')
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !admin) {
    return (
      <div className={styles.usersPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !admin) {
    return (
      <div className={styles.usersPage}>
        <div className={styles.errorMessage}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error || '관리자를 찾을 수 없습니다.'}</span>
        </div>
        <Link href="/admin/users/admins" className={styles.addButton} style={{ marginTop: '20px', display: 'inline-block' }}>
          목록으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.usersPage}>
      <div className={styles.header}>
        <div>
          <Link href="/admin/users/admins" style={{ color: 'var(--gray-600)', textDecoration: 'none', marginBottom: '8px', display: 'inline-block' }}>
            ← 관리자 목록으로
          </Link>
          <h1 className={styles.title}>{admin.name}</h1>
        </div>
        <div className={styles.detailActions}>
          {isEditing ? (
            <>
              <button
                className={`${styles.detailButton} ${styles.detailButtonPrimary}`}
                onClick={handleUpdate}
                disabled={isLoading}
              >
                <svg className={styles.detailButtonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 6L9 17l-5-5"></path>
                </svg>
                저장
              </button>
              <button
                className={`${styles.detailButton} ${styles.detailButtonSecondary}`}
                onClick={() => {
                  setIsEditing(false)
                  loadAdmin()
                }}
                disabled={isLoading}
              >
                <svg className={styles.detailButtonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                취소
              </button>
            </>
          ) : (
            <>
              <button
                className={`${styles.detailButton} ${styles.detailButtonPrimary}`}
                onClick={() => setIsEditing(true)}
              >
                <svg className={styles.detailButtonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                수정
              </button>
              <button
                className={`${styles.detailButton} ${styles.detailButtonDanger}`}
                onClick={handleDelete}
                disabled={isLoading}
              >
                <svg className={styles.detailButtonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                삭제
              </button>
            </>
          )}
        </div>
      </div>

      {/* 관리자 정보 */}
      <div className={styles.tableContainer} style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                관리자 ID
              </label>
              <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                {admin.adminId || '-'}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                이름
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  {admin.name}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                닉네임
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.nicname}
                  onChange={(e) => setFormData({ ...formData, nicname: e.target.value })}
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
                  {admin.nicname}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                이메일
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  {admin.email}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                전화번호
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                  {admin.phone || '-'}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                역할
              </label>
              {isEditing ? (
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                  }}
                >
                  <option value="슈퍼관리자">슈퍼관리자</option>
                  <option value="관리자">관리자</option>
                  <option value="일반">일반</option>
                  <option value="그룹">그룹</option>
                </select>
              ) : (
                <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                  <span className={`${styles.badge} ${styles[admin.role] || styles.일반}`}>
                    {admin.role}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                권한
              </label>
              <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                {admin.permissions}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                상태
              </label>
              {isEditing ? (
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                  }}
                >
                  <option value="활성">활성</option>
                  <option value="비활성">비활성</option>
                </select>
              ) : (
                <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                  <span className={`${styles.status} ${styles[admin.status]}`}>
                    <span className={styles.statusDot}></span>
                    {admin.status}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                가입일
              </label>
              <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                {admin.joinDate}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                최종 로그인
              </label>
              <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                {admin.lastLogin}
              </div>
            </div>
          </div>

          {isEditing && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                비밀번호 변경 (변경하지 않으려면 비워두세요)
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="새 비밀번호를 입력하세요"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--gray-300)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

