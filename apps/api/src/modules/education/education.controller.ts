import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EducationService } from './education.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('education')
@Controller('v1/education')
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  // ── Public ───────────────────────────────────────────────────────────────

  @Get('courses')
  listCourses(@Query('tag') tag?: string, @Query('level') level?: string) {
    return this.educationService.listPublishedCourses({ tag, level });
  }

  @Get('courses/:id')
  getCourse(@Param('id') id: string) {
    return this.educationService.getCourse(id);
  }

  // ── Instructor ────────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('instructor/apply')
  applyAsInstructor(
    @Request() req: any,
    @Body() dto: { bio: string; expertise: string[] },
  ) {
    return this.educationService.applyAsInstructor(req.user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('instructor/me')
  getMyInstructor(@Request() req: any) {
    return this.educationService.getInstructor(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('instructor/me/earnings')
  getMyEarnings(@Request() req: any) {
    return this.educationService.getInstructorEarnings(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Patch('instructor/:id/approve')
  approveInstructor(@Param('id') id: string) {
    return this.educationService.approveInstructor(id);
  }

  // ── Course management ─────────────────────────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('courses')
  createCourse(
    @Request() req: any,
    @Body() dto: {
      title: string; description?: string; price: number;
      level?: string; tags?: string[]; coverImageUrl?: string;
    },
  ) {
    return this.educationService.createCourse(req.user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('courses/:id/publish')
  publishCourse(@Param('id') id: string, @Request() req: any) {
    return this.educationService.publishCourse(id, req.user.id);
  }

  // ── Enrollment ────────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('courses/:id/enroll')
  enroll(@Param('id') courseId: string, @Request() req: any) {
    return this.educationService.enroll(req.user.id, courseId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('enrollments/:enrollmentId')
  getEnrollment(@Param('enrollmentId') enrollmentId: string, @Request() req: any) {
    return this.educationService.getEnrollment(req.user.id, enrollmentId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('enrollments/:enrollmentId/lessons/:lessonId/complete')
  completeLesson(
    @Param('enrollmentId') enrollmentId: string,
    @Param('lessonId') lessonId: string,
    @Request() req: any,
  ) {
    return this.educationService.completeLesson(req.user.id, enrollmentId, lessonId);
  }

  // ── Certificates ──────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('certificates')
  getMyCertificates(@Request() req: any) {
    return this.educationService.getUserCertificates(req.user.id);
  }
}
