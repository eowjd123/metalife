import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TB_LICENSE_CODE_license_type, TB_LICENSE_CODE_license_level, TB_LICENSE_CODE_license_used_YN } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const licenseCode = searchParams.get('licenseCode')
    const licenseName = searchParams.get('licenseName')
    const licenseType = searchParams.get('licenseType')
    const licenseLevel = searchParams.get('licenseLevel')
    const status = searchParams.get('status') // '활성', '만료', '전체'
    const startDateStart = searchParams.get('startDate_start')
    const startDateEnd = searchParams.get('startDate_end')
    const endDateStart = searchParams.get('endDate_start')
    const endDateEnd = searchParams.get('endDate_end')

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const skip = (page - 1) * limit

    const sortBy = searchParams.get('sortBy') || 'license_reg_date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: any = {
      license_del_YN: 'N',
    }

    if (licenseCode) {
      where.license_code = {
        contains: licenseCode,
      }
    }

    if (licenseName) {
      where.license_name = {
        contains: licenseName,
      }
    }

    if (licenseType) {
      where.license_type = licenseType as TB_LICENSE_CODE_license_type
    }

    if (licenseLevel) {
      where.license_level = licenseLevel as TB_LICENSE_CODE_license_level
    }

    // 날짜 필터링 (String 타입이므로 직접 비교)
    // 날짜 필터는 클라이언트 측에서 처리하거나, DB에서 문자열 비교로 처리
    // 여기서는 기본 필터링만 적용하고, 날짜 필터는 클라이언트에서 처리

    // 상태 필터링 (활성/만료)
    const today = new Date().toISOString().split('T')[0]
    if (status === '활성') {
      where.license_used_YN = 'Y'
      where.license_enddate = {
        gte: today,
      }
    } else if (status === '만료') {
      where.OR = [
        { license_used_YN: 'N' },
        { license_enddate: { lt: today } },
      ]
    }

    const total = await prisma.tB_LICENSE_CODE.count({
      where,
    })

    // 전체 통계
    const totalStats = {
      total: await prisma.tB_LICENSE_CODE.count({
        where: { license_del_YN: 'N' },
      }),
      active: await prisma.tB_LICENSE_CODE.count({
        where: {
          license_del_YN: 'N',
          license_used_YN: 'Y',
          license_enddate: {
            gte: today,
          },
        },
      }),
      expired: await prisma.tB_LICENSE_CODE.count({
        where: {
          license_del_YN: 'N',
          OR: [
            { license_used_YN: 'N' },
            { license_enddate: { lt: today } },
          ],
        },
      }),
    }

    // 라이선스 목록 조회
    const licenses = await prisma.tB_LICENSE_CODE.findMany({
      where,
      select: {
        license_idx: true,
        license_code: true,
        license_name: true,
        license_type: true,
        license_level: true,
        license_period: true,
        license_limit: true,
        license_startdate: true,
        license_enddate: true,
        license_used_YN: true,
        license_reg_date: true,
        admin_idx: true,
      },
      orderBy: [
        {
          [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc',
        },
        {
          license_idx: 'desc',
        },
      ],
      skip,
      take: limit,
    })

    // 각 라이선스의 사용자 수 계산 (TB_LICENSE_HST에서)
    const licenseIdxList = licenses.map(l => l.license_idx)
    const licenseHistory = await prisma.tB_LICENSE_HST.groupBy({
      by: ['license_idx'],
      where: {
        license_idx: {
          in: licenseIdxList,
        },
        license_hst_del_YN: 'N',
      },
      _count: {
        license_idx: true,
      },
    })

    const userCountMap = new Map(
      licenseHistory.map(item => [item.license_idx, item._count.license_idx])
    )

    // 날짜 필터링 적용 (클라이언트 측 필터링)
    let filteredLicenses = licenses
    if (startDateStart || startDateEnd) {
      filteredLicenses = filteredLicenses.filter(license => {
        const startDate = license.license_startdate || ''
        if (startDateStart && startDate < startDateStart) return false
        if (startDateEnd && startDate > startDateEnd) return false
        return true
      })
    }
    if (endDateStart || endDateEnd) {
      filteredLicenses = filteredLicenses.filter(license => {
        const endDate = license.license_enddate || ''
        if (endDateStart && endDate < endDateStart) return false
        if (endDateEnd && endDate > endDateEnd) return false
        return true
      })
    }

    // 데이터 변환
    const result = filteredLicenses.map((license) => {
      const endDate = license.license_enddate || ''
      const todayStr = new Date().toISOString().split('T')[0]
      const isExpired = endDate < todayStr || license.license_used_YN === 'N'
      const status = isExpired ? '만료' : '활성'

      // 타입 매핑
      const typeMap: Record<string, string> = {
        school: '스쿨',
        metaware: '메타웨어',
        storybuilder: '스토리빌더',
      }

      // 레벨 매핑
      const levelMap: Record<string, string> = {
        home: '홈',
        class: '클래스',
        storybuilder: '스토리빌더',
        tutor: '튜터',
      }

      return {
        id: license.license_idx,
        licenseCode: license.license_code || '-',
        licenseName: license.license_name,
        type: typeMap[license.license_type] || license.license_type,
        level: levelMap[license.license_level] || license.license_level,
        period: license.license_period,
        limit: license.license_limit,
        startDate: license.license_startdate || '-',
        endDate: endDate || '-',
        status: status,
        usedYN: license.license_used_YN,
        currentUsers: userCountMap.get(license.license_idx) || 0,
        maxUsers: license.license_limit,
        createdAt: license.license_reg_date.toISOString().split('T')[0],
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
    console.error('라이선스 목록 조회 오류:', error)
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
      licenseCode,
      licenseName,
      licenseType = TB_LICENSE_CODE_license_type.school,
      licenseLevel = TB_LICENSE_CODE_license_level.home,
      period = 1,
      limit = 1,
      startDate,
      endDate,
      usedYN = TB_LICENSE_CODE_license_used_YN.Y,
    } = body

    if (!licenseName) {
      return NextResponse.json(
        { error: '라이선스명을 입력해주세요.' },
        { status: 400 }
      )
    }

    const generatedCode = licenseCode || `LIC-${Date.now()}`

    const newLicense = await prisma.tB_LICENSE_CODE.create({
      data: {
        license_code: generatedCode,
        license_name: licenseName,
        license_type: licenseType,
        license_level: licenseLevel,
        license_period: period,
        license_limit: limit,
        license_startdate: startDate || null,
        license_enddate: endDate || null,
        license_used_YN: usedYN,
        license_del_YN: 'N',
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: '새 라이선스가 발급되었습니다.',
        data: {
          id: newLicense.license_idx,
          licenseCode: newLicense.license_code,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('라이선스 생성 오류:', error)
    return NextResponse.json(
      { error: '라이선스 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

