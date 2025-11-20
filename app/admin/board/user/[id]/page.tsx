'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import styles from '../../board.module.css'

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

export default function BoardUserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [boardUser, setBoardUser] = useState<BoardUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBoardUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadBoardUser = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/board-user/${id}`)
      if (!response.ok) {
        throw new Error('문의를 불러오는데 실패했습니다.')
      }
      const data = await response.json()
      setBoardUser(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      console.error('문의 로드 오류:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReplyToggle = async () => {
    if (!boardUser) return

    const newReplyYN = boardUser.replyYN === 'Y' ? 'N' : 'Y'
    setIsLoading(true)
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
      loadBoardUser()
    } catch (err) {
      alert(err instanceof Error ? err.message : '답변 상태 변경 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/board-user/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('삭제에 실패했습니다.')
      }

      alert('문의가 삭제되었습니다.')
      router.push('/admin/board/user')
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !boardUser) {
    return (
      <div className={styles.boardPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.boardPage}>
        <div className={styles.errorMessage}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error}</span>
        </div>
      </div>
    )
  }

  if (!boardUser) return null

  return (
    <div className={styles.boardPage}>
      <div className={styles.header}>
        <div>
          <Link href="/admin/board/user" style={{ color: 'var(--gray-600)', textDecoration: 'none', marginBottom: '8px', display: 'inline-block' }}>
            ← 사용자 문의 목록으로
          </Link>
          <h1 className={styles.title}>사용자 문의 상세</h1>
        </div>
        <div className={styles.detailActions}>
          <button
            className={`${styles.detailButton} ${
              boardUser.replyYN === 'Y' ? styles.detailButtonSecondary : styles.detailButtonPrimary
            }`}
            onClick={handleReplyToggle}
            disabled={isLoading}
          >
            <svg className={styles.detailButtonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              {boardUser.replyYN === 'Y' ? (
                <path d="M20 6L9 17l-5-5"></path>
              ) : (
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              )}
            </svg>
            {boardUser.replyYN === 'Y' ? '답변 취소' : '답변 완료'}
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
        </div>
      </div>

      <div className={styles.detailForm}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>제목</label>
          <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', fontSize: '16px', fontWeight: 600 }}>
            {boardUser.title}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>내용</label>
          <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', minHeight: '200px', whiteSpace: 'pre-wrap' }}>
            {boardUser.contents || '(내용 없음)'}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>작성자</label>
            <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
              {boardUser.name || boardUser.memberName || '-'}
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>이메일</label>
            <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
              {boardUser.email || boardUser.memberEmail || '-'}
            </div>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>답변 상태</label>
            <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
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
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>등록일</label>
            <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
              {boardUser.registeredDate}
            </div>
          </div>
        </div>

        {boardUser.companyWorkplaceCode && (
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>회사/직장 코드</label>
            <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
              {boardUser.companyWorkplaceCode}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

