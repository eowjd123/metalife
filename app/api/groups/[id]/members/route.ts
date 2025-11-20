import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 그룹 멤버 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = parseInt(params.id, 10)

    if (isNaN(groupId)) {
      return NextResponse.json(
        { error: '유효하지 않은 그룹 ID입니다.' },
        { status: 400 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const skip = (page - 1) * limit

    // 그룹 멤버 조회
    const members = await prisma.tB_MEMBER.findMany({
      where: {
        group_idx: groupId,
        member_del_YN: 'N',
      },
      select: {
        member_idx: true,
        member_id: true,
        member_name: true,
        member_email: true,
        member_phone: true,
        member_gubun: true,
        member_reg_date: true,
        member_login_date: true,
        member_login_cnt: true,
      },
      orderBy: {
        member_reg_date: 'desc',
      },
      skip,
      take: limit,
    })

    // 총 멤버 수
    const total = await prisma.tB_MEMBER.count({
      where: {
        group_idx: groupId,
        member_del_YN: 'N',
      },
    })

    // 데이터 변환
    const roleMap: Record<string, string> = {
      S: '학생',
      T: '교사',
      N: '일반',
      I: '기관',
    }

    const result = members.map((member) => ({
      id: member.member_idx,
      memberId: member.member_id || '',
      name: member.member_name,
      email: member.member_email,
      phone: member.member_phone || '-',
      role: roleMap[member.member_gubun] || '일반',
      joinDate: member.member_reg_date.toISOString().split('T')[0],
      loginDate: member.member_login_date
        ? member.member_login_date.toISOString().split('T')[0]
        : '-',
      loginCount: member.member_login_cnt,
    }))

    return NextResponse.json({
      data: result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('그룹 멤버 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 그룹에서 멤버 제거
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = parseInt(params.id, 10)
    const body = await request.json()
    const { memberIdx } = body

    if (isNaN(groupId) || !memberIdx) {
      return NextResponse.json(
        { error: '유효하지 않은 요청입니다.' },
        { status: 400 }
      )
    }

    // 멤버의 group_idx를 기본값(1)으로 변경
    await prisma.tB_MEMBER.update({
      where: {
        member_idx: memberIdx,
      },
      data: {
        group_idx: 1, // 기본 그룹으로 이동
      },
    })

    return NextResponse.json({
      success: true,
      message: '멤버가 그룹에서 제거되었습니다.',
    })
  } catch (error) {
    console.error('멤버 제거 오류:', error)
    return NextResponse.json(
      { error: '멤버 제거 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

