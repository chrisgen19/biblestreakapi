# Bible Streak API

A RESTful API built with Express.js, PostgreSQL, Prisma ORM, and Passport.js for user authentication and management.

## Features

- User registration and authentication
- JWT-based authorization
- Password hashing with bcryptjs
- Input validation with express-validator
- CORS enabled for frontend integration
- **Prisma ORM** for type-safe database access
- Automated database migrations
- PostgreSQL database
- Secure API endpoints

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Prisma** - Modern ORM with type safety
- **Passport.js** - Authentication middleware
- **JWT** - JSON Web Tokens for authorization
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## Project Structure

```
biblestreakapi/
├── config/
│   ├── prisma.js             # Prisma client instance
│   └── passport.js           # Passport JWT strategy configuration
├── middleware/
│   └── auth.js               # Authentication middleware
├── prisma/
│   ├── schema.prisma         # Prisma schema definition
│   └── migrations/           # Database migrations
├── routes/
│   ├── auth.js               # Register & Login endpoints
│   └── users.js              # User CRUD endpoints
├── .env                      # Environment variables
├── .gitignore                # Git ignore file
├── index.js                  # Main application entry point
├── package.json              # Dependencies and scripts
├── prisma.config.ts          # Prisma configuration
└── README.md                 # Documentation
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

5. **Run Prisma migrations**:
   ```bash
   npm run prisma:migrate
   ```

   This will create all necessary tables in your database.

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

## Prisma Commands

- **Run migrations**: `npm run prisma:migrate`
- **Generate Prisma Client**: `npm run prisma:generate`
- **Open Prisma Studio** (Database GUI): `npm run prisma:studio`
- **Reset database**: `npm run prisma:reset`

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
  "firstName": "John",
  "lastName": "Doe",
  "address": "123 Main St",
  "country": "USA",
  "gender": "male",
  "birthday": "1990-01-15"
}
```

**Required fields**: `email`, `password`, `firstName`, `lastName`
**Optional fields**: `address`, `country`, `gender`, `birthday`

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main St",
    "country": "USA",
    "gender": "male",
    "birthday": "1990-01-15T00:00:00.000Z",
    "createdAt": "2025-11-11T10:30:00.000Z"
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
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main St",
    "country": "USA",
    "gender": "male",
    "birthday": "1990-01-15T00:00:00.000Z"
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
      "firstName": "John",
      "lastName": "Doe",
      "address": "123 Main St",
      "country": "USA",
      "gender": "male",
      "birthday": "1990-01-15T00:00:00.000Z",
      "createdAt": "2025-11-11T10:30:00.000Z",
      "updatedAt": "2025-11-11T10:30:00.000Z"
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
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main St",
    "country": "USA",
    "gender": "male",
    "birthday": "1990-01-15T00:00:00.000Z",
    "createdAt": "2025-11-11T10:30:00.000Z",
    "updatedAt": "2025-11-11T10:30:00.000Z"
  }
}
```

#### Update user
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Updated",
  "email": "newemail@example.com",
  "password": "newpassword123",
  "address": "456 New St",
  "country": "Canada",
  "gender": "male",
  "birthday": "1990-01-15"
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
    "firstName": "John",
    "lastName": "Updated",
    "address": "456 New St",
    "country": "Canada",
    "gender": "male",
    "birthday": "1990-01-15T00:00:00.000Z",
    "updatedAt": "2025-11-11T12:00:00.000Z"
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

### User Model (Prisma Schema)

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  firstName String   @map("first_name")
  lastName  String   @map("last_name")
  address   String?
  country   String?
  gender    String?
  birthday  DateTime?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}
```

### Database Table

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | SERIAL | No | Auto-increment | Primary key |
| email | VARCHAR | No | - | Unique email address |
| password | VARCHAR | No | - | Hashed password |
| first_name | VARCHAR | No | - | User's first name |
| last_name | VARCHAR | No | - | User's last name |
| address | VARCHAR | Yes | NULL | User's address |
| country | VARCHAR | Yes | NULL | User's country |
| gender | VARCHAR | Yes | NULL | User's gender (male/female/other) |
| birthday | TIMESTAMP | Yes | NULL | User's birthday |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | No | CURRENT_TIMESTAMP | Last update time |

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
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **Type Safety**: Prisma provides compile-time type checking
- **CORS**: Cross-Origin Resource Sharing enabled for frontend integration
- **Environment Variables**: Sensitive data stored in .env file

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"password123",
    "firstName":"Test",
    "lastName":"User",
    "address":"123 Test St",
    "country":"USA",
    "gender":"male",
    "birthday":"1990-01-15"
  }'
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
  -d '{"firstName":"Updated","lastName":"Name"}'
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

## Using Prisma Studio

Prisma Studio is a visual database browser that comes with Prisma. To use it:

```bash
npm run prisma:studio
```

This will open a browser window where you can:
- View all your data
- Create, update, and delete records
- Filter and search data
- See relationships between models

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
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:reset` - Reset database and run all migrations
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

2. **Run Prisma migrations**:
   ```bash
   npm run prisma:migrate
   ```

3. **Use a process manager** (e.g., PM2):
   ```bash
   npm install -g pm2
   pm2 start index.js --name biblestreak-api
   ```

4. **Enable HTTPS** using a reverse proxy (nginx, Apache, or cloud provider)

5. **Set up environment-specific CORS** in production

## Prisma Benefits

- ✅ **Type Safety**: Auto-generated TypeScript types
- ✅ **Auto-completion**: Full IDE support
- ✅ **Migration System**: Version-controlled database changes
- ✅ **Prisma Studio**: Built-in database GUI
- ✅ **Query Optimization**: Efficient SQL generation
- ✅ **Readable Queries**: Clean, intuitive syntax
- ✅ **No SQL Injection**: Parameterized queries by default

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

### Prisma Client not found
- Run `npm run prisma:generate` to generate the client

### Migration failed
- Check database connection
- Ensure database user has proper permissions
- Review migration files in `prisma/migrations/`

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
