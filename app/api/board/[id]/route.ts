import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TB_BOARD_board_gubun } from '@prisma/client'

// 게시글 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const boardId = parseInt(params.id, 10)

    if (isNaN(boardId)) {
      return NextResponse.json(
        { error: '유효하지 않은 게시글 ID입니다.' },
        { status: 400 }
      )
    }

    const board = await prisma.tB_BOARD.findFirst({
      where: {
        board_idx: boardId,
        board_del_YN: 'N',
      },
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
    })

    if (!board) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 회원 정보 조회
    let member = null
    if (board.member_idx) {
      member = await prisma.tB_MEMBER.findUnique({
        where: {
          member_idx: board.member_idx,
        },
        select: {
          member_idx: true,
          member_id: true,
          member_name: true,
          member_email: true,
        },
      })
    }

    const gubunName = {
      NO: '공지사항',
      FR: 'FAQ',
      BO: '일반게시판',
    }[board.board_gubun] || board.board_gubun

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('게시글 상세 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 게시글 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const boardId = parseInt(params.id, 10)

    if (isNaN(boardId)) {
      return NextResponse.json(
        { error: '유효하지 않은 게시글 ID입니다.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      title,
      contents,
      boardGubun,
      image1,
      image2,
      depth,
      sort,
    } = body

    const updateData: any = {}

    if (title !== undefined) updateData.board_title = title
    if (contents !== undefined) updateData.board_contents = contents
    if (boardGubun !== undefined) updateData.board_gubun = boardGubun as TB_BOARD_board_gubun
    if (image1 !== undefined) updateData.board_image_1 = image1
    if (image2 !== undefined) updateData.board_image_2 = image2
    if (depth !== undefined) updateData.board_depth = depth
    if (sort !== undefined) updateData.board_sort = sort

    const updatedBoard = await prisma.tB_BOARD.update({
      where: {
        board_idx: boardId,
      },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: '게시글이 수정되었습니다.',
      data: { id: updatedBoard.board_idx },
    })
  } catch (error) {
    console.error('게시글 수정 오류:', error)
    return NextResponse.json(
      { error: '게시글 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 게시글 삭제 (Soft Delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const boardId = parseInt(params.id, 10)

    if (isNaN(boardId)) {
      return NextResponse.json(
        { error: '유효하지 않은 게시글 ID입니다.' },
        { status: 400 }
      )
    }

    await prisma.tB_BOARD.update({
      where: {
        board_idx: boardId,
      },
      data: {
        board_del_YN: 'Y',
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

