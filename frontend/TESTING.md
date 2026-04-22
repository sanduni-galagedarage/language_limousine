# Admin Authentication Testing Guide

## Overview

This guide explains how to test the admin authentication system that has been implemented.

## Prerequisites

1. Backend server running on `http://localhost:5000`
2. Frontend server running on `http://localhost:5173`
3. MongoDB database connected

## Testing Steps

### 1. Start the Backend Server

```bash
cd backend
npm install
npm start
```

### 2. Start the Frontend Server

```bash
cd frontend
npm install
npm run dev
```

### 3. Test Admin Registration

1. Navigate to `http://localhost:5173`
2. Click on "Admin Login" button in the navigation bar
3. Click "Don't have an account? Register" to switch to registration mode
4. Fill in the registration form:
   - Username: `testadmin`
   - Email: `testadmin@example.com`
   - Password: `password123`
   - Gender: `Male`
   - Role: `Admin` (pre-filled)
5. Click "Register"
6. You should be redirected to `/admin/admin-dashboard` after successful registration

### 4. Test Admin Login

1. Navigate to `http://localhost:5173/admin/login`
2. Fill in the login form:
   - Email: `testadmin@example.com`
   - Password: `password123`
3. Click "Login"
4. You should be redirected to `/admin/admin-dashboard` after successful login

### 5. Test Protected Routes

1. After logging in, try accessing these routes:

   - `/admin/admin-dashboard` ✅ Should work
   - `/admin/admin-users/greeters` ✅ Should work
   - `/admin/admin-users/drivers` ✅ Should work
   - `/admin/profile` ✅ Should work

2. Try accessing without being logged in:
   - You should be redirected to `/admin/login`

### 6. Test Logout

1. In the admin dashboard, click the "Logout" button
2. You should be redirected to `/admin/login`
3. Try accessing `/admin/admin-dashboard` again - should redirect to login

### 7. Test Token Persistence

1. Login as admin
2. Refresh the page
3. You should still be logged in and on the dashboard
4. Close the browser and reopen
5. You should be redirected to login (sessionStorage is cleared)

## API Endpoints Testing

### Using the Backend Test Script

```bash
cd backend
npm install axios
node test-api.js
```

This will test:

- Admin registration
- Admin login
- Get profile
- Update profile

## Expected Behavior

### Successful Registration

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "testadmin",
      "email": "testadmin@example.com",
      "role": "Admin",
      "gender": "Male",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

### Successful Login

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "username": "testadmin",
      "email": "testadmin@example.com",
      "role": "Admin",
      "gender": "Male",
      "isActive": true,
      "lastLogin": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

## Error Scenarios

### Invalid Credentials

- Wrong email/password should show error message
- Non-admin user trying to login should show "Access denied" error

### Validation Errors

- Missing required fields should show validation errors
- Invalid email format should show validation error
- Password too short should show validation error

### Unauthorized Access

- Accessing protected routes without token should redirect to login
- Accessing with invalid token should redirect to login

## Troubleshooting

### Common Issues

1. **CORS Error**: Make sure backend CORS is configured for `http://localhost:5173`
2. **Database Connection**: Ensure MongoDB is running and connected
3. **Port Conflicts**: Check if ports 5000 and 5173 are available
4. **Token Issues**: Clear browser sessionStorage if tokens are corrupted

### Debug Steps

1. Check browser console for errors
2. Check backend console for errors
3. Verify API endpoints are responding correctly
4. Check network tab for failed requests

## Security Features

- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Input validation
- ✅ Role-based access control
- ✅ Protected routes
- ✅ Token expiration (7 days)
- ✅ Secure session management

## Files Created/Modified

### Backend

- `controllers/adminController.js` - Admin authentication logic
- `middleware/auth.js` - JWT authentication middleware
- `routes/auth.js` - Authentication routes
- `index.js` - Updated to include auth routes
- `README.md` - API documentation

### Frontend

- `components/Components/AdminAuth.jsx` - Admin login/register component
- `components/ProtectedRoute.jsx` - Route protection component
- `App.jsx` - Updated with new routes
- `components/Components/Navigationbar.jsx` - Added admin login link
- `pages/admin/pages/Dashboard.jsx` - Added logout functionality
