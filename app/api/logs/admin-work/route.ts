import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const adminIdx = searchParams.get('adminIdx')
    const workAdmin = searchParams.get('workAdmin')
    const dateStart = searchParams.get('dateStart')
    const dateEnd = searchParams.get('dateEnd')

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const skip = (page - 1) * limit

    const sortBy = searchParams.get('sortBy') || 'work_reg_date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: any = {}

    if (adminIdx) {
      where.admin_idx = parseInt(adminIdx, 10)
    }

    if (workAdmin) {
      where.work_admin = {
        contains: workAdmin,
      }
    }

    // 날짜 필터링
    if (dateStart || dateEnd) {
      const dateFilter: any = {}
      if (dateStart) {
        const start = new Date(dateStart)
        start.setHours(0, 0, 0, 0)
        dateFilter.gte = start
      }
      if (dateEnd) {
        const end = new Date(dateEnd)
        end.setHours(23, 59, 59, 999)
        dateFilter.lte = end
      }
      if (Object.keys(dateFilter).length > 0) {
        where.work_reg_date = dateFilter
      }
    }

    const total = await prisma.tB_ADMIN_WORK_LOG.count({ where })

    // 통계
    const totalStats = {
      total: await prisma.tB_ADMIN_WORK_LOG.count(),
    }

    // 관리자 작업 로그 조회
    const logs = await prisma.tB_ADMIN_WORK_LOG.findMany({
      where,
      select: {
        work_idx: true,
        admin_idx: true,
        work_admin: true,
        work_reg_ip: true,
        work_reg_date: true,
      },
      orderBy: [
        {
          [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc',
        },
        {
          work_idx: 'desc',
        },
      ],
      skip,
      take: limit,
    })

    // 관리자 정보 조회
    const adminIdxList = logs
      .map(l => l.admin_idx)
      .filter((idx): idx is number => idx !== null && idx > 0)

    let admins: any[] = []
    if (adminIdxList.length > 0) {
      admins = await prisma.tB_ADMIN.findMany({
        where: {
          admin_idx: { in: adminIdxList },
        },
        select: {
          admin_idx: true,
          admin_id: true,
          admin_name: true,
          admin_email: true,
        },
      })
    }

    const adminMap = new Map(admins.map(a => [a.admin_idx, a]))

    // 데이터 변환
    const result = logs.map((log) => {
      const admin = log.admin_idx ? adminMap.get(log.admin_idx) : null

      return {
        id: log.work_idx,
        adminIdx: log.admin_idx,
        adminId: admin?.admin_id || null,
        adminName: admin?.admin_name || null,
        adminEmail: admin?.admin_email || null,
        workAdmin: log.work_admin || '-',
        registeredIp: log.work_reg_ip || '-',
        registeredDate: log.work_reg_date.toISOString().replace('T', ' ').substring(0, 19),
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
    console.error('관리자 작업 로그 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

