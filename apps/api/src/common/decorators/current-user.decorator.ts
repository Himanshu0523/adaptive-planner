import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUserContext } from '@adaptive-planner/contracts';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUserContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
