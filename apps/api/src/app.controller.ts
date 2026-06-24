import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller({ version: VERSION_NEUTRAL })
export class AppController {
  @Get('api/health')
  @ApiOperation({ summary: 'Health check' })
  health() {
    return {
      success: true,
      data: {
        status: 'ok',
        service: 'parnegarin-api',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
