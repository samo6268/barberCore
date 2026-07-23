-- Align the salon plan, featured placement, and boost attribution services
-- with the persisted data model introduced by the platform modules.

ALTER TABLE "salons"
  ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'FREE',
  ADD COLUMN "planStartedAt" TIMESTAMP(3),
  ADD COLUMN "planExpiresAt" TIMESTAMP(3);

CREATE TABLE "featured_slots" (
  "id" TEXT NOT NULL,
  "salonId" TEXT NOT NULL,
  "zone" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "totalPaidIRR" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "featured_slots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "boost_attributions" (
  "id" TEXT NOT NULL,
  "salonId" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "grossRevenueIRR" DOUBLE PRECISION NOT NULL,
  "commissionIRR" DOUBLE PRECISION NOT NULL,
  "netToSalonIRR" DOUBLE PRECISION NOT NULL,
  "commissionRatePct" DOUBLE PRECISION NOT NULL,
  "plan" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "boost_attributions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "featured_slots_zone_status_endsAt_idx" ON "featured_slots"("zone", "status", "endsAt");
CREATE INDEX "featured_slots_salonId_idx" ON "featured_slots"("salonId");
CREATE UNIQUE INDEX "boost_attributions_bookingId_key" ON "boost_attributions"("bookingId");
CREATE INDEX "boost_attributions_salonId_createdAt_idx" ON "boost_attributions"("salonId", "createdAt");

ALTER TABLE "featured_slots" ADD CONSTRAINT "featured_slots_salonId_fkey"
  FOREIGN KEY ("salonId") REFERENCES "salons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "boost_attributions" ADD CONSTRAINT "boost_attributions_salonId_fkey"
  FOREIGN KEY ("salonId") REFERENCES "salons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "boost_attributions" ADD CONSTRAINT "boost_attributions_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
