# Угоди іменування проєкту

Цей документ описує основні угоди іменування, що використовуються в проєкті, для забезпечення послідовності та читабельності коду.

## 1. Директорії

Назви директорій використовують `kebab-case`.

**Приклади:**

*   `src/modules/refresh-token-nonces/`
*   `src/core/validators/`
*   `src/shared/email/`

## 2. Файли

Назви файлів використовують `kebab-case` для багатослівних назв без суфікса та `dot.case` для назв з суфіксом, що вказує на роль або вміст файлу.

**Приклади:**

*   `src/shared/jwt/jwt-token.utils.ts` (`kebab-case`)
*   `src/modules/users/users.service.ts` (`dot.case`)
*   `src/modules/users/dto/create-user.dto.ts` (`dot.case`)
*   `prisma/schema.prisma` (спеціальний випадок)

## 3. Класи

Назви класів використовують `PascalCase`, часто із суфіксом, що вказує на роль у архітектурі (наприклад, Service, Controller, Entity, Dto, Module, Repository).

**Приклади:**

*   `UsersService`
*   `CreateUserDto`
*   `User` (для сутностей/моделей)
*   `UsersModule`

## 4. Інтерфейси та Типи

Назви інтерфейсів та користувацьких типів використовують `PascalCase`.

**Приклади:**

*   `JwtPayload`
*   `TokenType`

## 5. Змінні та Властивості

Назви змінних та властивостей класів використовують `camelCase`. Закриті властивості класів часто позначаються модифікаторами доступу (`private`, `protected`).

**Приклади:**

*   `firstName`
*   `isEmailVerified`
*   `private readonly usersRepository`
*   `userRole`

## 6. Константи

Назви констант, які зазвичай оголошуються з `const` на верхньому рівні або як статичні властивості класу, використовують `SCREAMING_SNAKE_CASE`.

**Приклади:**

*   `SERIALIZATION_GROUPS`
*   `TOKEN_CONTEXT_MAP`

## 7. Енуми

Імена типів енумів використовують `PascalCase`. Значення членів енумів використовують `SCREAMING_SNAKE_CASE` у коді TypeScript. У схемі Prisma значення можуть відображатись на `snake_case` за допомогою `@map`.

**Приклади:**

*   **Тип:** `UserRole`
*   **Значення (TypeScript):** `UserRole.USER`, `UserRole.ADMIN`
*   **Значення (Prisma `@map`):** `@map("user")`, `@map("admin")`

## 8. Моделі та Поля Prisma

Назви моделей у `schema.prisma` використовують `PascalCase` в однині. Назви полів моделей використовують `camelCase` у схемі та можуть відображатись на `snake_case` у базі даних за допомогою `@map`.

**Приклади:**

*   **Модель:** `User`, `RefreshTokenNonce`
*   **Поле (схема Prisma):** `firstName`, `isEmailVerified`, `createdAt`
*   **Поле (база даних через `@map`):** `@map("first_name")`, `@map("is_email_verified")`, `@map("created_at")` 