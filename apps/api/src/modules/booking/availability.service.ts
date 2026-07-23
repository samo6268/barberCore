import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface TimeSlot {
  time: string;    // HH:mm
  available: boolean;
  staffId?: string;
}

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  async getAvailableSlots(
    salonId: string,
    date: string,          // YYYY-MM-DD
    serviceId: string,
    staffId?: string,
  ): Promise<TimeSlot[]> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
    const dayDate = new Date(`${date}T00:00:00Z`);
    if (Number.isNaN(dayDate.getTime()) || dayDate.toISOString().slice(0, 10) !== date) return [];
    const service = await this.prisma.service.findFirst({ where: { id: serviceId, salonId, isActive: true } });
    if (!service) return [];
    const dayOfWeek = this.getDayOfWeek(dayDate);

    // Get working hours
    const wh = await this.prisma.workingHour.findFirst({
      where: { salonId, staffId: staffId ?? null, dayOfWeek: dayOfWeek as import("@prisma/client").DayOfWeek, isOpen: true },
    });
    if (!wh) return [];

    // Get existing bookings for this day
    const dayStart = new Date(`${date}T00:00:00Z`);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const existingBookings = await this.prisma.booking.findMany({
      where: {
        salonId,
        staffId: staffId || undefined,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
        startsAt: { gte: dayStart, lt: dayEnd },
      },
    });

    // Get holidays
    const holiday = await this.prisma.salonHoliday.findFirst({
      where: { salonId, date: dayStart },
    });
    if (holiday) return [];

    // Generate slots every 30 min within working hours
    const slots: TimeSlot[] = [];
    const [openH, openM] = wh.openTime.split(':').map(Number);
    const [closeH, closeM] = wh.closeTime.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    const duration = service.durationMinutes;

    for (let m = openMinutes; m + duration <= closeMinutes; m += 30) {
      const slotStart = new Date(`${date}T${this.minutesToTime(m)}:00Z`);
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);

      // Check break time
      if (wh.breakStart && wh.breakEnd) {
        const [bsH, bsM] = wh.breakStart.split(':').map(Number);
        const [beH, beM] = wh.breakEnd.split(':').map(Number);
        const breakStart = bsH * 60 + bsM;
        const breakEnd = beH * 60 + beM;
        if (m < breakEnd && m + duration > breakStart) continue;
      }

      // Check conflicts
      const conflict = existingBookings.some(b => {
        const bStart = new Date(b.startsAt).getTime();
        const bEnd = new Date(b.endsAt).getTime();
        return slotStart.getTime() < bEnd && slotEnd.getTime() > bStart;
      });

      // Don't show past slots for today
      const now = new Date();
      const isPast = slotStart <= now;

      slots.push({
        time: this.minutesToTime(m),
        available: !conflict && !isPast,
        staffId,
      });
    }

    return slots;
  }

  private getDayOfWeek(date: Date): string {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[date.getUTCDay()];
  }

  private minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }
}
