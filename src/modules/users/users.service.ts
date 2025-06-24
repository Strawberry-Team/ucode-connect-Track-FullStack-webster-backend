// src/users/users.service.ts
import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { GetUsersDto } from './dto/get-users.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SERIALIZATION_GROUPS, User } from './entities/user.entity';
import { HashingPasswordsService } from './hashing-passwords.service';
import { plainToInstance } from 'class-transformer';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UserRole } from '@prisma/client';


@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly passwordService: HashingPasswordsService,
    ) {}

    async createUser(dto: CreateUserDto): Promise<User> {
        const existing = await this.usersRepository.findByEmail(dto.email);
        if (existing) {
            throw new ConflictException('Email already in use');
        }
        dto.password = await this.passwordService.hash(dto.password);
        const result = await this.usersRepository.create({
            ...dto,
            role: UserRole.USER,
        });

        return plainToInstance(User, result, {
            groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
        });
    }

    async findAllUnactivatedUsers(time: number): Promise<User[]> {
        const users = await this.usersRepository.findAllUnactivatedUsers(time);
        return users.map((user) =>
            plainToInstance(User, user, {
                groups: SERIALIZATION_GROUPS.PRIVATE,
            }),
        );
    }

    async findAllUsers(getUsersDto: GetUsersDto): Promise<User[]> {
        const users = await this.usersRepository.findAll(getUsersDto);
        return users.map((user) =>
            plainToInstance(User, user, {
                groups: SERIALIZATION_GROUPS.BASIC,
            }),
        );
    }

    public async findUserById(
        id: number,
        serializationGroup: string[] = SERIALIZATION_GROUPS.PRIVATE,
    ): Promise<User> {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return plainToInstance(User, user, {
            groups: serializationGroup,
        });
    }

    async findUserByIdWithoutPassword(id: number): Promise<User> {
        return this.findUserById(id, SERIALIZATION_GROUPS.BASIC);
    }

    async findUserByIdWithConfidential(id: number): Promise<User> {
        return this.findUserById(id, SERIALIZATION_GROUPS.CONFIDENTIAL);
    }

    async findUserByEmail(email: string): Promise<User> {
        const result = await this.usersRepository.findByEmail(email);
        if (!result) {
            throw new NotFoundException('User with this email not found');
        }
        return plainToInstance(User, result, {
            groups: SERIALIZATION_GROUPS.PRIVATE,
        });
    }

    async findUserByEmailWithoutPassword(email: string): Promise<User> {
        const result = await this.findUserByEmail(email);
        return plainToInstance(User, result, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
        const result = await this.usersRepository.update(id, dto);
        if (!result) {
            throw new NotFoundException('User not found');
        }
        return plainToInstance(User, result, {
            groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
        });
    }

    async updateUserPassword(
        id: number,
        dto: UpdateUserPasswordDto,
    ): Promise<User> {
        const user = await this.findUserById(id);
        if (!user) {
            throw new NotFoundException('User with this id not found');
        }
        const isMatch = await this.passwordService.compare(
            dto.oldPassword,
            user.password,
        );
        if (!isMatch) {
            throw new UnauthorizedException('Old password does not match');
        }
        const hashedNewPassword = await this.passwordService.hash(
            String(dto.newPassword),
        );
        const result = await this.usersRepository.update(id, {
            password: hashedNewPassword,
        });
        if (!result) {
            throw new NotFoundException('User not found');
        }
        return plainToInstance(User, result, {
            groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
        });
    }

    async updateUserRole(id: number, role: string): Promise<User> {
        const validRoles = Object.values(UserRole);

        if (!validRoles.includes(role as UserRole)) {
            throw new BadRequestException('Role not found');
        }

        const result = await this.usersRepository.update(id, {
            role: role as UserRole,
        });

        if (!result) {
            throw new NotFoundException('User not found');
        }

        return plainToInstance(User, result, {
            groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
        });
    }

    async updateUserAvatar(
        id: number,
        profilePictureName: string,
    ): Promise<User> {
        const user = await this.findUserById(id);
        if (!user) {
            throw new NotFoundException('User with this email not found');
        }
        const result = await this.usersRepository.update(id, {
            profilePictureName,
        });
        if (!result) {
            throw new NotFoundException('User not found');
        }
        return plainToInstance(User, result, {
            groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
        });
    }

    async resetUserPassword(id: number, newPassword: string): Promise<User> {
        const hashedPassword = await this.passwordService.hash(newPassword);
        const updateData: Partial<User> = { password: hashedPassword };
        const result = await this.usersRepository.update(id, updateData);
        if (!result) {
            throw new NotFoundException('User not found');
        }
        return plainToInstance(User, result, {
            groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
        });
    }

    async confirmUserEmail(userId: number) {
        const updateData: Partial<User> = { isEmailVerified: true };
        const result = await this.usersRepository.update(userId, updateData);
        return plainToInstance(User, result, {
            groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
        });
    }

    async deleteUser(id: number): Promise<void> {
        await this.usersRepository.delete(id);
    }
}
