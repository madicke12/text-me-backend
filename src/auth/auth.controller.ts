import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSignUpDto, AuthSignInDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authservice: AuthService) {}
  @Post('login')
  login(@Body() dto: AuthSignInDto) {
    return this.authservice.login(dto);
  }
  @Post('logout')
  logout() {
    return this.authservice.logout();
  }
  @Post('signup')
  signup(@Body() dto: AuthSignUpDto) {
    return this.authservice.signup(dto);
  }
}
