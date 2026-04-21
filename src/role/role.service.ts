import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) { }

  create(dto: CreateRoleDto) {
    return this.prisma.role.create({
      data: dto,
    });
  }

  findAll() {
    return this.prisma.role.findMany({
      include: { users: true }, // opcional, mostra els usuaris del rol
    });
  }

  findOne(id: number) {
    return this.prisma.role.findUnique({
      where: { id_role: id },
      include: { users: true }, // opcional
    });
  }

  update(id: number, dto: UpdateRoleDto) {
    return this.prisma.role.update({
      where: { id_role: id },
      data: dto,
    });
  }

  remove(id: number) {
    return this.prisma.role.delete({
      where: { id_role: id },
    });
  }
}
