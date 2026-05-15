import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { EquipmentModule } from './equipment/equipment.module';
import { EquipmentStatusModule } from './equipment-status/equipment-status.module';
import { CategoryModule } from './category/category.module';
import { ActivityModule } from './activity/activity.module';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { SecurityHeadersMiddleware } from './middleware/security-headers.middleware';
import { MaintenanceMiddleware } from './middleware/maintenance.middleware';
import { ContentTypeMiddleware } from './middleware/content-type.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RoleModule,
    UserModule,
    PrismaModule,
    EquipmentModule,
    EquipmentStatusModule,
    CategoryModule,
    ActivityModule,
    AuthModule
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
