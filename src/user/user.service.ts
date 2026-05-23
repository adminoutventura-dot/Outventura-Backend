import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateUserDto) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });

    if (existingEmail) {
      throw new ConflictException('Aquest correu ja està registrat');
    }

    const roleExists = await this.prisma.role.findUnique({
      where: { id_role: dto.roleId }
    });

    if (!roleExists) {
      throw new BadRequestException('El rol especificat no existeix');
    }

    const user = await this.prisma.user.create({
      data: dto,
      include: { role: true }
    });

    const { password, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, status: userWithoutPassword.status ? 'ACTIU' : 'INACTIU' };
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: { role: { select: { id_role: true, code: true } } }
    });

    return users.map(({ password, ...u }) => ({
      ...u,
      status: u.status ? 'ACTIU' : 'INACTIU'
    }));
  }

  async findAllActive() {
    const users = await this.prisma.user.findMany({
      where: { status: true },
      include: { role: { select: { id_role: true, code: true } } }
    });

    return users.map(({ password, ...u }) => ({
      ...u,
      status: 'ACTIU'
    }));
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id_user: id },
      include: { role: true }
    });

    if (!user) {
      throw new NotFoundException(`L'usuari amb ID ${id} no existeix`);
    }

    const { password, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, status: userWithoutPassword.status ? 'ACTIU' : 'INACTIU' };
  }

  async update(id: number, dto: UpdateUserDto, currentUser: any) {
    const targetUser = await this.prisma.user.findUnique({
      where: { id_user: id },
      include: { role: true }
    });

    if (!targetUser) {
      throw new NotFoundException(`L'usuari amb ID ${id} no existeix`);
    }

    const currentRole = currentUser.role.code;
    const targetRole = targetUser.role.code;

    if (currentRole === 'SUPER') {

      if (dto.status !== undefined && targetRole === 'SUPER' && targetUser.id_user !== currentUser.id_user) {
        throw new ForbiddenException('No pots canviar l\'estat d\'un altre SUPER.');
      }

      if (dto.status !== undefined && targetUser.id_user === currentUser.id_user) {
        throw new ForbiddenException('Per desactivar el teu compte usa l\'opció d\'eliminar usuari.');
      }

    }
    else if (currentRole === 'ADMIN') {
      if (dto.roleId) {
        throw new ForbiddenException('Només un SUPER pot canviar el rol d\'un usuari');
      }

      if (dto.status !== undefined) {
        throw new ForbiddenException('Només un SUPER pot canviar l\'estat d\'un usuari');
      }

      if (targetRole === 'SUPER') {
        throw new ForbiddenException('No pots editar un SUPER');
      }

      if (targetRole === 'ADMIN' && targetUser.id_user !== currentUser.id_user) {
        throw new ForbiddenException('No pots editar un altre ADMIN');
      }

    }
    else {
      // GUIDE i USER
      if (dto.roleId) {
        throw new ForbiddenException('No tens permisos per canviar el rol');
      }

      if (dto.status !== undefined) {
        throw new ForbiddenException('No tens permisos per canviar l\'estat');
      }

      if (id !== currentUser.id_user) {
        throw new ForbiddenException('Només pots editar el teu propi perfil');
      }
    }

    if (dto.email) {
      const emailConflict = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id_user: id } }
      });

      if (emailConflict) {
        throw new ConflictException('L\'email ja està sent usat per un altre usuari');
      }
    }

    if (dto.roleId) {
      const roleExists = await this.prisma.role.findUnique({ where: { id_role: dto.roleId } });
      if (!roleExists) {
        throw new BadRequestException('El rol especificat no existeix');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id_user: id },
      data: dto,
      include: { role: true }
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return { ...userWithoutPassword, status: userWithoutPassword.status ? 'ACTIU' : 'INACTIU' };
  }

  async promoteToGuide(id: number, specialty: string, credentials: string) {
    const targetUser = await this.prisma.user.findUnique({
      where: { id_user: id },
      include: { role: true }
    });

    if (!targetUser) {
      throw new NotFoundException(`L'usuari amb ID ${id} no existeix`);
    }

    const existingGuide = await this.prisma.guide.findUnique({ where: { userId: id } });
    if (existingGuide) {
      throw new ConflictException('Aquest usuari ja té perfil de guia');
    }

    const currentRole = (targetUser as any).role.code;

    if (currentRole === 'USER') {
      const guideRole = await this.prisma.role.findUnique({ where: { code: 'GUIDE' } });
      if (!guideRole) {
        throw new NotFoundException('Rol GUIDE no trobat');
      }

      const [updatedUser, guide] = await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id_user: id },
          data: { roleId: guideRole.id_role },
          include: { role: true }
        }),
        this.prisma.guide.create({
          data: { userId: id, specialty, credentials }
        })
      ]);

      const { password, ...userWithoutPassword } = updatedUser;
      return {
        user: { ...userWithoutPassword, status: userWithoutPassword.status ? 'ACTIU' : 'INACTIU' },
        guide
      };
    }

    if (currentRole === 'ADMIN' || currentRole === 'SUPER') {
      const guide = await this.prisma.guide.create({
        data: { userId: id, specialty, credentials }
      });

      const { password, ...userWithoutPassword } = targetUser as any;
      return {
        user: { ...userWithoutPassword, status: userWithoutPassword.status ? 'ACTIU' : 'INACTIU' },
        guide
      };
    }

    throw new BadRequestException('Aquest usuari ja té rol de GUIDE');
  }

  async promoteToAdmin(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id_user: id },
      include: { role: true }
    });

    if (!user) {
      throw new NotFoundException(`L'usuari amb ID ${id} no existeix`);
    }

    if ((user as any).role?.code === 'SUPER') {
      throw new BadRequestException('No es pot canviar el rol d\'un SUPER');
    }

    if ((user as any).role?.code === 'ADMIN') {
      throw new BadRequestException('Aquest usuari ja és ADMIN');
    }

    const adminRole = await this.prisma.role.findUnique({ where: { code: 'ADMIN' } });
    if (!adminRole) {
      throw new NotFoundException('Rol ADMIN no trobat');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id_user: id },
      data: { roleId: adminRole.id_role },
      include: { role: true }
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return { ...userWithoutPassword, status: userWithoutPassword.status ? 'ACTIU' : 'INACTIU' };
  }

  async remove(id: number, currentUser: any) {
    const targetUser = await this.prisma.user.findUnique({
      where: { id_user: id },
      include: { role: true }
    });

    if (!targetUser) {
      throw new NotFoundException(`L'usuari amb ID ${id} no existeix`);
    }

    const currentRole = currentUser.role.code;
    const targetRole = (targetUser as any).role.code;

    if (currentRole !== 'SUPER') {
      if (targetRole === 'SUPER') {
        throw new ForbiddenException('No pots desactivar un SUPER');
      }
      if (targetRole === 'ADMIN') {
        throw new ForbiddenException('Només un SUPER pot desactivar un ADMIN');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id_user: id },
      data: { status: false },
      include: { role: true }
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return { ...userWithoutPassword, status: 'INACTIU' };
  }
}