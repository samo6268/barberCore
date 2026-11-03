import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsArray,
  ArrayMaxSize,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class AssistantWorkflowDto {
  @IsString() @Matches(/^[a-z][a-z0-9_-]{0,59}$/) id!: string;
  @IsOptional() @IsString() @Matches(/^[a-z][a-z0-9_-]{0,59}$/) stepId?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(12)
  @Matches(/^[a-z][a-z0-9_-]{0,59}$/, { each: true }) completed?: string[];
  @IsOptional() @IsArray() @ArrayMaxSize(8)
  @Matches(/^[a-z][a-z0-9_-]{0,59}$/, { each: true }) issues?: string[];
}
export class AssistantContextDto {
  @IsString() @Matches(/^\/(?!\/)/) @MaxLength(300) route!: string;
  @IsOptional() @IsString() @MaxLength(150) title?: string;
  @IsOptional() @IsString() @MaxLength(50) entityType?: string;
  @IsOptional() @IsString() @MaxLength(100) entityId?: string;
  @IsOptional() @IsString() @MaxLength(60) section?: string;
  @IsOptional() @IsObject() metadata?: Record<string, unknown>;
  @IsOptional() @ValidateNested() @Type(() => AssistantWorkflowDto)
  workflow?: AssistantWorkflowDto;
}
export class AssistantChatDto {
  @IsString() @Matches(/^[a-z0-9-]{1,64}$/) assistantId!: string;
  @IsOptional() @IsUUID('4') conversationId?: string;
  @IsOptional() @IsString() @MaxLength(1000) sessionToken?: string;
  @IsString() @IsNotEmpty() @MaxLength(4000) message!: string;
  // Backward-compatible display hints only; never used for authorization or model identity.
  @IsOptional() @IsObject() identity?: Record<string, unknown>;
  @IsNotEmpty() @ValidateNested() @Type(() => AssistantContextDto) context!: AssistantContextDto;
}
