import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 사용자 게시글 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const boardUserId = parseInt(params.id, 10)

    if (isNaN(boardUserId)) {
      return NextResponse.json(
        { error: '유효하지 않은 게시글 ID입니다.' },
        { status: 400 }
      )
    }

    const boardUser = await prisma.tB_BOARD_USER.findFirst({
      where: {
        board_user_idx: boardUserId,
        board_user_del_YN: 'N',
      },
    })

    if (!boardUser) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 회원 정보 조회
    let member = null
    if (boardUser.member_idx) {
      member = await prisma.tB_MEMBER.findUnique({
        where: {
          member_idx: boardUser.member_idx,
        },
        select: {
          member_idx: true,
          member_id: true,
          member_name: true,
          member_email: true,
        },
      })
    }

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('사용자 게시글 상세 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 답변 상태 업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const boardUserId = parseInt(params.id, 10)

    if (isNaN(boardUserId)) {
      return NextResponse.json(
        { error: '유효하지 않은 게시글 ID입니다.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { replyYN } = body

    if (replyYN !== 'Y' && replyYN !== 'N') {
      return NextResponse.json(
        { error: '유효하지 않은 답변 상태입니다.' },
        { status: 400 }
      )
    }

    await prisma.tB_BOARD_USER.update({
      where: {
        board_user_idx: boardUserId,
      },
      data: {
        board_user_reply_YN: replyYN,
      },
    })

    return NextResponse.json({
      success: true,
      message: '답변 상태가 업데이트되었습니다.',
    })
  } catch (error) {
    console.error('답변 상태 업데이트 오류:', error)
    return NextResponse.json(
      { error: '답변 상태 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 사용자 게시글 삭제 (Soft Delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const boardUserId = parseInt(params.id, 10)

    if (isNaN(boardUserId)) {
      return NextResponse.json(
        { error: '유효하지 않은 게시글 ID입니다.' },
        { status: 400 }
      )
    }

    await prisma.tB_BOARD_USER.update({
      where: {
        board_user_idx: boardUserId,
      },
      data: {
        board_user_del_YN: 'Y',
      },
    })

    return NextResponse.json({
      success: true,
      message: '게시글이 삭제되었습니다.',
    })
  } catch (error) {
    console.error('게시글 삭제 오류:', error)
    return NextResponse.json(
      { error: '게시글 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

