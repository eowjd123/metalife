'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '../login/login.module.css'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    adminId: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    adminGubun: 'N', // 기본값: 일반 관리자
  })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 유효성 검사
    if (!formData.adminId || !formData.email || !formData.password || !formData.name) {
      setError('아이디, 이메일, 비밀번호, 이름은 필수 입력 항목입니다.')
      return
    }

    // 아이디 형식 검증 (영문, 숫자, 언더스코어, 하이픈만 허용, 3-20자)
    const idRegex = /^[a-zA-Z0-9_-]{3,20}$/
    if (!idRegex.test(formData.adminId)) {
      setError('아이디는 영문, 숫자, 언더스코어(_), 하이픈(-)만 사용 가능하며 3-20자여야 합니다.')
      return
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('올바른 이메일 형식을 입력해주세요.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: formData.adminId || undefined,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          adminGubun: formData.adminGubun,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '회원가입에 실패했습니다.')
      }

      alert('관리자 회원가입이 완료되었습니다. 로그인해주세요.')
      router.push('/admin/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다.')
    } finally {
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
          <p className={styles.subtitle}>관리자 회원가입</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="adminId">관리자 ID *</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" fill="currentColor" fillOpacity="0.3"/>
                <path d="M10 11.6667C6.32499 11.6667 0 13.6167 0 17.5V20H20V17.5C20 13.6167 13.675 11.6667 10 11.6667Z" fill="currentColor" fillOpacity="0.3"/>
              </svg>
              <input
                id="adminId"
                type="text"
                value={formData.adminId}
                onChange={(e) => handleChange('adminId', e.target.value)}
                placeholder="관리자 ID를 입력하세요 (3-20자)"
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_-]+"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="name">이름 *</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" fill="currentColor" fillOpacity="0.3"/>
                <path d="M10 11.6667C6.32499 11.6667 0 13.6167 0 17.5V20H20V17.5C20 13.6167 13.675 11.6667 10 11.6667Z" fill="currentColor" fillOpacity="0.3"/>
              </svg>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="이름을 입력하세요"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">이메일 *</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2.5 6.66667L10 11.6667L17.5 6.66667M3.33333 15H16.6667C17.5871 15 18.3333 14.2538 18.3333 13.3333V6.66667C18.3333 5.74619 17.5871 5 16.6667 5H3.33333C2.41286 5 1.66667 5.74619 1.66667 6.66667V13.3333C1.66667 14.2538 2.41286 15 3.33333 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="이메일을 입력하세요"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="phone">전화번호 (선택)</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M17.5 14.1667V16.6667C17.5 17.5871 16.7538 18.3333 15.8333 18.3333C7.63667 18.3333 1.66667 12.3633 1.66667 4.16667C1.66667 3.24619 2.41286 2.5 3.33333 2.5H5.83333C6.75381 2.5 7.5 3.24619 7.5 4.16667V6.10833C7.5 6.69167 7.21667 7.225 6.775 7.525L5.275 8.64167C4.56667 9.08333 4.56667 10.0833 5.275 10.525L6.775 11.6417C7.21667 11.9417 7.5 12.475 7.5 13.0583V15C7.5 15.9205 8.24619 16.6667 9.16667 16.6667H11.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="전화번호를 입력하세요"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="adminGubun">관리자 구분</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" fill="currentColor" fillOpacity="0.3"/>
                <path d="M10 11.6667C6.32499 11.6667 0 13.6167 0 17.5V20H20V17.5C20 13.6167 13.675 11.6667 10 11.6667Z" fill="currentColor" fillOpacity="0.3"/>
              </svg>
              <select
                id="adminGubun"
                value={formData.adminGubun}
                onChange={(e) => handleChange('adminGubun', e.target.value)}
                disabled={isLoading}
              >
                <option value="N">일반 관리자</option>
                <option value="A">관리자</option>
                <option value="S">슈퍼관리자</option>
                <option value="G">그룹 관리자</option>
              </select>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">비밀번호 *</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15.8333 9.16667H4.16667C3.24619 9.16667 2.5 9.91286 2.5 10.8333V16.6667C2.5 17.5871 3.24619 18.3333 4.16667 18.3333H15.8333C16.7538 18.3333 17.5 17.5871 17.5 16.6667V10.8333C17.5 9.91286 16.7538 9.16667 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.83333 9.16667V5.83333C5.83333 4.72826 6.27232 3.66846 7.05372 2.88706C7.83512 2.10565 8.89493 1.66667 10 1.66667C11.1051 1.66667 12.1649 2.10565 12.9463 2.88706C13.7277 3.66846 14.1667 4.72826 14.1667 5.83333V9.16667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="비밀번호를 입력하세요 (최소 6자)"
                required
                minLength={6}
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

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">비밀번호 확인 *</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15.8333 9.16667H4.16667C3.24619 9.16667 2.5 9.91286 2.5 10.8333V16.6667C2.5 17.5871 3.24619 18.3333 4.16667 18.3333H15.8333C16.7538 18.3333 17.5 17.5871 17.5 16.6667V10.8333C17.5 9.91286 16.7538 9.16667 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.83333 9.16667V5.83333C5.83333 4.72826 6.27232 3.66846 7.05372 2.88706C7.83512 2.10565 8.89493 1.66667 10 1.66667C11.1051 1.66667 12.1649 2.10565 12.9463 2.88706C13.7277 3.66846 14.1667 4.72826 14.1667 5.83333V9.16667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
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
                <span>가입 중...</span>
              </>
            ) : (
              '관리자 회원가입'
            )}
          </button>
        </form>

        <div className={styles.registerLink}>
          <span>이미 계정이 있으신가요?</span>
          <Link href="/admin/login">로그인</Link>
        </div>
      </div>
    </div>
  )
}
