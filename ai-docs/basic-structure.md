# Базова структура проєкту flowy-backend

Цей документ описує основні компоненти та організацію коду бекенд-частини проєкту flowy, яка розроблена з використанням фреймворку NestJS. Проєкт дотримується модульної архітектури для розділення функціональності.

## Структура директорій верхнього рівня

Проєкт має наступні основні директорії:

*   `src/`: Містить весь вихідний код застосунку NestJS.
*   `prisma/`: Директорія, пов'язана з ORM Prisma. Містить міграції бази даних (`migrations/`) та файли початкових даних (`seeds/`).
*   `docs/`: Призначена для зберігання документації проєкту.
*   `public/`: Містить статичні файли, доступні ззовні (наприклад, завантажені файли користувачів у `uploads/`).
*   `test/`: Містить файли тестів для застосунку.

## Структура директорії `src/`

Директорія `src/` організована за функціональним та архітектурним принципами NestJS:

*   `config/`: Містить конфігураційні файли застосунку. Кожен файл зазвичай відповідає за конфігурацію певної частини системи або зовнішнього сервісу (наприклад, `google.config.ts`). Конфігурація завантажується та доступна через `ConfigService` NestJS.
*   `core/`: Містить глобальні, незалежні від конкретної бізнес-логіки компоненти NestJS, які можуть застосовуватися до всього застосунку. Сюди входять:
    *   `decorators/`: Користувацькі декоратори.
    *   `enhancers/`: Компоненти для розширення можливостей NestJS.
    *   `filters/`: Глобальні фільтри винятків для централізованої обробки помилок.
    *   `interceptor/`: Глобальні перехоплювачі запитів для маніпуляцій з запитами/відповідями або логування.
    *   `services/`: Глобальні сервіси, які використовуються в core компонентах.
    *   `types/`: Загальні TypeScript типи.
    *   `utils/`: Загальні допоміжні функції.
    *   `validators/`: Користувацькі валідатори.
*   `db/`: Містить код, пов'язаний з підключенням та налаштуванням бази даних, якщо це не повністю охоплено Prisma.
*   `modules/`: Основна директорія для бізнес-логіки, розділеної на незалежні модулі. Кожен модуль реалізує функціональність певного домену або фічі застосунку. Приклади модулів:
    *   `auth/`: Модуль для автентифікації та авторизації користувачів.
    *   `refresh-token-nonces/`: Модуль для управління одноразовими кодами для оновлення токенів.
    *   `users/`: Модуль для управління користувачами.
    Згідно з рекомендаціями NestJS та правилами проєкту, кожен модуль зазвичай має таку внутрішню структуру (хоча не всі піддиректорії обов'язково присутні у кожному модулі):
        *   `dto/`: Data Transfer Objects для валідації та типізації вхідних даних.
        *   `entities/`: Визначення сутностей (моделей даних).
        *   `guards/`: Guards для захисту маршрутів на основі ролей або дозволів.
        *   `strategies/`: Стратегії автентифікації для Passport.js (наприклад, JWT, Google OAuth).
        *   `validators/`: Користувацькі валідатори для специфічної логіки валідації.
*   `shared/`: Містить сервіси та утиліти, які спільно використовуються різними модулями застосунку, щоб уникнути дублювання коду. Приклади піддиректорій:
    *   `email/`: Логіка для надсилання електронних листів.
    *   `google/`: Код для взаємодії з сервісами Google.
    *   `jwt/`: Утиліти для роботи з JWT токенами.

## Ключові типи файлів

В межах директорій `src/modules/`, `src/core/`, `src/shared/` та `src/config/` часто зустрічаються файли з такими призначеннями:

*   `*.module.ts`: Визначає NestJS модуль, оголошуючи контролери, провайдери та імпортуючи необхідні модулі.
*   `*.controller.ts`: Містить обробники маршрутів (endpoints) API. Відповідає за прийом запитів та виклик відповідних методів сервісів.
*   `*.service.ts`: Містить основну бізнес-логіку застосунку. Взаємодіє з репозиторіями (або ORM, як Prisma) для отримання та збереження даних.
*   `*.entity.ts`: Визначає структуру даних, яка використовується ORM для взаємодії з базою даних.
*   `*.dto.ts`: Класи, що використовуються для представлення вхідних даних (наприклад, тіло запиту POST) та їх валідації.
*   `*.strategy.ts`: Реалізує логіку перевірки облікових даних користувача для автентифікації за допомогою Passport.js.
*   `*.guard.ts`: Містить логіку авторизації, яка визначає, чи дозволено виконання певного маршруту для поточного користувача.
*   `*.config.ts`: Файл, що експортує об'єкт конфігурації, який завантажується NestJS `ConfigModule`.

## Висновки

Структура проєкту flowy-backend є типовою для застосунків NestJS, що дотримуються принципів модульності та поділу відповідальності. Код організовано за функціональними доменами (`modules`) та архітектурними шарами (`core`, `shared`, `config`, `db`), що сприяє читабельності, підтримці та масштабованості проєкту. 