## API Routes Documentation

This document provides an overview of the available API routes in the backend application.

### Users Controller (`/users`)

- `GET /users/me` - Get current user data
- `GET /users/:id` - Get user data by ID
- `GET /users` - Get all users
- `PATCH /users/:id` - Update user data by ID
- `PATCH /users/:id/password` - Update user password by ID
- `POST /users/:id/upload-avatar` - Upload user profile picture by ID

### Auth Controller (`/auth`)

- `GET /auth/csrf-token` - Get CSRF token
- `POST /auth/register` - User registration
- `POST /auth/confirm-email/:confirm_token` - Confirm user email by token
- `POST /auth/login` - User login
- `POST /auth/access-token/refresh` - Refresh access token
- `POST /auth/logout` - User logout
- `GET /auth/google` - Initiate Google login
- `GET /auth/google/callback` - Google login callback 