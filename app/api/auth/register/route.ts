import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      memberId,
      name,
      nicname,
      email,
      password,
      phone,
      memberGubun = 'N', // 기본값: 일반
      groupIdx = 1,
    } = body

    // 필수 필드 검증
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '이메일, 비밀번호, 이름은 필수 입력 항목입니다.' },
        { status: 400 }
      )
    }

    // 이메일 중복 체크
    const existingMember = await prisma.tB_MEMBER.findFirst({
      where: {
        member_email: email,
        member_del_YN: 'N',
      },
    })

    if (existingMember) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 400 }
      )
    }

    // member_id 중복 체크 (member_id가 제공된 경우)
    if (memberId) {
      const existingMemberId = await prisma.tB_MEMBER.findFirst({
        where: {
          member_id: memberId,
          member_del_YN: 'N',
        },
      })

      if (existingMemberId) {
        return NextResponse.json(
          { error: '이미 사용 중인 회원 ID입니다.' },
          { status: 400 }
        )
      }
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10)

    // 클라이언트 IP 가져오기
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') ||
                     null

    // 회원 생성
    const newMember = await prisma.tB_MEMBER.create({
      data: {
        member_id: memberId || null,
        member_name: name,
        member_nicname: nicname || name,
        member_email: email,
        member_password: hashedPassword,
        member_phone: phone || null,
        member_gubun: memberGubun,
        member_join_gubun: 'W', // 웹 가입
        member_reg_ip: clientIp,
        member_used_YN: 'Y', // 활성 상태
        member_del_YN: 'N',
        member_grade: 1,
        member_login_cnt: 0,
        group_idx: groupIdx,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: '회원가입이 완료되었습니다.',
        data: {
          id: newMember.member_idx,
          email: newMember.member_email,
          name: newMember.member_name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('회원가입 오류:', error)
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

