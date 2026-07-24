import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EducationService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Instructor ──────────────────────────────────────────────────────────

  async applyAsInstructor(userId: string, dto: { bio: string; expertise: string[] }) {
    const existing = await this.prisma.instructor.findUnique({ where: { userId } });
    if (existing) throw new BadRequestException('Already applied as instructor');
    return this.prisma.instructor.create({
      data: { userId, bio: dto.bio, expertise: dto.expertise },
    });
  }

  async approveInstructor(instructorId: string) {
    const inst = await this.prisma.instructor.findUnique({ where: { id: instructorId } });
    if (!inst) throw new NotFoundException('Instructor not found');
    return this.prisma.instructor.update({
      where: { id: instructorId },
      data: { isApproved: true },
    });
  }

  async getInstructor(userId: string) {
    return this.prisma.instructor.findUnique({
      where: { userId },
      include: { courses: { select: { id: true, title: true, status: true, enrollmentCount: true, rating: true } } },
    });
  }

  // ── Courses ─────────────────────────────────────────────────────────────

  async listPublishedCourses(query?: { tag?: string; level?: string }) {
    return this.prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
        ...(query?.tag   ? { tags:  { has: query.tag }  } : {}),
        ...(query?.level ? { level: query.level }        : {}),
      },
      include: {
        instructor: { include: { courses: false } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { enrollmentCount: 'desc' },
    });
  }

  async getCourse(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: true,
        chapters: {
          include: { lessons: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async createCourse(userId: string, dto: {
    title: string; description?: string; price: number;
    level?: string; tags?: string[]; coverImageUrl?: string;
  }) {
    const instructor = await this.prisma.instructor.findUnique({ where: { userId } });
    if (!instructor) throw new ForbiddenException('Not an approved instructor');
    if (!instructor.isApproved) throw new ForbiddenException('Instructor not yet approved');

    return this.prisma.course.create({
      data: {
        instructorId: instructor.id,
        title: dto.title,
        description: dto.description,
        price: dto.price,
        level: dto.level ?? 'beginner',
        tags: dto.tags ?? [],
        coverImageUrl: dto.coverImageUrl,
      },
    });
  }

  async publishCourse(courseId: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { instructor: true, chapters: { include: { lessons: true } } },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructor.userId !== userId) throw new ForbiddenException();
    if (course.chapters.length === 0) throw new BadRequestException('Add at least one chapter before publishing');

    return this.prisma.course.update({ where: { id: courseId }, data: { status: 'PUBLISHED' } });
  }

  // ── Enrollment ───────────────────────────────────────────────────────────

  async enroll(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.status !== 'PUBLISHED') throw new NotFoundException('Course not found');

    const existing = await this.prisma.courseEnrollment.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });
    if (existing) throw new BadRequestException('Already enrolled');

    const [enrollment] = await this.prisma.$transaction([
      this.prisma.courseEnrollment.create({
        data: { courseId, userId, paidAmount: course.discountPrice ?? course.price },
      }),
      this.prisma.course.update({
        where: { id: courseId },
        data: { enrollmentCount: { increment: 1 } },
      }),
    ]);
    return enrollment;
  }

  async getEnrollment(userId: string, enrollmentId: string) {
    const enrollment = await this.prisma.courseEnrollment.findFirst({
      where: { id: enrollmentId, userId },
      include: { lessons: true, course: { include: { chapters: { include: { lessons: true } } } } },
    });
    if (!enrollment) throw new NotFoundException('Not enrolled');
    return enrollment;
  }

  async completeLesson(userId: string, enrollmentId: string, lessonId: string) {
    const enrollment = await this.prisma.courseEnrollment.findFirst({
      where: { id: enrollmentId, userId },
      include: { course: { include: { chapters: { include: { lessons: true } } } } },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    await this.prisma.lessonProgress.upsert({
      where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
      create: { enrollmentId, lessonId, completedAt: new Date() },
      update: { completedAt: new Date() },
    });

    const totalLessons = enrollment.course.chapters.reduce((s, c) => s + c.lessons.length, 0);
    const completed    = await this.prisma.lessonProgress.count({
      where: { enrollmentId, completedAt: { not: null } },
    });
    const progress = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

    const updated = await this.prisma.courseEnrollment.update({
      where: { id: enrollmentId },
      data: {
        progress,
        completedAt: progress === 100 ? new Date() : null,
      },
    });

    if (progress === 100) {
      await this.issueCertificate(userId, enrollment.courseId);
    }

    return updated;
  }

  // ── Certificate ──────────────────────────────────────────────────────────

  async issueCertificate(userId: string, courseId: string) {
    const existing = await this.prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) return existing;

    return this.prisma.certificate.create({
      data: { userId, courseId },
    });
  }

  async getUserCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      include: { course: { select: { title: true, coverImageUrl: true } } },
      orderBy: { issuedAt: 'desc' },
    });
  }

  // ── Revenue share ────────────────────────────────────────────────────────

  async getInstructorEarnings(userId: string) {
    const instructor = await this.prisma.instructor.findUnique({ where: { userId } });
    if (!instructor) throw new NotFoundException('Instructor not found');

    const enrollments = await this.prisma.courseEnrollment.findMany({
      where: { course: { instructorId: instructor.id } },
      select: { paidAmount: true, enrolledAt: true, courseId: true },
    });

    const total = enrollments.reduce((s, e) => s + e.paidAmount, 0);
    const share = total * (instructor.revenueShare / 100);

    return {
      totalRevenue: total,
      revenueSharePct: instructor.revenueShare,
      instructorEarnings: share,
      platformEarnings: total - share,
      enrollmentCount: enrollments.length,
    };
  }
}
