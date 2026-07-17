import { Module } from '@nestjs/common';
import { BoostService } from './boost.service';
import { BoostController } from './boost.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BoostService],
  controllers: [BoostController],
  exports: [BoostService],
})
export class BoostModule {}
