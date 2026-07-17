export enum Plan {
  FREE         = 'FREE',
  STARTER      = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE   = 'ENTERPRISE',
}

export const PLAN_RANK: Record<Plan, number> = {
  [Plan.FREE]:         0,
  [Plan.STARTER]:      1,
  [Plan.PROFESSIONAL]: 2,
  [Plan.ENTERPRISE]:   3,
};

export interface PlanLimits {
  maxStaff: number;
  maxServices: number;
  boostCommissionPct: number;  // % taken by platform on Boost revenue
  canFeaturedSlot: boolean;
  canAcademy: boolean;
  analyticsRetentionDays: number;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  [Plan.FREE]: {
    maxStaff: 1,
    maxServices: 5,
    boostCommissionPct: 30,
    canFeaturedSlot: false,
    canAcademy: false,
    analyticsRetentionDays: 7,
  },
  [Plan.STARTER]: {
    maxStaff: 3,
    maxServices: 20,
    boostCommissionPct: 20,
    canFeaturedSlot: true,
    canAcademy: false,
    analyticsRetentionDays: 30,
  },
  [Plan.PROFESSIONAL]: {
    maxStaff: 10,
    maxServices: 100,
    boostCommissionPct: 15,
    canFeaturedSlot: true,
    canAcademy: true,
    analyticsRetentionDays: 90,
  },
  [Plan.ENTERPRISE]: {
    maxStaff: Infinity,
    maxServices: Infinity,
    boostCommissionPct: 10,
    canFeaturedSlot: true,
    canAcademy: true,
    analyticsRetentionDays: 365,
  },
};
