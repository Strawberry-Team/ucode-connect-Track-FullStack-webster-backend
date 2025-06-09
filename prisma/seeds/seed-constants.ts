// prisma/seeds/seed-constants.ts
export const SEEDS = {
    PRODUCT: {
        DOMAIN: 'flowy.com',
    },
    USERS: {
        TOTAL: 10,
        ADMINS: 1,
        PASSWORD: 'Password123!$',
        GENDER_PROBABILITY: 0.5,
        DEFAULT_AVATAR_PICTURE: 'default-avatar.png',
        AVATAR_MASK: 'user-avatar-*.png',
        AVATAR_COUNT: 10,
        GENERATE_AVATARS: false,
        PROFILE_PICTURE_QUERY_POSTFIX: 'profile portrait person face',
        PROFILE_PICTURE_ORIENTATION: 'squarish', // 'landscape' | 'portrait' | 'squarish'
        PROFILE_PICTURE_WIDTH: 2000,
        PROFILE_PICTURE_HEIGHT: 2000,
    },
} as const;
