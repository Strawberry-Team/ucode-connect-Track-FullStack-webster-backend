# Приклади коду

Цей документ містить короткі приклади коду, що ілюструють реалізацію типових компонентів та операцій у проєкті.

## 1. Prisma Schema (Рівень даних)

Визначення моделі даних за допомогою Prisma Schema.

```prisma
model User {
  id       Int    @id @default(autoincrement())
  email    String @unique
  firstName String @map("first_name")
  // ... інші поля
  @@map("users")
}
```

## 2. Сутність (Entity)

Представлення моделі даних у коді TypeScript, часто з декораторами для серіалізації.

```typescript
// src/modules/users/entities/user.entity.ts
import { User as PrismaUser } from '@prisma/client';
import { Expose } from 'class-transformer';

export class User implements PrismaUser {
    @Expose()
    id: number;

    @Expose()
    firstName: string;

    // ... інші властивості

    // Приклад властивості, яка не завжди серіалізується
    password: string;
}
```

## 3. Об'єкт Передачі Даних (DTO)

Визначення структури даних для вхідних або вихідних операцій, часто з декораторами валідації.

```typescript
// src/modules/users/dto/create-user.dto.ts
import { IsString, IsEmail, Length } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @Length(8, 50)
    password: string;

    @IsString()
    firstName: string;

    // ... інші властивості
}
```

## 4. Репозиторій (Рівень доступу до даних)

Клас, що інкапсулює логіку взаємодії з конкретною моделлю даних через Prisma Client.

```typescript
// src/modules/users/users.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../db/database.service';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
    constructor(private readonly db: DatabaseService) {}

    async findById(id: number): Promise<User | null> {
        return this.db.user.findUnique({
            where: { id },
            // ... include/select options
        });
    }

    // ... інші методи CRUD
}
```

## 5. Сервіс (Рівень бізнес-логіки)

Клас, що містить основну бізнес-логіку, використовує репозиторії та може взаємодіяти з іншими сервісами.

```typescript
// src/modules/users/users.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { HashingPasswordsService } from './hashing-passwords.service';
import { plainToInstance } from 'class-transformer';
// ... інші імпорти

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
        const result = await this.usersRepository.create(dto);

        return plainToInstance(User, result, { groups: ['confidential'] });
    }

    // ... інші методи бізнес-логіки
}
```

## 6. Контролер (Рівень презентації)

Клас, що обробляє вхідні HTTP-запити та викликає відповідні методи сервісів.

```typescript
// src/modules/users/users.controller.ts
import { Controller, Get, Param, UseGuards, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/auth.guards';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
// ... інші імпорти

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) {}

    @Get(':id')
    @ApiOperation({ summary: 'Get user data' })
    @ApiParam({ name: 'id', type: 'number' })
    @ApiResponse({ status: HttpStatus.OK, type: User })
    async findOne(@Param('id') id: number): Promise<User> {
        return await this.usersService.findUserByIdWithoutPassword(id);
    }

    // ... інші обробники маршрутів
}
``` 