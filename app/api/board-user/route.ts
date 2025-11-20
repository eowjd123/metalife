import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const name = searchParams.get('name')
    const email = searchParams.get('email')
    const title = searchParams.get('title')
    const replyYN = searchParams.get('replyYN') // 'Y', 'N', null
    const memberIdx = searchParams.get('memberIdx')

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const skip = (page - 1) * limit

    const sortBy = searchParams.get('sortBy') || 'board_user_reg_date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: any = {
      board_user_del_YN: 'N',
    }

    if (name) {
      where.board_user_name = {
        contains: name,
      }
    }

    if (email) {
      where.board_user_email = {
        contains: email,
      }
    }

    if (title) {
      where.board_user_title = {
        contains: title,
      }
    }

    if (replyYN) {
      where.board_user_reply_YN = replyYN
    }

    if (memberIdx) {
      where.member_idx = parseInt(memberIdx, 10)
    }

    const total = await prisma.tB_BOARD_USER.count({ where })

    // 전체 통계
    const totalStats = {
      total: await prisma.tB_BOARD_USER.count({
        where: { board_user_del_YN: 'N' },
      }),
      replied: await prisma.tB_BOARD_USER.count({
        where: {
          board_user_del_YN: 'N',
          board_user_reply_YN: 'Y',
        },
      }),
      pending: await prisma.tB_BOARD_USER.count({
        where: {
          board_user_del_YN: 'N',
          board_user_reply_YN: 'N',
        },
      }),
    }

    // 사용자 게시판 목록 조회
    const boardUsers = await prisma.tB_BOARD_USER.findMany({
      where,
      select: {
        board_user_idx: true,
        board_user_name: true,
        board_user_email: true,
        board_user_title: true,
        board_user_contents: true,
        board_user_reply_YN: true,
        board_user_reg_date: true,
        member_idx: true,
        company_workplace_code: true,
      },
      orderBy: [
        {
          [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc',
        },
        {
          board_user_idx: 'desc',
        },
      ],
      skip,
      take: limit,
    })

    // 회원 정보 조회
    const memberIdxList = boardUsers
      .map(b => b.member_idx)
      .filter((idx): idx is number => idx !== null && idx > 0)

    let members: any[] = []
    if (memberIdxList.length > 0) {
      members = await prisma.tB_MEMBER.findMany({
        where: {
          member_idx: { in: memberIdxList },
        },
        select: {
          member_idx: true,
          member_id: true,
          member_name: true,
          member_email: true,
        },
      })
    }

    const memberMap = new Map(members.map(m => [m.member_idx, m]))

    // 데이터 변환
    const result = boardUsers.map((boardUser) => {
      const member = boardUser.member_idx ? memberMap.get(boardUser.member_idx) : null

      return {
        id: boardUser.board_user_idx,
        name: boardUser.board_user_name || '',
        email: boardUser.board_user_email || '',
        title: boardUser.board_user_title || '',
        contents: boardUser.board_user_contents || '',
        replyYN: boardUser.board_user_reply_YN,
        replyStatus: boardUser.board_user_reply_YN === 'Y' ? '답변완료' : '답변대기',
        registeredDate: boardUser.board_user_reg_date.toISOString().replace('T', ' ').substring(0, 19),
        memberIdx: boardUser.member_idx,
        memberId: member?.member_id || null,
        memberName: member?.member_name || null,
        memberEmail: member?.member_email || null,
        companyWorkplaceCode: boardUser.company_workplace_code,
      }
    })

    return NextResponse.json({
      data: result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: totalStats,
    })
  } catch (error) {
    console.error('사용자 게시판 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

