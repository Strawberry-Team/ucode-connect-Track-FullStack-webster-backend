# Структура проєкту

Цей документ описує структуру директорій та основних файлів проєкту, пояснюючи їхнє призначення та взаємозв'язки.

```
flowy-backend/
├── ai-docs/             # Документація, згенерована AI
├── docs/                # Інша документація проєкту
├── prisma/              # Файли конфігурації та міграцій Prisma ORM
│   ├── migrations/      # Історія міграцій бази даних
│   ├── seeds/           # Скрипти для початкового заповнення БД
│   └── schema.prisma    # Визначення моделі даних та зв'язків
├── public/              # Статичні файли, доступні публічно
│   ├── project/         # Файли проєкту
│   └── uploads/         # Завантажені користувачами файли
│       └── user-avatars/ # Аватари користувачів
├── src/                 # Вихідний код застосунку NestJS
│   ├── config/          # Файли конфігурації застосунку
│   ├── core/            # Загальні, повторно використовувані компоненти (декоратори, утиліти тощо)
│   │   ├── decorators/
│   │   ├── enhancers/
│   │   ├── filters/
│   │   ├── interceptor/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── validators/
│   ├── db/              # Код, пов'язаний з підключенням до бази даних
│   ├── modules/         # Бізнес-модулі застосунку (аутентифікація, користувачі тощо)
│   │   ├── auth/
│   │   ├── refresh-token-nonces/
│   │   └── users/
│   └── shared/          # Спільні компоненти та сервіси (email, jwt, google)
│       ├── email/
│       ├── google/
│       └── jwt/
├── test/                # Автоматизовані тести (юніт, інтеграційні, E2E)
├── .editorconfig        # Налаштування редактора коду
├── .env.development     # Змінні середовища для розробки
├── .gitignore           # Файли та директорії, що ігноруються Git
├── package.json         # Інформація про проєкт та залежності
├── README.md            # Опис проєкту
└── tsconfig.json        # Налаштування компілятора TypeScript
# ... інші конфігураційні файли
```

## Призначення основних директорій

*   **`ai-docs/`**: Містить документацію, автоматично згенеровану за допомогою інструментів AI.
*   **`docs/`**: Призначена для будь-якої іншої документації проєкту, включаючи діаграми, описи процесів тощо.
*   **`prisma/`**: Центральне місце для всього, що стосується бази даних та Prisma ORM. Файл `schema.prisma` є визначенням схеми БД.
*   **`public/`**: Слугує для розміщення статичних файлів, які можуть бути безпосередньо доступні через вебсервер.
*   **`src/`**: Містить вихідний код застосунку NestJS. Розділення на піддиректорії відображає архітектурні патерни та модульність.
    *   **`config/`**: Зберігає логіку завантаження та доступу до конфігураційних параметрів з `.env` файлів.
    *   **`core/`**: Містить загальновживані, низько 