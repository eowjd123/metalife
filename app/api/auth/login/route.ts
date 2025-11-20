import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, password, userType = 'admin' } = body // 기본값: 'admin' (관리자)

    if (!id || !password) {
      return NextResponse.json(
        { error: '아이디와 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 클라이언트 IP 가져오기
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') ||
                     null

    if (userType === 'admin') {
      // 관리자 로그인
      const admin = await prisma.tB_ADMIN.findFirst({
        where: {
          admin_id: id,
          admin_del_YN: 'N',
        },
      })

      if (!admin) {
        return NextResponse.json(
          { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
          { status: 401 }
        )
      }

      // 비밀번호 검증
      let isPasswordValid = false
      if (admin.admin_password) {
        // 해싱된 비밀번호인지 확인 (bcrypt 해시는 항상 $2a$ 또는 $2b$로 시작)
        if (admin.admin_password.startsWith('$2a$') || admin.admin_password.startsWith('$2b$')) {
          isPasswordValid = await bcrypt.compare(password, admin.admin_password)
        } else {
          // 해싱되지 않은 비밀번호인 경우 (기존 데이터 호환성)
          isPasswordValid = admin.admin_password === password
        }
      }

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
          { status: 401 }
        )
      }

      // 로그인 날짜 업데이트
      await prisma.tB_ADMIN.update({
        where: {
          admin_idx: admin.admin_idx,
        },
        data: {
          admin_login_date: new Date(),
        },
      })

      // 관리자 로그인 로그 기록
      await prisma.tB_ADMIN_LOGIN_LOG.create({
        data: {
          admin_idx: admin.admin_idx,
          admin_login_domain: 'ADMIN_PANEL',
          admin_login_reg_ip: clientIp,
        },
      })

      return NextResponse.json({
        success: true,
        message: '로그인 성공',
        data: {
          id: admin.admin_idx,
          userId: admin.admin_id,
          email: admin.admin_email,
          name: admin.admin_name,
          role: admin.admin_gubun,
          userType: 'admin',
        },
      })
    } else {
      // 회원 로그인
      const member = await prisma.tB_MEMBER.findFirst({
        where: {
          member_id: id,
          member_del_YN: 'N',
        },
      })

      if (!member) {
        return NextResponse.json(
          { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
          { status: 401 }
        )
      }

      // 비밀번호 검증
      let isPasswordValid = false
      if (member.member_password) {
        // 해싱된 비밀번호인지 확인 (bcrypt 해시는 항상 $2a$ 또는 $2b$로 시작)
        if (member.member_password.startsWith('$2a$') || member.member_password.startsWith('$2b$')) {
          isPasswordValid = await bcrypt.compare(password, member.member_password)
        } else {
          // 해싱되지 않은 비밀번호인 경우 (기존 데이터 호환성)
          isPasswordValid = member.member_password === password
        }
      }

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
          { status: 401 }
        )
      }

      // 로그인 날짜 및 횟수 업데이트
      await prisma.tB_MEMBER.update({
        where: {
          member_idx: member.member_idx,
        },
        data: {
          member_login_date: new Date(),
          member_login_cnt: (member.member_login_cnt || 0) + 1,
        },
      })

      // 회원 로그인 로그 기록
      await prisma.tB_MEMBER_LOGIN_LOG.create({
        data: {
          member_idx: member.member_idx,
          member_login_domain: 'ADMIN_PANEL',
          member_login_reg_ip: clientIp,
        },
      })

      return NextResponse.json({
        success: true,
        message: '로그인 성공',
        data: {
          id: member.member_idx,
          userId: member.member_id,
          email: member.member_email,
          name: member.member_name,
          role: member.member_gubun,
          userType: 'member',
        },
      })
    }
  } catch (error) {
    console.error('로그인 오류:', error)
    return NextResponse.json(
      { error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

