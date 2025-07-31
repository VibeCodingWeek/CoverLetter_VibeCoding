# Career Journey Backend API

A Flask-based REST API for user authentication with SQLite database.

## Features

- User registration (sign-up)
- User login with JWT tokens
- Password hashing with Werkzeug
- Email validation
- SQLite database for user storage
- CORS enabled for frontend integration

## API Endpoints

### Authentication
- `POST /api/signup` - Register a new user
- `POST /api/login` - Login user
- `GET /api/verify-token` - Verify JWT token

### Utility
- `GET /api/users` - Get all users (development)
- `GET /api/health` - Health check

## Setup Instructions

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Flask server:**
   ```bash
   python app.py
   ```

3. **Server will start on:**
   ```
   http://localhost:5000
   ```

## Database

The application uses SQLite database (`users.db`) that will be automatically created when you first run the server.

### Users Table Structure:
- `id` - Primary key (auto-increment)
- `username` - Unique username
- `email` - Unique email address
- `password_hash` - Hashed password
- `created_at` - Timestamp of registration

## Environment Variables

- `SECRET_KEY` - JWT secret key (optional, defaults to development key)

## Development Notes

- CORS is enabled for all origins during development
- JWT tokens expire after 7 days
- Passwords must be at least 6 characters long
- Email validation is performed server-side 