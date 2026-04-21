import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateRoleDto) {
    return this.prisma.role.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.role.findUnique({
      where: { id_role: id },
    });
  }

  async update(id: number, dto: UpdateRoleDto) {
    return this.prisma.role.update({
      where: { id_role: id },
      data: dto,
    });
  }

  async remove(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id_role: id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`The role with ID ${id} does not exist.`);
    }

    if (role._count.users > 0) {
      throw new BadRequestException(
        `Failed to delete role "${role.code}" because it has ${role._count.users} users assigned. Please reassign the users first.`,
      );
    }

    return this.prisma.role.delete({
      where: { id_role: id },
    });
  }
}
