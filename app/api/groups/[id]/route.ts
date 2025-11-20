import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 그룹 상세 조회
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

    // 그룹 정보 조회
    const group = await prisma.tB_GROUP.findUnique({
      where: {
        group_idx: groupId,
      },
      select: {
        group_idx: true,
        group_name: true,
        group_phone: true,
        group_email: true,
        group_zipcode: true,
        group_address: true,
        group_address_detail: true,
        group_type: true,
        group_reg_date: true,
        group_del_YN: true,
        admin_idx: true,
      },
    })

    if (!group) {
      return NextResponse.json(
        { error: '그룹을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 멤버 수 계산
    const memberCount = await prisma.tB_MEMBER.count({
      where: {
        group_idx: groupId,
        member_del_YN: 'N',
      },
    })

    // 담당 관리자 정보 조회
    const admin = await prisma.tB_ADMIN.findUnique({
      where: {
        admin_idx: group.admin_idx,
      },
      select: {
        admin_name: true,
        admin_email: true,
      },
    })

    // 주소 정보 조합
    const address = [group.group_address, group.group_address_detail]
      .filter(Boolean)
      .join(' ') || '-'

    return NextResponse.json({
      id: group.group_idx,
      name: group.group_name,
      phone: group.group_phone || '',
      email: group.group_email || '',
      zipcode: group.group_zipcode || '',
      address: group.group_address || '',
      addressDetail: group.group_address_detail || '',
      fullAddress: address,
      type: group.group_type,
      memberCount: memberCount,
      createdAt: group.group_reg_date.toISOString().split('T')[0],
      status: group.group_del_YN === 'N' ? '활성' : '비활성',
      adminIdx: group.admin_idx,
      adminName: admin?.admin_name || '알 수 없음',
      adminEmail: admin?.admin_email || '-',
    })
  } catch (error) {
    console.error('그룹 상세 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 그룹 수정
export async function PATCH(
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

    const body = await request.json()
    const {
      name,
      phone,
      email,
      zipcode,
      address,
      addressDetail,
      type,
      status,
      adminIdx,
    } = body

    // 업데이트할 데이터 구성
    const updateData: any = {}

    if (name !== undefined) updateData.group_name = name
    if (phone !== undefined) updateData.group_phone = phone || null
    if (email !== undefined) updateData.group_email = email || null
    if (zipcode !== undefined) updateData.group_zipcode = zipcode || null
    if (address !== undefined) updateData.group_address = address || null
    if (addressDetail !== undefined) updateData.group_address_detail = addressDetail || null
    if (type !== undefined) updateData.group_type = type
    if (status !== undefined) {
      updateData.group_del_YN = status === '활성' ? 'N' : 'Y'
    }
    if (adminIdx !== undefined) updateData.admin_idx = adminIdx

    // 그룹 업데이트
    const updatedGroup = await prisma.tB_GROUP.update({
      where: {
        group_idx: groupId,
      },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: '그룹 정보가 수정되었습니다.',
      data: {
        id: updatedGroup.group_idx,
        name: updatedGroup.group_name,
        status: updatedGroup.group_del_YN === 'N' ? '활성' : '비활성',
      },
    })
  } catch (error) {
    console.error('그룹 수정 오류:', error)
    return NextResponse.json(
      { error: '그룹 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 그룹 삭제 (soft delete)
export async function DELETE(
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

    // 그룹이 존재하는지 확인
    const group = await prisma.tB_GROUP.findUnique({
      where: {
        group_idx: groupId,
      },
    })

    if (!group) {
      return NextResponse.json(
        { error: '그룹을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 그룹에 속한 멤버 수 확인
    const memberCount = await prisma.tB_MEMBER.count({
      where: {
        group_idx: groupId,
        member_del_YN: 'N',
      },
    })

    // Soft delete: group_del_YN을 'Y'로 변경
    await prisma.tB_GROUP.update({
      where: {
        group_idx: groupId,
      },
      data: {
        group_del_YN: 'Y',
      },
    })

    return NextResponse.json({
      success: true,
      message: '그룹이 삭제되었습니다.',
      memberCount: memberCount,
    })
  } catch (error) {
    console.error('그룹 삭제 오류:', error)
    return NextResponse.json(
      { error: '그룹 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

