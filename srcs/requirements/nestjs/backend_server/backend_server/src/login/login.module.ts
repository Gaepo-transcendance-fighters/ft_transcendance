import { Module, forwardRef } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { SharedModule } from 'src/shared/shared.module';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [AuthModule, SharedModule,],
  controllers: [LoginController],
  providers: [LoginService, UsersService],
  exports: [LoginService],
})
export class LoginModule {}