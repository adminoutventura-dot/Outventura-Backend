import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateRoleDto) {
    const existingRole = await this.prisma.role.findUnique({
      where: { code: dto.code },
    });

    if (existingRole) {
      throw new ConflictException(`The code '${dto.code}' is already in use.`);
    }

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
    const role = await this.prisma.role.findUnique({
      where: { id_role: id },
    });
    if (!role) throw new NotFoundException(`Role with ID ${id} not found`);
    return role;
  }

  async update(id: number, dto: UpdateRoleDto) {
    await this.findOne(id);

    if (dto.code) {
      const duplicateCode = await this.prisma.role.findFirst({
        where: {
          code: dto.code,
          NOT: { id_role: id },
        },
      });

      if (duplicateCode) {
        throw new ConflictException(
          `Failed to update role: The code '${dto.code}' is already in use.`,
        );
      }
    }

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
        `Failed to delete role '${role.code}' because it has ${role._count.users} users assigned. Please reassign the users first.`,
      );
    }

    return this.prisma.role.delete({
      where: { id_role: id },
    });
  }
}
