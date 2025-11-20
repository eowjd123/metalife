'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import styles from '../users.module.css'

interface UserDetail {
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
  groupIdx: number
  groupName: string
}

export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params?.id as string

  const [user, setUser] = useState<UserDetail | null>(null)
  const [groups, setGroups] = useState<Array<{ id: number; name: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // 폼 데이터
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '일반',
    status: '활성',
    grade: 1,
    groupIdx: 1,
  })

  // 회원 상세 정보 로드
  const loadUser = async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) {
        throw new Error('회원 정보를 불러오는데 실패했습니다.')
      }
      const data = await response.json()
      setUser(data)
      setFormData({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        role: data.role,
        status: data.status,
        grade: data.grade,
        groupIdx: data.groupIdx || 1,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      console.error('회원 로드 오류:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // 그룹 목록 로드
  const loadGroups = async () => {
    try {
      const response = await fetch('/api/groups?limit=1000')
      if (response.ok) {
        const result = await response.json()
        setGroups(result.data.map((g: any) => ({ id: g.id, name: g.name })))
      }
    } catch (err) {
      console.error('그룹 목록 로드 오류:', err)
    }
  }

  useEffect(() => {
    if (userId) {
      loadUser()
      loadGroups()
    }
  }, [userId])

  // 회원 수정
  const handleUpdate = async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('회원 수정에 실패했습니다.')
      }

      const result = await response.json()
      alert(result.message || '회원 정보가 수정되었습니다.')
      setIsEditing(false)
      loadUser()
    } catch (err) {
      alert(err instanceof Error ? err.message : '수정 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 회원 삭제
  const handleDelete = async () => {
    if (!userId) return

    const confirmed = confirm('정말 이 회원을 삭제하시겠습니까?')
    if (!confirmed) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('회원 삭제에 실패했습니다.')
      }

      const result = await response.json()
      alert(result.message || '회원이 삭제되었습니다.')
      router.push('/admin/users')
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !user) {
    return (
      <div className={styles.usersPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className={styles.usersPage}>
        <div className={styles.errorMessage}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error || '회원을 찾을 수 없습니다.'}</span>
        </div>
        <Link href="/admin/users" className={styles.addButton} style={{ marginTop: '20px', display: 'inline-block' }}>
          목록으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.usersPage}>
      <div className={styles.header}>
        <div>
          <Link href="/admin/users" style={{ color: 'var(--gray-600)', textDecoration: 'none', marginBottom: '8px', display: 'inline-block' }}>
            ← 회원 목록으로
          </Link>
          <h1 className={styles.title}>{user.name}</h1>
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
                  loadUser()
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

      {/* 회원 정보 */}
      <div className={styles.tableContainer} style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                회원 ID
              </label>
              <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                {user.memberId || '-'}
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
                  {user.name}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                  {user.email}
                </div>
              )}
            </div>

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
                  {user.phone || '-'}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
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
                  <option value="학생">학생</option>
                  <option value="교사">교사</option>
                  <option value="일반">일반</option>
                  <option value="기관">기관</option>
                </select>
              ) : (
                <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                  <span className={`${styles.badge} ${styles[user.role] || styles.일반}`}>
                    {user.role}
                  </span>
                </div>
              )}
            </div>

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
                  <span className={`${styles.status} ${styles[user.status]}`}>
                    <span className={styles.statusDot}></span>
                    {user.status}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                등급
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) || 1 })}
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
                  <span className={styles.gradeBadge}>{user.grade}</span>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                소속 그룹
              </label>
              {isEditing ? (
                <select
                  value={formData.groupIdx}
                  onChange={(e) => setFormData({ ...formData, groupIdx: parseInt(e.target.value) || 1 })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                  }}
                >
                  <option value={1}>없음</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                  {user.groupName}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                가입일
              </label>
              <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                {user.joinDate}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                최종 로그인
              </label>
              <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                {user.loginDate || '-'}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                로그인 횟수
              </label>
              <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                <span className={styles.countBadge}>{user.loginCount.toLocaleString()}회</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

