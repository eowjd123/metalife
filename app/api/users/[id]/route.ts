import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 회원 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memberId = parseInt(params.id, 10)

    if (isNaN(memberId)) {
      return NextResponse.json(
        { error: '유효하지 않은 회원 ID입니다.' },
        { status: 400 }
      )
    }

    // 회원 정보 조회
    const member = await prisma.tB_MEMBER.findUnique({
      where: {
        member_idx: memberId,
      },
      select: {
        member_idx: true,
        member_id: true,
        member_name: true,
        member_email: true,
        member_phone: true,
        member_gubun: true,
        member_used_YN: true,
        member_reg_date: true,
        member_login_date: true,
        member_login_cnt: true,
        member_grade: true,
        group_idx: true,
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: '회원을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 역할 매핑
    const roleMap: Record<string, string> = {
      S: '학생',
      T: '교사',
      N: '일반',
      I: '기관',
    }

    // 그룹 정보 조회
    const group = member.group_idx
      ? await prisma.tB_GROUP.findUnique({
          where: {
            group_idx: member.group_idx,
          },
          select: {
            group_name: true,
          },
        })
      : null

    return NextResponse.json({
      id: member.member_idx,
      memberId: member.member_id || '',
      name: member.member_name,
      email: member.member_email,
      phone: member.member_phone || '',
      role: roleMap[member.member_gubun] || '일반',
      roleCode: member.member_gubun,
      status: member.member_used_YN === 'Y' ? '활성' : '비활성',
      joinDate: member.member_reg_date.toISOString().split('T')[0],
      loginDate: member.member_login_date
        ? member.member_login_date.toISOString().split('T')[0]
        : null,
      loginCount: member.member_login_cnt,
      grade: member.member_grade,
      groupIdx: member.group_idx,
      groupName: group?.group_name || '-',
    })
  } catch (error) {
    console.error('회원 상세 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 회원 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memberId = parseInt(params.id, 10)

    if (isNaN(memberId)) {
      return NextResponse.json(
        { error: '유효하지 않은 회원 ID입니다.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      name,
      email,
      phone,
      role,
      status,
      grade,
      groupIdx,
    } = body

    // 업데이트할 데이터 구성
    const updateData: any = {}

    if (name !== undefined) updateData.member_name = name
    if (email !== undefined) updateData.member_email = email
    if (phone !== undefined) updateData.member_phone = phone || null
    if (role !== undefined) {
      const roleToGubun: Record<string, string> = {
        '학생': 'S',
        '교사': 'T',
        '일반': 'N',
        '기관': 'I',
      }
      updateData.member_gubun = roleToGubun[role] || 'N'
    }
    if (status !== undefined) {
      updateData.member_used_YN = status === '활성' ? 'Y' : 'N'
    }
    if (grade !== undefined) updateData.member_grade = grade
    if (groupIdx !== undefined) updateData.group_idx = groupIdx

    // 회원 업데이트
    const updatedMember = await prisma.tB_MEMBER.update({
      where: {
        member_idx: memberId,
      },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: '회원 정보가 수정되었습니다.',
      data: {
        id: updatedMember.member_idx,
        name: updatedMember.member_name,
        status: updatedMember.member_used_YN === 'Y' ? '활성' : '비활성',
      },
    })
  } catch (error) {
    console.error('회원 수정 오류:', error)
    return NextResponse.json(
      { error: '회원 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 회원 삭제 (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memberId = parseInt(params.id, 10)

    if (isNaN(memberId)) {
      return NextResponse.json(
        { error: '유효하지 않은 회원 ID입니다.' },
        { status: 400 }
      )
    }

    // 회원이 존재하는지 확인
    const member = await prisma.tB_MEMBER.findUnique({
      where: {
        member_idx: memberId,
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: '회원을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // Soft delete: member_del_YN을 'Y'로 변경
    await prisma.tB_MEMBER.update({
      where: {
        member_idx: memberId,
      },
      data: {
        member_del_YN: 'Y',
      },
    })

    return NextResponse.json({
      success: true,
      message: '회원이 삭제되었습니다.',
    })
  } catch (error) {
    console.error('회원 삭제 오류:', error)
    return NextResponse.json(
      { error: '회원 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

