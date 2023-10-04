import { Module, forwardRef } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
  ],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, AuthGuard,],
})
export class AuthModule {}
