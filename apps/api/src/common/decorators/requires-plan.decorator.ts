import { SetMetadata } from '@nestjs/common';
import { Plan } from '../../modules/subscriptions/plan.enum';

export const REQUIRES_PLAN_KEY = 'requiresPlan';

/**
 * Declare the minimum subscription plan required for a route.
 * @example @RequiresPlan(Plan.PROFESSIONAL)
 */
export const RequiresPlan = (minPlan: Plan) =>
  SetMetadata(REQUIRES_PLAN_KEY, minPlan);
