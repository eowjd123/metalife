import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      adminId,
      name,
      nicname,
      email,
      password,
      phone,
      adminGubun = 'N', // 기본값: 일반 관리자
    } = body

    // 필수 필드 검증
    if (!adminId || !email || !password || !name) {
      return NextResponse.json(
        { error: '아이디, 이메일, 비밀번호, 이름은 필수 입력 항목입니다.' },
        { status: 400 }
      )
    }

    // 아이디 형식 검증 (영문, 숫자, 언더스코어, 하이픈만 허용, 3-20자)
    const idRegex = /^[a-zA-Z0-9_-]{3,20}$/
    if (!idRegex.test(adminId)) {
      return NextResponse.json(
        { error: '아이디는 영문, 숫자, 언더스코어(_), 하이픈(-)만 사용 가능하며 3-20자여야 합니다.' },
        { status: 400 }
      )
    }

    // 이메일 중복 체크
    const existingAdmin = await prisma.tB_ADMIN.findFirst({
      where: {
        admin_email: email,
        admin_del_YN: 'N',
      },
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 400 }
      )
    }

    // admin_id 중복 체크 (필수)
    const existingAdminId = await prisma.tB_ADMIN.findFirst({
      where: {
        admin_id: adminId,
        admin_del_YN: 'N',
      },
    })

    if (existingAdminId) {
      return NextResponse.json(
        { error: '이미 사용 중인 관리자 ID입니다.' },
        { status: 400 }
      )
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10)

    // 클라이언트 IP 가져오기
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') ||
                     null

    // admin_gubun 유효성 검사
    const validGubun = ['S', 'A', 'N', 'G']
    if (!validGubun.includes(adminGubun)) {
      return NextResponse.json(
        { error: '유효하지 않은 관리자 구분입니다.' },
        { status: 400 }
      )
    }

    // 관리자 생성
    const newAdmin = await prisma.tB_ADMIN.create({
      data: {
        admin_id: adminId, // 필수
        admin_name: name,
        admin_nicname: nicname || name,
        admin_email: email,
        admin_password: hashedPassword,
        admin_phone: phone || null,
        admin_gubun: adminGubun as 'S' | 'A' | 'N' | 'G',
        admin_reg_ip: clientIp,
        admin_del_YN: 'N',
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: '관리자 회원가입이 완료되었습니다.',
        data: {
          id: newAdmin.admin_idx,
          email: newAdmin.admin_email,
          name: newAdmin.admin_name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('관리자 회원가입 오류:', error)
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

