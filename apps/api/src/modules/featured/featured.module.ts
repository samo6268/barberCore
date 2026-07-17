import { Module } from '@nestjs/common';
import { FeaturedService } from './featured.service';
import { FeaturedController } from './featured.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [FeaturedService],
  controllers: [FeaturedController],
  exports: [FeaturedService],
})
export class FeaturedModule {}
