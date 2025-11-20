import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TB_BOARD_board_gubun } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const boardGubun = searchParams.get('boardGubun') as TB_BOARD_board_gubun | null
    const title = searchParams.get('title')
    const memberIdx = searchParams.get('memberIdx')

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const skip = (page - 1) * limit

    const sortBy = searchParams.get('sortBy') || 'board_reg_date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: any = {
      board_del_YN: 'N',
    }

    if (boardGubun) {
      where.board_gubun = boardGubun
    }

    if (title) {
      where.board_title = {
        contains: title,
      }
    }

    if (memberIdx) {
      where.member_idx = parseInt(memberIdx, 10)
    }

    const total = await prisma.tB_BOARD.count({ where })

    // 전체 통계
    const totalStats = {
      total: await prisma.tB_BOARD.count({
        where: { board_del_YN: 'N' },
      }),
      notice: await prisma.tB_BOARD.count({
        where: {
          board_del_YN: 'N',
          board_gubun: 'NO',
        },
      }),
      faq: await prisma.tB_BOARD.count({
        where: {
          board_del_YN: 'N',
          board_gubun: 'FR',
        },
      }),
      general: await prisma.tB_BOARD.count({
        where: {
          board_del_YN: 'N',
          board_gubun: 'BO',
        },
      }),
    }

    // 게시글 목록 조회
    const boards = await prisma.tB_BOARD.findMany({
      where,
      select: {
        board_idx: true,
        board_title: true,
        board_contents: true,
        board_gubun: true,
        board_depth: true,
        board_sort: true,
        board_image_1: true,
        board_image_2: true,
        board_reg_date: true,
        board_reg_ip: true,
        member_idx: true,
      },
      orderBy: [
        {
          [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc',
        },
        {
          board_idx: 'desc',
        },
      ],
      skip,
      take: limit,
    })

    // 회원 정보 조회
    const memberIdxList = boards
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
    const result = boards.map((board) => {
      const member = board.member_idx ? memberMap.get(board.member_idx) : null
      
      // 게시판 구분명
      const gubunName = {
        NO: '공지사항',
        FR: 'FAQ',
        BO: '일반게시판',
      }[board.board_gubun] || board.board_gubun

      return {
        id: board.board_idx,
        title: board.board_title || '',
        contents: board.board_contents || '',
        gubun: board.board_gubun,
        gubunName: gubunName,
        depth: board.board_depth,
        sort: board.board_sort,
        image1: board.board_image_1,
        image2: board.board_image_2,
        registeredDate: board.board_reg_date.toISOString().replace('T', ' ').substring(0, 19),
        registeredIp: board.board_reg_ip,
        memberIdx: board.member_idx,
        memberId: member?.member_id || null,
        memberName: member?.member_name || null,
        memberEmail: member?.member_email || null,
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
    console.error('게시판 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      contents,
      boardGubun = 'BO',
      image1,
      image2,
      memberIdx,
      depth = 1,
      sort = 1,
    } = body

    if (!title) {
      return NextResponse.json(
        { error: '제목을 입력해주세요.' },
        { status: 400 }
      )
    }

    const newBoard = await prisma.tB_BOARD.create({
      data: {
        board_title: title,
        board_contents: contents || null,
        board_gubun: boardGubun as TB_BOARD_board_gubun,
        board_depth: depth,
        board_sort: sort,
        board_image_1: image1 || null,
        board_image_2: image2 || null,
        board_reg_ip: null, // 클라이언트에서 전달받거나 서버에서 설정
        member_idx: memberIdx || null,
        board_del_YN: 'N',
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: '게시글이 작성되었습니다.',
        data: { id: newBoard.board_idx },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('게시글 작성 오류:', error)
    return NextResponse.json(
      { error: '게시글 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

