import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const name = searchParams.get('name')
    const email = searchParams.get('email')
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    
    // 페이징 파라미터
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const skip = (page - 1) * limit
    
    // 정렬 파라미터 (기본: admin_idx 내림차순 - 최신 가입 순)
    const sortBy = searchParams.get('sortBy') || 'admin_idx'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 기본 쿼리 조건: 삭제되지 않은 관리자만 조회
    const where: any = {
      admin_del_YN: 'N',
    }

    // 검색 조건 추가
    if (name) {
      where.admin_name = {
        contains: name,
      }
    }

    if (email) {
      where.admin_email = {
        contains: email,
      }
    }

    // admin_gubun을 역할로 매핑하여 필터링
    if (role) {
      const roleToGubun: Record<string, string> = {
        '슈퍼관리자': 'S',
        '관리자': 'A',
        '일반': 'N',
        '그룹': 'G',
      }
      const gubun = roleToGubun[role]
      if (gubun) {
        where.admin_gubun = gubun
      }
    }

    // 상태 필터링 (admin_del_YN이 'N'이면 활성, 'Y'면 비활성)
    // 하지만 admin_del_YN은 이미 기본 조건에 포함되어 있으므로
    // 여기서는 admin_login_date를 기준으로 판단하거나 다른 필드를 사용해야 함
    // 일단은 admin_del_YN이 'N'이면 모두 활성으로 간주

    // 총 개수 조회
    const total = await prisma.tB_ADMIN.count({
      where,
    })

    // 전체 통계 조회 (검색 조건과 무관하게 전체 데이터 기준)
    const totalStats = {
      total: await prisma.tB_ADMIN.count({
        where: { admin_del_YN: 'N' },
      }),
      active: await prisma.tB_ADMIN.count({
        where: { admin_del_YN: 'N' },
      }),
      inactive: await prisma.tB_ADMIN.count({
        where: { admin_del_YN: 'Y' },
      }),
    }

    // 관리자 데이터 조회 (페이징 적용)
    const admins = await prisma.tB_ADMIN.findMany({
      where,
      select: {
        admin_idx: true,
        admin_id: true,
        admin_name: true,
        admin_email: true,
        admin_phone: true,
        admin_gubun: true,
        admin_reg_date: true,
        admin_login_date: true,
        admin_del_YN: true,
      },
      orderBy: [
        {
          [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc',
        },
        {
          admin_idx: 'desc', // admin_idx가 같을 경우를 대비한 보조 정렬
        },
      ],
      skip,
      take: limit,
    })

    // 데이터 변환 (프론트엔드 형식에 맞게)
    const result = admins.map((admin) => {
      // admin_gubun을 역할로 변환
      const roleMap: Record<string, string> = {
        S: '슈퍼관리자',
        A: '관리자',
        N: '일반',
        G: '그룹',
      }

      // admin_del_YN을 상태로 변환
      const status = admin.admin_del_YN === 'N' ? '활성' : '비활성'

      // 권한은 admin_gubun에 따라 결정
      const permissions = admin.admin_gubun === 'S' ? '전체' : '제한'

      return {
        id: admin.admin_idx,
        adminId: admin.admin_id || '',
        name: admin.admin_name,
        email: admin.admin_email,
        phone: admin.admin_phone || '',
        role: roleMap[admin.admin_gubun] || '일반',
        roleCode: admin.admin_gubun,
        status: status,
        joinDate: admin.admin_reg_date.toISOString().split('T')[0],
        lastLogin: admin.admin_login_date
          ? admin.admin_login_date.toISOString().split('T')[0] + ' ' + 
            admin.admin_login_date.toISOString().split('T')[1].substring(0, 5)
          : '-',
        permissions: permissions,
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
    console.error('관리자 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

