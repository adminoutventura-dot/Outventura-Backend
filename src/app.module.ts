import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ActivityModule } from './activity/activity.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BookingLineModule } from './booking-line/booking-line.module';
import { BookingStatusModule } from './booking-status/booking-status.module';
import { BookingModule } from './booking/booking.module';
import { CategoryModule } from './category/category.module';
import { EquipmentStatusModule } from './equipment-status/equipment-status.module';
import { EquipmentModule } from './equipment/equipment.module';
import { GuideModule } from './guide/guide.module';
import { ContentTypeMiddleware } from './middleware/content-type.middleware';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { MaintenanceMiddleware } from './middleware/maintenance.middleware';
import { SecurityHeadersMiddleware } from './middleware/security-headers.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RoleModule,
    UserModule,
    GuideModule,
    EquipmentModule,
    EquipmentStatusModule,
    CategoryModule,
    ActivityModule,
    BookingModule,
    BookingStatusModule,
    BookingLineModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        LoggerMiddleware,
        SecurityHeadersMiddleware,
        MaintenanceMiddleware,
        ContentTypeMiddleware
      )
      .forRoutes('*');
  }
}
