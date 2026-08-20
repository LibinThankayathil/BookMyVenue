import { UsersService } from './users.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  email: string;
  fullName: string;
  roles: string[];
  isKycVerified: boolean;
  accountCreatedAt: string;
}

import { env } from '../config/env';

export class AuthService {
  private usersService = new UsersService();

  /**
   * Registers a new user with their email, password, fullName, and roles.
   */
  async register(
    email: string,
    password: string,
    fullName: string,
    roles: string[] = ['USER'],
  ) {
    if (!email || !password || !fullName) {
      throw new Error('Email, password, and fullName are required.');
    }

    const passwordHash = await this.hashPassword(password);
    return this.usersService.createUser(email, passwordHash, fullName, roles);
  }

  /**
   * Logs in a user, verifying email/password and minting a JWT.
   */
  async login(email: string, password: string) {
    if (!email || !password) {
      throw new Error('Email and password must be provided.');
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    // Guard: OAuth-only users cannot use password login
    if (!user.passwordHash) {
      throw new Error('This account uses Google sign-in. Please use "Continue with Google".');
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(
      password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new Error('Invalid email or password.');
    }

    // Extract exact roles
    const roles = user.userRoles.map((ur) => ur.role.name);

    // Mint stateless JWT containing ID (sub), roles, and custom claims for zero-latency risk engine
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: roles,
      isKycVerified: user.isKycVerified,
      accountCreatedAt: user.createdAt.toISOString(),
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: roles,
        ownerProfile: user.ownerProfile,
      },
    };
  }

  /**
   * Handles Google OAuth login: finds existing user or creates a new one.
   */
  async googleLogin(email: string, fullName: string, roles: string[] = ['USER']) {
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // Auto-create user from Google profile (no password)
      user = await this.usersService.createOAuthUser(email, fullName, 'google', roles);
    }

    const userRoles = user.userRoles.map((ur: any) => ur.role.name);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: userRoles,
      isKycVerified: user.isKycVerified,
      accountCreatedAt: user.createdAt.toISOString(),
    };

    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: userRoles,
        ownerProfile: user.ownerProfile,
      },
    };
  }

  verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      return decoded as any as JwtPayload;
    } catch {
      throw new Error('Invalid or expired token.');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
