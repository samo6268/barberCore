CREATE TYPE "StaffCompensationType" AS ENUM (
  'PERCENTAGE',
  'FIXED_PER_SERVICE',
  'SALARY',
  'SALARY_PLUS_PERCENTAGE'
);

CREATE TYPE "SettlementStatus" AS ENUM ('DRAFT', 'APPROVED', 'PAID', 'CANCELLED');
CREATE TYPE "SettlementAdjustmentType" AS ENUM ('BONUS', 'DEDUCTION');

ALTER TABLE "staff_profiles"
  ADD COLUMN "compensationType" "StaffCompensationType" NOT NULL DEFAULT 'PERCENTAGE',
  ADD COLUMN "fixedServiceAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "monthlySalary" DOUBLE PRECISION NOT NULL DEFAULT 0;

ALTER TABLE "staff_services"
  ADD COLUMN "commissionRate" DOUBLE PRECISION,
  ADD COLUMN "fixedAmount" DOUBLE PRECISION;

CREATE TABLE "staff_settlements" (
  "id" TEXT NOT NULL,
  "salonId" TEXT NOT NULL,
  "staffId" TEXT NOT NULL,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "status" "SettlementStatus" NOT NULL DEFAULT 'DRAFT',
  "grossRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "serviceCommission" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "baseSalaryAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "bonusAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "deductionAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "netPayable" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "notes" TEXT,
  "paymentMethod" TEXT,
  "paymentReference" TEXT,
  "createdBy" TEXT NOT NULL,
  "approvedAt" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "staff_settlements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "staff_settlement_items" (
  "id" TEXT NOT NULL,
  "settlementId" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "bookingItemId" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "serviceName" TEXT NOT NULL,
  "completedAt" TIMESTAMP(3) NOT NULL,
  "grossAmount" DOUBLE PRECISION NOT NULL,
  "commissionAmount" DOUBLE PRECISION NOT NULL,
  "compensationType" "StaffCompensationType" NOT NULL,
  "appliedRate" DOUBLE PRECISION,
  "appliedFixedAmount" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "staff_settlement_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "settlement_adjustments" (
  "id" TEXT NOT NULL,
  "settlementId" TEXT NOT NULL,
  "type" "SettlementAdjustmentType" NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "settlement_adjustments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "settlement_events" (
  "id" TEXT NOT NULL,
  "settlementId" TEXT NOT NULL,
  "fromStatus" "SettlementStatus",
  "toStatus" "SettlementStatus" NOT NULL,
  "actorId" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "settlement_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "staff_settlements_salonId_periodStart_periodEnd_idx"
  ON "staff_settlements"("salonId", "periodStart", "periodEnd");
CREATE INDEX "staff_settlements_staffId_status_idx"
  ON "staff_settlements"("staffId", "status");
CREATE UNIQUE INDEX "staff_settlement_items_bookingItemId_key"
  ON "staff_settlement_items"("bookingItemId");
CREATE INDEX "staff_settlement_items_settlementId_idx"
  ON "staff_settlement_items"("settlementId");
CREATE INDEX "staff_settlement_items_bookingId_idx"
  ON "staff_settlement_items"("bookingId");
CREATE INDEX "settlement_adjustments_settlementId_idx"
  ON "settlement_adjustments"("settlementId");
CREATE INDEX "settlement_events_settlementId_createdAt_idx"
  ON "settlement_events"("settlementId", "createdAt");

ALTER TABLE "staff_settlements"
  ADD CONSTRAINT "staff_settlements_salonId_fkey"
  FOREIGN KEY ("salonId") REFERENCES "salons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "staff_settlements"
  ADD CONSTRAINT "staff_settlements_staffId_fkey"
  FOREIGN KEY ("staffId") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "staff_settlement_items"
  ADD CONSTRAINT "staff_settlement_items_settlementId_fkey"
  FOREIGN KEY ("settlementId") REFERENCES "staff_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "staff_settlement_items"
  ADD CONSTRAINT "staff_settlement_items_bookingItemId_fkey"
  FOREIGN KEY ("bookingItemId") REFERENCES "booking_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "settlement_adjustments"
  ADD CONSTRAINT "settlement_adjustments_settlementId_fkey"
  FOREIGN KEY ("settlementId") REFERENCES "staff_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "settlement_events"
  ADD CONSTRAINT "settlement_events_settlementId_fkey"
  FOREIGN KEY ("settlementId") REFERENCES "staff_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
