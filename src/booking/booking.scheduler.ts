import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingScheduler {
    private readonly logger = new Logger(BookingScheduler.name);

    constructor(private prisma: PrismaService) { }

    @Cron(CronExpression.EVERY_HOUR)
    async updateBookingStatuses() {
        this.logger.log('🔄 Checking booking statuses...');
        const now = new Date();

        // Busca l'estat IN_PROGRESS
        const inProgressStatus = await this.prisma.bookingStatus.findUnique({
            where: { code: 'IN_PROGRESS' }
        });

        // Busca l'estat FINISHED
        const finishedStatus = await this.prisma.bookingStatus.findUnique({
            where: { code: 'FINISHED' }
        });

        if (!inProgressStatus || !finishedStatus) {
            this.logger.error('Els estats IN_PROGRESS o FINISHED no existeixen al sistema');
            return;
        }

        // ACCEPTED → IN_PROGRESS quan init_date <= ara
        const toInProgress = await this.prisma.booking.updateMany({
            where: {
                status: { code: 'ACCEPTED' },
                init_date: { lte: now }
            },
            data: { statusId: inProgressStatus.id_book_status }
        });

        if (toInProgress.count > 0) {
            this.logger.log(`✅ ${toInProgress.count} reserva(es) passades a IN_PROGRESS`);
        }

        // IN_PROGRESS → FINISHED quan end_date <= ara
        const toFinished = await this.prisma.booking.updateMany({
            where: {
                status: { code: 'IN_PROGRESS' },
                end_date: { lte: now }
            },
            data: { statusId: finishedStatus.id_book_status }
        });

        if (toFinished.count > 0) {
            this.logger.log(`✅ ${toFinished.count} reserva(es) passades a FINISHED`);
        }
    }
}