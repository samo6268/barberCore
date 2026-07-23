import { Injectable } from '@nestjs/common';
import { DayOfWeek } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface TimeSlot {
  time: string;
  available: boolean;
  staffId?: string;
}

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  async getAvailableSlots(
    salonId: string,
    date: string,
    serviceIds: string[],
    staffId?: string,
  ): Promise<TimeSlot[]> {
    const uniqueServiceIds = [...new Set(serviceIds)];
    if (!uniqueServiceIds.length || uniqueServiceIds.length !== serviceIds.length) return [];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];

    const dayDate = new Date(`${date}T00:00:00Z`);
    if (Number.isNaN(dayDate.getTime()) || dayDate.toISOString().slice(0, 10) !== date) return [];

    const services = await this.prisma.service.findMany({
      where: { id: { in: uniqueServiceIds }, salonId, isActive: true, isOnlineBookable: true },
      select: { id: true, durationMinutes: true },
    });
    if (services.length !== uniqueServiceIds.length) return [];

    const holiday = await this.prisma.salonHoliday.findFirst({
      where: { salonId, date: dayDate },
    });
    if (holiday) return [];

    const duration = services.reduce((total, item) => total + item.durationMinutes, 0);
    const dayOfWeek = this.getDayOfWeek(dayDate);

    if (staffId) {
      const staff = await this.findQualifiedStaff(salonId, uniqueServiceIds, staffId);
      if (!staff.length) return [];
      return this.getResourceSlots(salonId, date, dayOfWeek, duration, staffId);
    }

    const qualifiedStaff = await this.findQualifiedStaff(salonId, uniqueServiceIds);
    if (!qualifiedStaff.length) {
      return this.getResourceSlots(salonId, date, dayOfWeek, duration);
    }

    const staffSlots = await Promise.all(
      qualifiedStaff.map((staff) =>
        this.getResourceSlots(salonId, date, dayOfWeek, duration, staff.id),
      ),
    );

    return this.mergeStaffSlots(staffSlots);
  }

  private async findQualifiedStaff(salonId: string, serviceIds: string[], staffId?: string) {
    const staff = await this.prisma.staffProfile.findMany({
      where: {
        salonId,
        status: 'ACTIVE',
        ...(staffId ? { id: staffId } : {}),
      },
      select: {
        id: true,
        services: {
          where: { serviceId: { in: serviceIds } },
          select: { serviceId: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return staff.filter((item) => item.services.length === serviceIds.length);
  }

  private async getResourceSlots(
    salonId: string,
    date: string,
    dayOfWeek: DayOfWeek,
    duration: number,
    staffId?: string,
  ): Promise<TimeSlot[]> {
    let workingHour = await this.prisma.workingHour.findFirst({
      where: { salonId, staffId: staffId ?? null, dayOfWeek },
    });

    if (!workingHour && staffId) {
      workingHour = await this.prisma.workingHour.findFirst({
        where: { salonId, staffId: null, dayOfWeek },
      });
    }
    if (!workingHour?.isOpen) return [];

    const dayStart = new Date(`${date}T00:00:00Z`);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const [existingBookings, timeOffs] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          salonId,
          staffId: staffId ?? null,
          status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
          startsAt: { gte: dayStart, lt: dayEnd },
        },
        select: { startsAt: true, endsAt: true },
      }),
      staffId
        ? this.prisma.timeOff.findMany({
            where: {
              staffId,
              startsAt: { lt: dayEnd },
              endsAt: { gt: dayStart },
            },
            select: { startsAt: true, endsAt: true },
          })
        : Promise.resolve([]),
    ]);

    const [openHour, openMinute] = workingHour.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = workingHour.closeTime.split(':').map(Number);
    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;
    const slots: TimeSlot[] = [];

    for (let minute = openMinutes; minute + duration <= closeMinutes; minute += 30) {
      if (this.overlapsBreak(minute, duration, workingHour.breakStart, workingHour.breakEnd)) {
        continue;
      }

      const slotStart = new Date(`${date}T${this.minutesToTime(minute)}:00Z`);
      const slotEnd = new Date(slotStart.getTime() + duration * 60_000);
      const conflict = [...existingBookings, ...timeOffs].some(
        (item) => slotStart < item.endsAt && slotEnd > item.startsAt,
      );

      slots.push({
        time: this.minutesToTime(minute),
        available: !conflict && slotStart > new Date(),
        staffId,
      });
    }

    return slots;
  }

  private mergeStaffSlots(staffSlots: TimeSlot[][]): TimeSlot[] {
    const merged = new Map<string, TimeSlot>();

    for (const slots of staffSlots) {
      for (const slot of slots) {
        const current = merged.get(slot.time);
        if (!current || (!current.available && slot.available)) {
          merged.set(slot.time, slot);
        }
      }
    }

    return [...merged.values()].sort((a, b) => a.time.localeCompare(b.time));
  }

  private overlapsBreak(
    startMinute: number,
    duration: number,
    breakStart?: string | null,
    breakEnd?: string | null,
  ) {
    if (!breakStart || !breakEnd) return false;
    const [startHour, startPart] = breakStart.split(':').map(Number);
    const [endHour, endPart] = breakEnd.split(':').map(Number);
    const breakStartMinute = startHour * 60 + startPart;
    const breakEndMinute = endHour * 60 + endPart;
    return startMinute < breakEndMinute && startMinute + duration > breakStartMinute;
  }

  private getDayOfWeek(date: Date): DayOfWeek {
    const days: DayOfWeek[] = [
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ];
    return days[date.getUTCDay()];
  }

  private minutesToTime(minutes: number): string {
    const hour = Math.floor(minutes / 60)
      .toString()
      .padStart(2, '0');
    const minute = (minutes % 60).toString().padStart(2, '0');
    return `${hour}:${minute}`;
  }
}
