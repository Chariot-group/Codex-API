import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard as PassportAuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";

export const IS_PUBLIC_KEY = "isPublic";

@Injectable()
export class AuthGuard extends PassportAuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException("Unauthorized - Please authenticate via SSO");
    }
    return user;
  }
}
