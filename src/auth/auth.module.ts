import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "@/auth/jwt.strategy";
import { AuthGuard } from "@/auth/auth.guard";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}), // Configuration vide, la validation se fait via JWKS
  ],
  providers: [JwtStrategy, AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
