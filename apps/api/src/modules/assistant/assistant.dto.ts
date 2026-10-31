import { IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class AssistantChatDto {
  @IsString()
  @IsNotEmpty()
  assistantId!: string;

  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  message!: string;

  @IsOptional()
  @IsObject()
  identity?: {
    id?: string;
    displayName?: string;
    role?: string;
    tenantId?: string;
    locale?: string;
  };

  @IsObject()
  context!: {
    route: string;
    title?: string;
    entityType?: string;
    entityId?: string;
    section?: string;
    metadata?: Record<string, string | number | boolean | null>;
  };
}
