import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Plan, PLAN_LIMITS } from './plan.enum';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentPlan(salonId: string) {
    const salon = await this.prisma.salon.findUnique({
      where: { id: salonId },
      select: { plan: true, planExpiresAt: true, planStartedAt: true },
    });
    if (!salon) throw new NotFoundException('Salon not found');

    const plan = (salon.plan as Plan) || Plan.FREE;
    return {
      plan,
      limits: PLAN_LIMITS[plan],
      expiresAt: salon.planExpiresAt,
      startedAt: salon.planStartedAt,
      isActive: salon.planExpiresAt ? salon.planExpiresAt > new Date() : true,
    };
  }

  async upgradePlan(salonId: string, newPlan: Plan, months = 1) {
    const validPlans = Object.values(Plan);
    if (!validPlans.includes(newPlan)) {
      throw new BadRequestException(`Invalid plan: ${newPlan}`);
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + months);

    const salon = await this.prisma.salon.update({
      where: { id: salonId },
      data: {
        plan: newPlan,
        planStartedAt: now,
        planExpiresAt: expiresAt,
      },
      select: { id: true, name: true, plan: true, planExpiresAt: true },
    });

    return { ...salon, limits: PLAN_LIMITS[newPlan] };
  }

  async checkLimit(
    salonId: string,
    resource: 'staff' | 'services',
  ): Promise<{ allowed: boolean; current: number; max: number; plan: Plan }> {
    const salon = await this.prisma.salon.findUnique({
      where: { id: salonId },
      select: {
        plan: true,
        _count: { select: { staffProfiles: true, services: true } },
      },
    });
    if (!salon) throw new NotFoundException('Salon not found');

    const plan = (salon.plan as Plan) || Plan.FREE;
    const limits = PLAN_LIMITS[plan];
    const current = resource === 'staff' ? salon._count.staffProfiles : salon._count.services;
    const max = resource === 'staff' ? limits.maxStaff : limits.maxServices;

    return { allowed: current < max, current, max, plan };
  }

  getPlansOverview() {
    return Object.entries(PLAN_LIMITS).map(([plan, limits]) => ({
      plan,
      ...limits,
    }));
  }
}
