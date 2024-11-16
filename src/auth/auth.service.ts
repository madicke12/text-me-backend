import { JwtService } from '@nestjs/jwt';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthSignInDto, AuthSignUpDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async login(dto: AuthSignInDto): Promise<{ access_Token: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new ForbiddenException('Email ou mot de passe incorrect');
    }
    const isValide = await argon.verify(user.mot_de_passe, dto.mot_de_passe);
    if (!isValide) {
      throw new ForbiddenException('Email ou mot de passe incorrect');
    }
    return this.signToken(user.id, user.email);
  }
  logout() {
    return { message: 'Logout' };
  }

  async signup(dto: AuthSignUpDto) {
    const hash = await argon.hash(dto.mot_de_passe);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          mot_de_passe: hash,
          Prenom: dto.prenom,
          nom: dto.nom,
          role: dto.role,
        },
      });

      return this.signToken(user.id, user.email);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ForbiddenException('Email deja prise');
        }
      }
      throw e;
    }
  }

  async signToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email: email,
    };
    const secret = process.env.JWT_SECRET;
    const token = await this.jwt.signAsync(payload, {
      secret: secret,
    });
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return { access_Token: token, user };
  }
}
