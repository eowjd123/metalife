import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const adminName = searchParams.get('adminName')
    const email = searchParams.get('email')
    const ip = searchParams.get('ip')
    const loginTimeStart = searchParams.get('loginTime_start')
    const loginTimeEnd = searchParams.get('loginTime_end')
    
    // 페이징 파라미터
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const skip = (page - 1) * limit
    
    // 정렬 파라미터 (기본: admin_login_reg_date 내림차순 - 최신 로그인 순)
    const sortBy = searchParams.get('sortBy') || 'admin_login_reg_date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 기본 쿼리 조건
    const where: any = {}

    // 관리자 이름 또는 이메일로 필터링 (관리자 테이블과 조인 필요)
    if (adminName || email) {
      const adminWhere: any = {}
      if (adminName) {
        adminWhere.admin_name = {
          contains: adminName,
        }
      }
      if (email) {
        adminWhere.admin_email = {
          contains: email,
        }
      }
      // 관리자 정보로 필터링된 admin_idx 목록 조회
      const filteredAdmins = await prisma.tB_ADMIN.findMany({
        where: adminWhere,
        select: {
          admin_idx: true,
        },
      })
      const adminIdxList = filteredAdmins.map(a => a.admin_idx)
      if (adminIdxList.length > 0) {
        where.admin_idx = {
          in: adminIdxList,
        }
      } else {
        // 매칭되는 관리자가 없으면 빈 결과 반환
        return NextResponse.json({
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
          stats: {
            total: 0,
            today: 0,
          },
        })
      }
    }

    // IP 주소 필터링
    if (ip) {
      where.admin_login_reg_ip = {
        contains: ip,
      }
    }

    // 로그인 시간 범위 필터링
    if (loginTimeStart || loginTimeEnd) {
      where.admin_login_reg_date = {}
      if (loginTimeStart) {
        where.admin_login_reg_date.gte = new Date(loginTimeStart)
      }
      if (loginTimeEnd) {
        const endDate = new Date(loginTimeEnd)
        endDate.setHours(23, 59, 59, 999)
        where.admin_login_reg_date.lte = endDate
      }
    }

    // 총 개수 조회
    const total = await prisma.tB_ADMIN_LOGIN_LOG.count({
      where,
    })

    // 전체 통계 조회 (검색 조건과 무관하게 전체 데이터 기준)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const totalStats = {
      total: await prisma.tB_ADMIN_LOGIN_LOG.count({}),
      today: await prisma.tB_ADMIN_LOGIN_LOG.count({
        where: {
          admin_login_reg_date: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
    }

    // 접속 이력 데이터 조회 (페이징 적용)
    const loginLogs = await prisma.tB_ADMIN_LOGIN_LOG.findMany({
      where,
      orderBy: [
        {
          [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc',
        },
        {
          admin_login_idx: 'desc',
        },
      ],
      skip,
      take: limit,
    })

    // 관리자 정보 조회 (admin_idx 목록)
    const adminIdxList = loginLogs
      .map(log => log.admin_idx)
      .filter((idx): idx is number => idx !== null)
    
    const admins = await prisma.tB_ADMIN.findMany({
      where: {
        admin_idx: {
          in: adminIdxList,
        },
      },
      select: {
        admin_idx: true,
        admin_name: true,
        admin_email: true,
      },
    })

    // 관리자 정보를 맵으로 변환
    const adminMap = new Map(
      admins.map(admin => [admin.admin_idx, admin])
    )

    // 데이터 변환 (프론트엔드 형식에 맞게)
    const result = loginLogs.map((log) => {
      const admin = log.admin_idx ? adminMap.get(log.admin_idx) : null

      return {
        id: log.admin_login_idx,
        adminIdx: log.admin_idx,
        adminName: admin?.admin_name || '알 수 없음',
        email: admin?.admin_email || '-',
        loginTime: log.admin_login_reg_date.toISOString().replace('T', ' ').substring(0, 19),
        logoutTime: '-', // 로그아웃 시간은 별도 테이블이 없으므로 '-'로 표시
        ip: log.admin_login_reg_ip || '-',
        domain: log.admin_login_domain || '-',
        status: '정상', // 상태는 로그아웃 시간이 없으면 '비정상 종료'로 판단할 수 있지만, 일단 '정상'으로 표시
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
    console.error('관리자 접속 이력 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

