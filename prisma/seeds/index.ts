// prisma/seeds/index.ts
import { DatabaseService } from '../../src/db/database.service';
import { UsersService } from '../../src/modules/users/users.service';
import { UsersRepository } from '../../src/modules/users/users.repository';
import { createInitialUsers, getRandomAvatar } from './users';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import { HashingService } from '../../src/core/services/hashing.service';
import { HashingPasswordsService } from '../../src/modules/users/hashing-passwords.service';
import storageConfig from '../../src/config/storage.config';
import appConfig from '../../src/config/app.config';
import { SEEDS } from './seed-constants';

class Seeder {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly usersService: UsersService,
    ) {
    }

    async start() {
        await this.seedUsers();
        console.log('Users were created 👥');
    }

    async seedUsers() {
        const users = await createInitialUsers();

        // const userAvatars: string[] = [];
        // for (let i = 1; i <= SEEDS.USERS.PROFILE_PICTURE_COUNT; i++) {
        //     userAvatars.push(SEEDS.USERS.PROFILE_PICTURE_MASK.replace('*', i.toString()));
        // }

        for (const user of users) {
            const { gender, ...userData } = user;
            const createdUser = await this.usersService.createUser(userData);

            if (SEEDS.PRODUCT.THEME_ID === 2) {
                continue;
            }

            if (SEEDS.USERS.GENERATE_AVATARS) {
                await this.usersService.updateUserAvatar(
                    createdUser.id,
                    // faker.helpers.arrayElement(userAvatars),
                    await getRandomAvatar(createdUser.id, gender)
                );
            } else {
                await this.usersService.updateUserAvatar(
                    createdUser.id,
                    SEEDS.USERS.AVATAR_MASK.replace('*', createdUser.id.toString())
                );
            }
        }

        const admin = await this.usersService.findUserByEmail(`admin@${SEEDS.PRODUCT.DOMAIN}`);
        await this.usersService.updateUserRole(admin.id, UserRole.ADMIN);
    }
}

async function start() {
    try {
        console.log('Seeding started 🌱');
        const dbService = new DatabaseService();
        const configService = new ConfigService(
            {
                ...storageConfig(),
                ...appConfig(),
            }
        );
        const hashingService = new HashingService(configService);
        const passwordService = new HashingPasswordsService(hashingService);

        const userService = new UsersService(
            new UsersRepository(dbService),
            passwordService);

        const seeder = new Seeder(
            dbService,
            userService,
        );
        await seeder.start();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

start();
