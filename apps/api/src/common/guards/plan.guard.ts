import {
  CanActivate, ExecutionContext, Injectable, ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { REQUIRES_PLAN_KEY } from '../decorators/requires-plan.decorator';
import { Plan, PLAN_RANK } from '../../modules/subscriptions/plan.enum';

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const minPlan = this.reflector.getAllAndOverride<Plan>(REQUIRES_PLAN_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!minPlan) return true;  // no restriction

    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new ForbiddenException('Authentication required');

    // Resolve the salon linked to this user
    const salon = await this.prisma.salon.findFirst({
      where: { ownerId: user.sub },
      select: { plan: true },
    });

    const salonPlan = (salon?.plan as Plan) || Plan.FREE;
    const hasAccess = PLAN_RANK[salonPlan] >= PLAN_RANK[minPlan];

    if (!hasAccess) {
      throw new ForbiddenException(
        `این قابلیت نیاز به پلن ${minPlan} یا بالاتر دارد. پلن فعلی شما: ${salonPlan}`,
      );
    }

    return true;
  }
}
