import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 관리자 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminId = parseInt(params.id, 10)

    if (isNaN(adminId)) {
      return NextResponse.json(
        { error: '유효하지 않은 관리자 ID입니다.' },
        { status: 400 }
      )
    }

    // 관리자 정보 조회
    const admin = await prisma.tB_ADMIN.findUnique({
      where: {
        admin_idx: adminId,
      },
      select: {
        admin_idx: true,
        admin_id: true,
        admin_name: true,
        admin_nicname: true,
        admin_email: true,
        admin_phone: true,
        admin_gubun: true,
        admin_reg_date: true,
        admin_login_date: true,
        admin_del_YN: true,
      },
    })

    if (!admin) {
      return NextResponse.json(
        { error: '관리자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 역할 매핑
    const roleMap: Record<string, string> = {
      S: '슈퍼관리자',
      A: '관리자',
      N: '일반',
      G: '그룹',
    }

    // 권한 결정
    const permissions = admin.admin_gubun === 'S' ? '전체' : '제한'

    return NextResponse.json({
      id: admin.admin_idx,
      adminId: admin.admin_id || '',
      name: admin.admin_name,
      nicname: admin.admin_nicname,
      email: admin.admin_email,
      phone: admin.admin_phone || '',
      role: roleMap[admin.admin_gubun] || '일반',
      roleCode: admin.admin_gubun,
      permissions: permissions,
      joinDate: admin.admin_reg_date.toISOString().split('T')[0],
      lastLogin: admin.admin_login_date
        ? admin.admin_login_date.toISOString().split('T')[0] + ' ' + 
          admin.admin_login_date.toISOString().split('T')[1].substring(0, 5)
        : '-',
      status: admin.admin_del_YN === 'N' ? '활성' : '비활성',
    })
  } catch (error) {
    console.error('관리자 상세 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 관리자 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminId = parseInt(params.id, 10)

    if (isNaN(adminId)) {
      return NextResponse.json(
        { error: '유효하지 않은 관리자 ID입니다.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      name,
      nicname,
      email,
      phone,
      role,
      status,
      password,
    } = body

    // 업데이트할 데이터 구성
    const updateData: any = {}

    if (name !== undefined) updateData.admin_name = name
    if (nicname !== undefined) updateData.admin_nicname = nicname
    if (email !== undefined) updateData.admin_email = email
    if (phone !== undefined) updateData.admin_phone = phone || null
    if (role !== undefined) {
      const roleToGubun: Record<string, string> = {
        '슈퍼관리자': 'S',
        '관리자': 'A',
        '일반': 'N',
        '그룹': 'G',
      }
      updateData.admin_gubun = roleToGubun[role] || 'N'
    }
    if (status !== undefined) {
      updateData.admin_del_YN = status === '활성' ? 'N' : 'Y'
    }
    if (password !== undefined && password) {
      // 비밀번호 해시화는 실제 환경에서 bcrypt 등을 사용해야 함
      updateData.admin_password = password
    }

    // 관리자 업데이트
    const updatedAdmin = await prisma.tB_ADMIN.update({
      where: {
        admin_idx: adminId,
      },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: '관리자 정보가 수정되었습니다.',
      data: {
        id: updatedAdmin.admin_idx,
        name: updatedAdmin.admin_name,
        status: updatedAdmin.admin_del_YN === 'N' ? '활성' : '비활성',
      },
    })
  } catch (error) {
    console.error('관리자 수정 오류:', error)
    return NextResponse.json(
      { error: '관리자 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 관리자 삭제 (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminId = parseInt(params.id, 10)

    if (isNaN(adminId)) {
      return NextResponse.json(
        { error: '유효하지 않은 관리자 ID입니다.' },
        { status: 400 }
      )
    }

    // 관리자가 존재하는지 확인
    const admin = await prisma.tB_ADMIN.findUnique({
      where: {
        admin_idx: adminId,
      },
    })

    if (!admin) {
      return NextResponse.json(
        { error: '관리자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // Soft delete: admin_del_YN을 'Y'로 변경
    await prisma.tB_ADMIN.update({
      where: {
        admin_idx: adminId,
      },
      data: {
        admin_del_YN: 'Y',
      },
    })

    return NextResponse.json({
      success: true,
      message: '관리자가 삭제되었습니다.',
    })
  } catch (error) {
    console.error('관리자 삭제 오류:', error)
    return NextResponse.json(
      { error: '관리자 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

