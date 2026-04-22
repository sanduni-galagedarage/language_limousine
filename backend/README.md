# Backend API Documentation

## Authentication Endpoints

### Base URL

```
http://localhost:5000/api/auth
```

### 1. Admin Registration

**POST** `/register`

Register a new admin user.

**Request Body:**

```json
{
  "username": "admin123",
  "email": "admin@example.com",
  "password": "password123",
  "gender": "Male",
  "role": "Admin"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "admin123",
      "email": "admin@example.com",
      "role": "Admin",
      "gender": "Male",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

### 2. Admin Login

**POST** `/login`

Login as an admin user.

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "username": "admin123",
      "email": "admin@example.com",
      "role": "Admin",
      "gender": "Male",
      "isActive": true,
      "lastLogin": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

### 3. Get Admin Profile

**GET** `/profile`

Get the current admin's profile information.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "admin123",
      "email": "admin@example.com",
      "role": "Admin",
      "gender": "Male",
      "isActive": true,
      "lastLogin": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 4. Update Admin Profile

**PUT** `/profile`

Update the current admin's profile information.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "username": "newadmin123",
  "email": "newadmin@example.com",
  "gender": "Female"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "newadmin123",
      "email": "newadmin@example.com",
      "role": "Admin",
      "gender": "Female",
      "isActive": true,
      "lastLogin": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 5. Admin-Only User Registration

**POST** `/admin/register`

Register a new user (admin only).

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123",
  "gender": "Male",
  "role": "Driver"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "user123",
      "email": "user@example.com",
      "role": "Driver",
      "gender": "Male",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

## Error Responses

### Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "Username must be at least 3 characters long",
      "path": "username",
      "location": "body"
    }
  ]
}
```

### Authentication Error

```json
{
  "success": false,
  "message": "Access token required"
}
```

### Authorization Error

```json
{
  "success": false,
  "message": "Access denied. Admin privileges required"
}
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/language-limousine
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:5173
```

## Installation and Setup

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables in `.env` file

3. Start the server:

```bash
npm start
```

The server will run on `http://localhost:5000` by default.
