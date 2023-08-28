import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> | any {
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      return this.authService.validateRequest(request);
    } else if (context.getType() === 'ws') {
      const client = context.switchToWs().getClient();
      return this.authService.validateSocket(client);
    } else {
      console.log(`auth.guard: invalid type ${context.getType()}`);
      return false;
    }
  }
}