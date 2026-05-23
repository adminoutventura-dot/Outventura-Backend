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
      throw new ConflictException(`El codi '${dto.code}' ja està en ús.`);
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

    if (!role) {
      throw new NotFoundException(`El rol amb ID ${id} no existeix`);
    }

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
        throw new ConflictException(`No s'ha pogut actualitzar: el codi '${dto.code}' ja està en ús.`);
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
      throw new NotFoundException(`El rol amb ID ${id} no existeix.`);
    }

    if (role._count.users > 0) {
      throw new BadRequestException(`No es pot eliminar el rol '${role.code}' perquè té ${role._count.users} usuaris assignats.`);
    }

    return this.prisma.role.delete({
      where: { id_role: id },
    });
  }
}
