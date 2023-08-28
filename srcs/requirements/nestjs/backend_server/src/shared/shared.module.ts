import { Module, forwardRef } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [forwardRef(() => AuthModule), UsersModule],
  providers: [AuthGuard, UsersService],
  exports: [AuthGuard, UsersModule],
})
export class SharedModule {}
