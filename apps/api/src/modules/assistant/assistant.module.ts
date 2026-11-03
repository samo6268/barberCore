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
import { InternalKnowledgeProvider } from './providers/internal-knowledge.provider';
import { ContextualAssistantProvider } from './providers/contextual-assistant.provider';
import { AssistantWorkflowService } from './assistant-workflow.service';
import { AssistantUnderstandingService } from './assistant-understanding.service';
@Module({
  imports: [AuthModule, MarketplaceModule, BookingModule, SalonsModule, StaffModule],
  controllers: [AssistantController],
  providers: [
    AssistantService,
    AssistantBusinessService,
    AssistantToolsService,
    AssistantSessionService,
    AssistantAuthGuard,
    InternalKnowledgeProvider,
    AssistantWorkflowService,
    AssistantUnderstandingService,
    ContextualAssistantProvider,
    { provide: ASSISTANT_PROVIDER, useExisting: ContextualAssistantProvider },
  ],
  exports: [AssistantService],
})
export class AssistantModule {}
