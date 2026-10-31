import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AssistantAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) {
      request.user = undefined;
      return true;
    }
    // Supplied but expired/invalid credentials must fail, not downgrade to a guest.
    return super.canActivate(context);
  }
}
