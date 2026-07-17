import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Plan, PLAN_LIMITS } from '../subscriptions/plan.enum';

const BOOST_FLOOR_IRR = 5_000_000;   // minimum Boost payout
const BOOST_CAP_IRR  = 50_000_000;   // maximum Boost payout

@Injectable()
export class BoostService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate platform commission for a given booking revenue amount.
   * Commission rate depends on the salon's subscription plan.
   */
  calcCommission(
    grossRevenueIRR: number,
    plan: Plan,
  ): { commissionIRR: number; netToSalonIRR: number; rate: number } {
    const rate = PLAN_LIMITS[plan].boostCommissionPct / 100;
    const raw = Math.round(grossRevenueIRR * rate);
    const commissionIRR = Math.min(Math.max(raw, BOOST_FLOOR_IRR), BOOST_CAP_IRR);
    return {
      commissionIRR,
      netToSalonIRR: grossRevenueIRR - commissionIRR,
      rate: PLAN_LIMITS[plan].boostCommissionPct,
    };
  }

  /** Record a Boost attribution event (booking came from a boosted placement) */
  async recordAttribution(dto: {
    salonId: string;
    bookingId: string;
    grossRevenueIRR: number;
  }) {
    const salon = await this.prisma.salon.findUnique({
      where: { id: dto.salonId },
      select: { plan: true },
    });
    if (!salon) throw new NotFoundException('Salon not found');

    const plan = (salon.plan as Plan) || Plan.FREE;
    const { commissionIRR, netToSalonIRR, rate } = this.calcCommission(
      dto.grossRevenueIRR,
      plan,
    );

    return this.prisma.boostAttribution.create({
      data: {
        salonId: dto.salonId,
        bookingId: dto.bookingId,
        grossRevenueIRR: dto.grossRevenueIRR,
        commissionIRR,
        netToSalonIRR,
        commissionRatePct: rate,
        plan,
      },
    });
  }

  /** Dashboard stats for a salon's Boost performance */
  async getSalonBoostStats(salonId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const rows = await this.prisma.boostAttribution.findMany({
      where: { salonId, createdAt: { gte: since } },
      select: {
        grossRevenueIRR: true,
        commissionIRR: true,
        netToSalonIRR: true,
        createdAt: true,
      },
    });

    const totalGross      = rows.reduce((s, r) => s + r.grossRevenueIRR, 0);
    const totalCommission = rows.reduce((s, r) => s + r.commissionIRR, 0);
    const totalNet        = rows.reduce((s, r) => s + r.netToSalonIRR, 0);

    return {
      period: `${days} روز اخیر`,
      bookingCount: rows.length,
      totalGrossIRR: totalGross,
      totalCommissionIRR: totalCommission,
      totalNetIRR: totalNet,
    };
  }
}
