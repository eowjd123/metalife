'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import styles from '../../board.module.css'

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

export default function BoardDetailPage() {
  const router = useRouter()
  const params = useParams()
  const gubun = params.gubun as string
  const id = params.id as string

  const [board, setBoard] = useState<Board | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(id === 'new')
  const [formData, setFormData] = useState({
    title: '',
    contents: '',
    boardGubun: gubun === 'notice' ? 'NO' : gubun === 'faq' ? 'FR' : 'BO',
    image1: '',
    image2: '',
    depth: 1,
    sort: 1,
  })

  const gubunName = {
    notice: '공지사항',
    faq: 'FAQ',
    general: '일반게시판',
  }[gubun] || '게시판'

  const gubunPath = `/admin/board/${gubun}`

  useEffect(() => {
    if (id !== 'new') {
      loadBoard()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadBoard = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/board/${id}`)
      if (!response.ok) {
        throw new Error('게시글을 불러오는데 실패했습니다.')
      }
      const data = await response.json()
      setBoard(data)
      setFormData({
        title: data.title,
        contents: data.contents,
        boardGubun: data.gubun,
        image1: data.image1 || '',
        image2: data.image2 || '',
        depth: data.depth,
        sort: data.sort,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      console.error('게시글 로드 오류:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }

    setIsLoading(true)
    try {
      const url = id === 'new' ? '/api/board' : `/api/board/${id}`
      const method = id === 'new' ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || '저장에 실패했습니다.')
      }

      const result = await response.json()
      alert(result.message || '저장되었습니다.')
      router.push(gubunPath)
    } catch (err) {
      alert(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/board/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('삭제에 실패했습니다.')
      }

      alert('게시글이 삭제되었습니다.')
      router.push(gubunPath)
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !board && id !== 'new') {
    return (
      <div className={styles.boardPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error && id !== 'new') {
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

  return (
    <div className={styles.boardPage}>
      <div className={styles.header}>
        <div>
          <Link href={gubunPath} style={{ color: 'var(--gray-600)', textDecoration: 'none', marginBottom: '8px', display: 'inline-block' }}>
            ← {gubunName} 목록으로
          </Link>
          <h1 className={styles.title}>
            {id === 'new' ? `${gubunName} 작성` : isEditing ? `${gubunName} 수정` : board?.title || '게시글 상세'}
          </h1>
        </div>
        <div className={styles.detailActions}>
          {isEditing ? (
            <>
              <button
                className={`${styles.detailButton} ${styles.detailButtonPrimary}`}
                onClick={handleSubmit}
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
                  if (id === 'new') {
                    router.push(gubunPath)
                  } else {
                    setIsEditing(false)
                    loadBoard()
                  }
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

      {isEditing ? (
        <div className={styles.detailForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>제목 *</label>
            <input
              type="text"
              className={styles.formInput}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="제목을 입력하세요"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>내용</label>
            <textarea
              className={styles.formTextarea}
              value={formData.contents}
              onChange={(e) => setFormData({ ...formData, contents: e.target.value })}
              placeholder="내용을 입력하세요"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>이미지 URL 1</label>
              <input
                type="text"
                className={styles.formInput}
                value={formData.image1}
                onChange={(e) => setFormData({ ...formData, image1: e.target.value })}
                placeholder="이미지 URL을 입력하세요"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>이미지 URL 2</label>
              <input
                type="text"
                className={styles.formInput}
                value={formData.image2}
                onChange={(e) => setFormData({ ...formData, image2: e.target.value })}
                placeholder="이미지 URL을 입력하세요"
              />
            </div>
          </div>
        </div>
      ) : board ? (
        <div className={styles.detailForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>제목</label>
            <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', fontSize: '16px', fontWeight: 600 }}>
              {board.title}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>내용</label>
            <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', minHeight: '200px', whiteSpace: 'pre-wrap' }}>
              {board.contents || '(내용 없음)'}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>작성자</label>
              <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                {board.memberName || board.memberId || '-'}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>등록일</label>
              <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                {board.registeredDate}
              </div>
            </div>
          </div>

          {board.image1 && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>이미지 1</label>
              <img src={board.image1} alt="이미지 1" style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)' }} />
            </div>
          )}

          {board.image2 && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>이미지 2</label>
              <img src={board.image2} alt="이미지 2" style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)' }} />
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

