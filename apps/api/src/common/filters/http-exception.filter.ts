import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'خطای داخلی سرور';

    const response =
      exception instanceof HttpException ? exception.getResponse() : null;

    const errors =
      response && typeof response === 'object' && 'message' in response
        ? (response as { message: string[] }).message
        : undefined;

    if (status >= 500) {
      this.logger.error(exception);
    }

    reply.status(status).send({
      success: false,
      statusCode: status,
      message: Array.isArray(errors) ? 'اطلاعات ورودی نادرست است' : message,
      errors: Array.isArray(errors) ? errors : undefined,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
