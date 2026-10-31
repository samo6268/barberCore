import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';
import { BookingModule } from '../booking/booking.module';
import { SalonsModule } from '../salons/salons.module';
import { StaffModule } from '../staff/staff.module';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { AssistantBusinessService } from './assistant-business.service';
import { AssistantToolsService } from './assistant-tools.service';
import { AssistantSessionService } from './assistant-session.service';
import { AssistantAuthGuard } from './assistant-auth.guard';
import { ASSISTANT_PROVIDER } from './providers/assistant-provider';
import { ResponsesAssistantProvider } from './providers/responses.provider';
@Module({
  imports: [AuthModule, MarketplaceModule, BookingModule, SalonsModule, StaffModule],
  controllers: [AssistantController],
  providers: [
    AssistantService,
    AssistantBusinessService,
    AssistantToolsService,
    AssistantSessionService,
    AssistantAuthGuard,
    ResponsesAssistantProvider,
    { provide: ASSISTANT_PROVIDER, useExisting: ResponsesAssistantProvider },
  ],
  exports: [AssistantService],
})
export class AssistantModule {}
