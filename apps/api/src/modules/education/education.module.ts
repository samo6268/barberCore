import { Module } from '@nestjs/common';
import { EducationService } from './education.service';
import { EducationController } from './education.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [EducationService],
  controllers: [EducationController],
  exports: [EducationService],
})
export class EducationModule {}
