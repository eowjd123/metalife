'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import styles from '../../users.module.css'

interface GroupDetail {
  id: number
  name: string
  phone: string
  email: string
  zipcode: string
  address: string
  addressDetail: string
  fullAddress: string
  type: string
  memberCount: number
  createdAt: string
  status: string
  adminIdx: number
  adminName: string
  adminEmail: string
}

interface GroupMember {
  id: number
  memberId: string
  name: string
  email: string
  phone: string
  role: string
  joinDate: string
  loginDate: string
  loginCount: number
}

export default function GroupDetailPage() {
  const router = useRouter()
  const params = useParams()
  const groupId = params?.id as string

  const [group, setGroup] = useState<GroupDetail | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'members'>('info')
  const [memberPage, setMemberPage] = useState(1)
  const [memberTotal, setMemberTotal] = useState(0)
  const [memberTotalPages, setMemberTotalPages] = useState(1)

  // 폼 데이터
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    zipcode: '',
    address: '',
    addressDetail: '',
    type: 'A',
    status: '활성',
    adminIdx: 1,
  })

  // 그룹 상세 정보 로드
  const loadGroup = async () => {
    if (!groupId) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/groups/${groupId}`)
      if (!response.ok) {
        throw new Error('그룹 정보를 불러오는데 실패했습니다.')
      }
      const data = await response.json()
      setGroup(data)
      setFormData({
        name: data.name,
        phone: data.phone || '',
        email: data.email || '',
        zipcode: data.zipcode || '',
        address: data.address || '',
        addressDetail: data.addressDetail || '',
        type: data.type,
        status: data.status,
        adminIdx: data.adminIdx,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      console.error('그룹 로드 오류:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // 그룹 멤버 목록 로드
  const loadMembers = async (page: number = 1) => {
    if (!groupId) return

    try {
      const response = await fetch(`/api/groups/${groupId}/members?page=${page}&limit=10`)
      if (!response.ok) {
        throw new Error('멤버 목록을 불러오는데 실패했습니다.')
      }
      const result = await response.json()
      setMembers(result.data)
      setMemberTotal(result.total)
      setMemberTotalPages(result.totalPages)
    } catch (err) {
      console.error('멤버 로드 오류:', err)
    }
  }

  useEffect(() => {
    if (groupId) {
      loadGroup()
    }
  }, [groupId])

  useEffect(() => {
    if (activeTab === 'members' && groupId) {
      loadMembers(memberPage)
    }
  }, [activeTab, memberPage, groupId])

  // 그룹 수정
  const handleUpdate = async () => {
    if (!groupId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('그룹 수정에 실패했습니다.')
      }

      const result = await response.json()
      alert(result.message || '그룹 정보가 수정되었습니다.')
      setIsEditing(false)
      loadGroup()
    } catch (err) {
      alert(err instanceof Error ? err.message : '수정 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 그룹 삭제
  const handleDelete = async () => {
    if (!groupId) return

    const confirmed = confirm('정말 이 그룹을 삭제하시겠습니까?')
    if (!confirmed) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('그룹 삭제에 실패했습니다.')
      }

      const result = await response.json()
      alert(result.message || '그룹이 삭제되었습니다.')
      router.push('/admin/users/groups')
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 멤버 제거
  const handleRemoveMember = async (memberIdx: number, memberName: string) => {
    if (!groupId) return

    const confirmed = confirm(`${memberName}님을 이 그룹에서 제거하시겠습니까?`)
    if (!confirmed) return

    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberIdx }),
      })

      if (!response.ok) {
        throw new Error('멤버 제거에 실패했습니다.')
      }

      alert('멤버가 그룹에서 제거되었습니다.')
      loadMembers(memberPage)
      loadGroup() // 멤버 수 갱신
    } catch (err) {
      alert(err instanceof Error ? err.message : '멤버 제거 중 오류가 발생했습니다.')
    }
  }

  if (isLoading && !group) {
    return (
      <div className={styles.usersPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className={styles.usersPage}>
        <div className={styles.errorMessage}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error || '그룹을 찾을 수 없습니다.'}</span>
        </div>
        <Link href="/admin/users/groups" className={styles.addButton} style={{ marginTop: '20px', display: 'inline-block' }}>
          목록으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.usersPage}>
      <div className={styles.header}>
        <div>
          <Link href="/admin/users/groups" style={{ color: 'var(--gray-600)', textDecoration: 'none', marginBottom: '8px', display: 'inline-block' }}>
            ← 그룹 목록으로
          </Link>
          <h1 className={styles.title}>{group.name}</h1>
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
                  loadGroup()
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

      {/* 탭 메뉴 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid var(--gray-200)' }}>
        <button
          onClick={() => setActiveTab('info')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'info' ? '3px solid var(--primary-500)' : '3px solid transparent',
            color: activeTab === 'info' ? 'var(--primary-600)' : 'var(--gray-600)',
            fontWeight: activeTab === 'info' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          그룹 정보
        </button>
        <button
          onClick={() => setActiveTab('members')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'members' ? '3px solid var(--primary-500)' : '3px solid transparent',
            color: activeTab === 'members' ? 'var(--primary-600)' : 'var(--gray-600)',
            fontWeight: activeTab === 'members' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          멤버 목록 ({group.memberCount}명)
        </button>
      </div>

      {/* 그룹 정보 탭 */}
      {activeTab === 'info' && (
        <div className={styles.tableContainer} style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                그룹명
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
                  {group.name}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                    {group.phone || '-'}
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
                    {group.email || '-'}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                우편번호
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.zipcode}
                  onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
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
                  {group.zipcode || '-'}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                주소
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    marginBottom: '8px',
                  }}
                />
              ) : (
                <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', marginBottom: '8px' }}>
                  {group.address || '-'}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                상세 주소
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.addressDetail}
                  onChange={(e) => setFormData({ ...formData, addressDetail: e.target.value })}
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
                  {group.addressDetail || '-'}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                  그룹 타입
                </label>
                {isEditing ? (
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--gray-300)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '14px',
                    }}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                    <option value="G">G</option>
                    <option value="H">H</option>
                  </select>
                ) : (
                  <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                    {group.type}
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
                    <span className={`${styles.status} ${styles[group.status]}`}>
                      <span className={styles.statusDot}></span>
                      {group.status}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                  생성일
                </label>
                <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                  {group.createdAt}
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--gray-700)' }}>
                담당 관리자
              </label>
              <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                {group.adminName} ({group.adminEmail})
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 멤버 목록 탭 */}
      {activeTab === 'members' && (
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
                <th>가입일</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {members.length > 0 ? (
                members.map((member, index) => (
                  <tr key={member.id}>
                    <td className={styles.numberCell}>
                      <span className={styles.sequenceNumber}>
                        {((memberPage - 1) * 10 + index + 1).toLocaleString()}
                      </span>
                    </td>
                    <td className={styles.idCell}>
                      <code>{member.memberId}</code>
                    </td>
                    <td className={styles.nameCell}>
                      <strong>{member.name}</strong>
                    </td>
                    <td className={styles.emailCell}>
                      <a href={`mailto:${member.email}`} className={styles.emailLink}>
                        {member.email}
                      </a>
                    </td>
                    <td className={styles.phoneCell}>{member.phone}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[member.role] || styles.일반}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className={styles.dateCell}>{member.joinDate}</td>
                    <td className={styles.actionsCell}>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleRemoveMember(member.id, member.name)}
                        title="그룹에서 제거"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
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
                    <h3>멤버가 없습니다</h3>
                    <p>이 그룹에는 아직 멤버가 없습니다.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* 멤버 목록 페이지네이션 */}
          {memberTotalPages > 1 && (
            <div className={styles.paginationContainer}>
              <div className={styles.paginationInfo}>
                <span>
                  전체 <strong>{memberTotal.toLocaleString()}</strong>개 중{' '}
                  <strong>
                    {((memberPage - 1) * 10 + 1).toLocaleString()}-
                    {Math.min(memberPage * 10, memberTotal).toLocaleString()}
                  </strong>
                  개 표시
                </span>
              </div>
              <div className={styles.pagination}>
                <button
                  className={styles.paginationButton}
                  onClick={() => setMemberPage(1)}
                  disabled={memberPage === 1}
                >
                  처음
                </button>
                <button
                  className={styles.paginationButton}
                  onClick={() => setMemberPage(memberPage - 1)}
                  disabled={memberPage === 1}
                >
                  이전
                </button>
                {Array.from({ length: memberTotalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (memberTotalPages <= 7) return true
                    if (page === 1 || page === memberTotalPages) return true
                    if (Math.abs(page - memberPage) <= 2) return true
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
                          memberPage === page ? styles.active : ''
                        }`}
                        onClick={() => setMemberPage(page)}
                      >
                        {page}
                      </button>
                    )
                  })}
                <button
                  className={styles.paginationButton}
                  onClick={() => setMemberPage(memberPage + 1)}
                  disabled={memberPage === memberTotalPages}
                >
                  다음
                </button>
                <button
                  className={styles.paginationButton}
                  onClick={() => setMemberPage(memberTotalPages)}
                  disabled={memberPage === memberTotalPages}
                >
                  마지막
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

