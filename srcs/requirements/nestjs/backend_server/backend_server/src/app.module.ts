import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { GameModule } from './game/game.module';
import { AuthModule } from './auth/auth.module';
import { LoginModule } from './login/login.module';
import { InMemoryUsers } from './users/users.provider';
import { SharedModule } from './shared/shared.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

const mailId = process.env.MAIL_USER;
const mailPassword = process.env.MAIL_PW;
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '/.env', // .env 파일의 경로를 명시적으로 지정
    }),
    AuthModule,
    UsersModule,
    SharedModule,
    LoginModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(typeORMConfig),
    GameModule,
    ChatModule,
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: mailId,
            pass: mailPassword,
          },
        },
        defaults: {
          from: '"no-reply" <no-reply@pingpong>',
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ],
})
export class AppModule {
}
