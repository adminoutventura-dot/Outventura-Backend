// guide.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuideDto } from './dto/create-guide.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';

@Injectable()
export class GuideService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateGuideDto) {
    const user = await this.prisma.user.findUnique({
      where: { id_user: dto.userId }
    });
    if (!user) throw new NotFoundException('Usuari no trobat');

    const existing = await this.prisma.guide.findUnique({
      where: { userId: dto.userId }
    });
    if (existing) throw new ConflictException('Aquest usuari ja és guia');

    return this.prisma.guide.create({
      data: dto,
      include: { user: { select: { name: true, surname: true, email: true } } }
    });
  }

  async findAll() {
    return this.prisma.guide.findMany({
      include: { user: { select: { name: true, surname: true, email: true } } }
    });
  }

  async findOne(id: number) {
    const guide = await this.prisma.guide.findUnique({
      where: { id_guide: id },
      include: { user: { select: { name: true, surname: true, email: true } } }
    });
    if (!guide) throw new NotFoundException('Guia no trobat');
    return guide;
  }

  async update(id: number, dto: UpdateGuideDto) {
    await this.findOne(id);
    return this.prisma.guide.update({
      where: { id_guide: id },
      data: dto,
      include: { user: { select: { name: true, surname: true, email: true } } }
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.guide.delete({ where: { id_guide: id } });
  }
}