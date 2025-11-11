# Bible Streak API

A RESTful API built with Express.js, PostgreSQL, and Passport.js for user authentication and management.

## Features

- User registration and authentication
- JWT-based authorization
- Password hashing with bcryptjs
- Input validation
- CORS enabled for frontend integration
- PostgreSQL database
- Secure API endpoints

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Passport.js** - Authentication middleware
- **JWT** - JSON Web Tokens for authorization
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## Project Structure

```
biblestreakapi/
├── config/
│   ├── database.js          # PostgreSQL connection pool
│   ├── initDb.js            # Database initialization script
│   └── passport.js          # Passport JWT strategy configuration
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── auth.js              # Register & Login endpoints
│   └── users.js             # User CRUD endpoints
├── .env                     # Environment variables
├── .gitignore               # Git ignore file
├── index.js                 # Main application entry point
├── package.json             # Dependencies and scripts
└── README.md                # Documentation
```

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository** (or navigate to the project directory):
   ```bash
   cd biblestreakapi
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:

   The `.env` file should contain:
   ```env
   DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/biblestreak"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   PORT=5000
   ```

   **Important**: Change the `JWT_SECRET` to a secure random string in production.

4. **Set up PostgreSQL database**:

   Make sure PostgreSQL is running and create the database:
   ```sql
   CREATE DATABASE biblestreak;
   CREATE USER myuser WITH PASSWORD 'mypassword';
   GRANT ALL PRIVILEGES ON DATABASE biblestreak TO myuser;
   ```

5. **Initialize the database tables**:
   ```bash
   npm run init-db
   ```

## Running the Application

### Production mode:
```bash
npm start
```

### Development mode (with nodemon):
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Base URL
```
http://localhost:5000
```

### Authentication Endpoints (Public)

#### Register a new user
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2025-11-11T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### User Endpoints (Protected)

All user endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

#### Get all users
```http
GET /api/users
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Users retrieved successfully",
  "count": 2,
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": "2025-11-11T10:30:00.000Z",
      "updated_at": "2025-11-11T10:30:00.000Z"
    },
    {
      "id": 2,
      "email": "jane@example.com",
      "name": "Jane Smith",
      "created_at": "2025-11-11T11:00:00.000Z",
      "updated_at": "2025-11-11T11:00:00.000Z"
    }
  ]
}
```

#### Get single user
```http
GET /api/users/:id
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "User retrieved successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2025-11-11T10:30:00.000Z",
    "updated_at": "2025-11-11T10:30:00.000Z"
  }
}
```

#### Update user
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "email": "newemail@example.com",
  "password": "newpassword123"
}
```

**Note**: Users can only update their own profile. All fields are optional.

**Response (200 OK):**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": 1,
    "email": "newemail@example.com",
    "name": "John Updated",
    "updated_at": "2025-11-11T12:00:00.000Z"
  }
}
```

#### Delete user
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

**Note**: Users can only delete their own profile.

**Response (200 OK):**
```json
{
  "message": "User deleted successfully",
  "deletedUser": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Error Responses

### Validation Error (400 Bad Request)
```json
{
  "errors": [
    {
      "msg": "Valid email is required",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### Authentication Error (401 Unauthorized)
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### Forbidden (403 Forbidden)
```json
{
  "error": "You can only update your own profile"
}
```

### Not Found (404 Not Found)
```json
{
  "error": "User not found"
}
```

### Server Error (500 Internal Server Error)
```json
{
  "error": "Server error during registration"
}
```

## Security Features

- **Password Hashing**: Passwords are hashed using bcryptjs with salt rounds
- **JWT Authentication**: Tokens expire after 7 days
- **Input Validation**: All inputs are validated using express-validator
- **SQL Injection Protection**: Parameterized queries prevent SQL injection
- **CORS**: Cross-Origin Resource Sharing enabled for frontend integration
- **Environment Variables**: Sensitive data stored in .env file

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Get all users (replace TOKEN with actual JWT)
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer TOKEN"
```

### Update user
```bash
curl -X PUT http://localhost:5000/api/users/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'
```

### Delete user
```bash
curl -X DELETE http://localhost:5000/api/users/1 \
  -H "Authorization: Bearer TOKEN"
```

## Testing with Postman

1. Import the following base URL: `http://localhost:5000`
2. For protected routes, add to Headers:
   - Key: `Authorization`
   - Value: `Bearer <your-token>`
3. Set Content-Type to `application/json` for POST/PUT requests

## Connecting to Next.js Frontend

### Example API client setup:

```javascript
// lib/api.js
const API_URL = 'http://localhost:5000/api';

export const authAPI = {
  register: async (data) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  login: async (data) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

export const userAPI = {
  getAll: async (token) => {
    const response = await fetch(`${API_URL}/users`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  update: async (id, data, token) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
```

## NPM Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `npm run init-db` - Initialize database tables
- `npm test` - Run tests (not implemented yet)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `PORT` | Server port | 5000 |

## Production Deployment

1. **Update environment variables**:
   - Use a strong, random `JWT_SECRET`
   - Update `DATABASE_URL` with production database credentials

2. **Set up production database**:
   ```bash
   npm run init-db
   ```

3. **Use a process manager** (e.g., PM2):
   ```bash
   npm install -g pm2
   pm2 start index.js --name biblestreak-api
   ```

4. **Enable HTTPS** using a reverse proxy (nginx, Apache, or cloud provider)

5. **Set up environment-specific CORS** in production

## Future Enhancements

- [ ] Add role-based access control (admin, user)
- [ ] Implement refresh tokens
- [ ] Add password reset functionality
- [ ] Add email verification
- [ ] Implement rate limiting
- [ ] Add logging (Winston, Morgan)
- [ ] Add unit and integration tests
- [ ] API documentation with Swagger/OpenAPI
- [ ] Add pagination for user list
- [ ] Add user profile pictures
- [ ] Implement soft delete for users

## Troubleshooting

### Database connection failed
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if the database exists

### JWT token invalid
- Token may have expired (7-day expiration)
- Ensure token is sent in correct format: `Bearer <token>`

### Port already in use
- Change the `PORT` in `.env` file
- Or stop the process using the port

## License

ISC

## Support

For issues or questions, please create an issue in the repository.
