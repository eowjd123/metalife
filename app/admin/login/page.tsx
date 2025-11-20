'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './login.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          password,
          userType: 'admin', // 관리자 로그인
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '로그인에 실패했습니다.')
      }

      // 로그인 성공 시 세션 저장
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userInfo', JSON.stringify(result.data))
      router.push('/admin/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.backgroundPattern}></div>
      <div className={styles.loginBox}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <span className={styles.logoText}>metalife</span>
          </div>
          <p className={styles.subtitle}>관리자 시스템에 오신 것을 환영합니다</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="id">아이디</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" fill="currentColor" fillOpacity="0.3"/>
                <path d="M10 11.6667C6.32499 11.6667 0 13.6167 0 17.5V20H20V17.5C20 13.6167 13.675 11.6667 10 11.6667Z" fill="currentColor" fillOpacity="0.3"/>
              </svg>
              <input
                id="id"
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="아이디를 입력하세요"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">비밀번호</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15.8333 9.16667H4.16667C3.24619 9.16667 2.5 9.91286 2.5 10.8333V16.6667C2.5 17.5871 3.24619 18.3333 4.16667 18.3333H15.8333C16.7538 18.3333 17.5 17.5871 17.5 16.6667V10.8333C17.5 9.91286 16.7538 9.16667 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.83333 9.16667V5.83333C5.83333 4.72826 6.27232 3.66846 7.05372 2.88706C7.83512 2.10565 8.89493 1.66667 10 1.66667C11.1051 1.66667 12.1649 2.10565 12.9463 2.88706C13.7277 3.66846 14.1667 4.72826 14.1667 5.83333V9.16667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 3.33333C5.83333 3.33333 2.27499 6.07499 0.833328 10C2.27499 13.925 5.83333 16.6667 10 16.6667C14.1667 16.6667 17.725 13.925 19.1667 10C17.725 6.07499 14.1667 3.33333 10 3.33333ZM10 14.1667C7.69999 14.1667 5.83333 12.3 5.83333 10C5.83333 7.7 7.69999 5.83333 10 5.83333C12.3 5.83333 14.1667 7.7 14.1667 10C14.1667 12.3 12.3 14.1667 10 14.1667ZM10 7.5C8.61916 7.5 7.5 8.61916 7.5 10C7.5 11.3808 8.61916 12.5 10 12.5C11.3808 12.5 12.5 11.3808 12.5 10C12.5 8.61916 11.3808 7.5 10 7.5Z" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M2.5 2.5L17.5 17.5M8.33333 8.33333C7.89131 8.77535 7.5 9.44167 7.5 10.2083C7.5 11.5892 8.61916 12.7083 10 12.7083C10.7667 12.7083 11.433 12.3167 11.875 11.875M14.1667 14.1667C13.0833 14.8083 11.6 15.2083 10 15.2083C5.83333 15.2083 2.27499 12.4667 0.833328 8.54167C1.66666 6.66667 3.03333 5.13333 4.66666 4.13333L14.1667 14.1667ZM7.5 3.33333C8.58333 2.69167 9.26666 2.5 10 2.5C14.1667 2.5 17.725 5.24167 19.1667 9.16667C18.75 10.25 18.125 11.25 17.3333 12.0833L7.5 3.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.error}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 6.66667V10M10 13.3333H10.0083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            className={`${styles.submitButton} ${isLoading ? styles.loading : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className={styles.spinner}></div>
                <span>로그인 중...</span>
              </>
            ) : (
              '로그인'
            )}
          </button>
        </form>

        <div className={styles.registerLink}>
          <span>계정이 없으신가요?</span>
          <Link href="/admin/register">회원가입</Link>
        </div>
      </div>
    </div>
  )
}

