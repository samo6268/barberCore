import { Module } from '@nestjs/common';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { ASSISTANT_PROVIDER } from './providers/assistant-provider';
import { RuleBasedAssistantProvider } from './providers/rule-based.provider';

@Module({
  controllers: [AssistantController],
  providers: [
    AssistantService,
    RuleBasedAssistantProvider,
    { provide: ASSISTANT_PROVIDER, useExisting: RuleBasedAssistantProvider },
  ],
  exports: [AssistantService],
})
export class AssistantModule {}
