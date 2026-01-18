# Authentication & User Profile Guide

## Overview
This guide explains the authentication flow and user profile management in the CV Theque mobile app.

## Features Implemented

### 1. Authentication Guard on CV Upload
- **Requirement**: Users must be logged in to upload CVs
- **Implementation**: `mobile/app/upload.tsx`
  - Checks `isAuthenticated` from Redux auth state
  - Redirects to `/auth-modal` if not authenticated
  - Upload functionality only accessible to logged-in users

### 2. User Profile Dropdown (Avatar Menu)
- **Component**: `mobile/components/ui/UserAvatar.tsx`
- **Features**:
  - Displays user avatar with initials or profile picture
  - Dropdown menu with user information (name, email, role)
  - "View Profile" option - navigates to `/user-profile`
  - "Logout" option - clears auth state and redirects to auth modal
  
### 3. User Profile Screen
- **Screen**: `mobile/app/user-profile.tsx`
- **Features**:
  - View and edit user information:
    - First Name
    - Last Name
    - Email
    - Phone
  - Account information display:
    - Account Status (Active/Inactive)
    - Member Since date
    - User ID
  - Save button (only shown when changes are detected)
  - Success message after saving
  - Updates persisted to database via API
  - Local Redux state synchronized with database

### 4. CV Filtering by User
- **Backend**: Already implemented in `server/src/controllers/cv.controller.ts`
- Regular users (role: 'USER') automatically see only their own CVs
- Admins can see all CVs
- Filtering applied at database query level for security

## Authentication Flow

### Login Flow
1. User opens app → sees auth modal (if not logged in)
2. User enters credentials and clicks "Login"
3. API call to `/api/auth/login`
4. Success: 
   - Tokens stored in AsyncStorage
   - User data saved to Redux store
   - Navigate to main app
5. Failure: Error message displayed

### Upload Flow (Protected)
1. User clicks "Upload CV" tab
2. App checks `isAuthenticated` state
3. If not authenticated: Redirect to `/auth-modal`
4. If authenticated: Show upload screen
5. After successful upload: CV is tagged with `userId`
6. CV list automatically filtered to show only user's CVs

### Profile View/Edit Flow
1. User clicks avatar in header
2. Dropdown menu appears with options
3. User selects "View Profile"
4. Profile screen loads with current user data
5. User edits fields (first name, last name, email, phone)
6. Save button appears when changes detected
7. User clicks Save
8. API call to `/api/users/{userId}` with updated data
9. Success: Redux state updated, success message shown
10. Database and local state now synchronized

### Logout Flow
1. User clicks avatar → dropdown appears
2. User selects "Logout"
3. Redux `logOut` action dispatched
4. AsyncStorage cleared (tokens and user data)
5. Navigate to `/auth-modal`
6. User logged out completely

## API Endpoints Used

### Auth API (`mobile/lib/services/authApi.ts`)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Server-side logout

### User API (`mobile/lib/services/userApi.ts`)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/{id}` - Update user profile
- `POST /api/users/change-password` - Change password

### CV API (`mobile/lib/services/cvApi.ts`)
- `POST /api/cvs/upload` - Upload CV (requires auth)
- `GET /api/cvs` - List CVs (filtered by userId for regular users)
- `GET /api/cvs/{id}` - Get specific CV details
- `GET /api/cvs/{id}/extracted-data` - Get extracted CV data

## Redux State Management

### Auth Slice (`mobile/lib/slices/authSlice.ts`)
**State:**
```typescript
{
  user: User | null,      // Current logged-in user
  isAuthenticated: boolean, // Auth status
  isLoading: boolean,      // Loading state
  error: string | null     // Error messages
}
```

**User Interface:**
```typescript
{
  id: string,
  email: string,
  firstName: string,
  lastName: string,
  role: 'ADMIN' | 'MODERATOR' | 'USER',
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
  phone?: string,
  profilePicture?: string,
  createdAt: string,
  updatedAt: string
}
```

**Actions:**
- `setCredentials(user, accessToken, refreshToken)` - Save auth data
- `updateUser(userData)` - Update user data in state
- `logOut()` - Clear auth state
- `restoreSession(user, accessToken, refreshToken)` - Restore from storage
- `setLoading(boolean)` - Set loading state
- `setError(string)` - Set error message

## Security Features

### 1. Token-Based Authentication
- Access token (short-lived) for API requests
- Refresh token (long-lived) for renewing access
- Tokens stored securely in AsyncStorage
- Automatic token refresh on expiry

### 2. Protected Routes
- Upload screen checks authentication before allowing access
- CV list filtered by userId on backend
- Profile updates require valid authentication

### 3. Role-Based Access
- Regular users see only their own CVs
- Admins can see all CVs
- Role checked on every API request

## Testing the Flow

### Complete User Journey
1. **Open app** → Auth modal appears
2. **Register/Login** → Enter credentials
3. **Navigate to Upload** → Protected, requires auth
4. **Upload CV** → CV tagged with userId
5. **View CVs** → See only your uploaded CVs
6. **Click Avatar** → Dropdown menu appears
7. **View Profile** → See and edit your information
8. **Save Changes** → Database updated
9. **Logout** → Auth cleared, return to login

### Testing Authentication Guard
```typescript
// Try to access upload without login
// Expected: Redirected to /auth-modal

// Login first, then access upload
// Expected: Upload screen displayed
```

### Testing Profile Update
```typescript
// 1. Login
// 2. Click avatar → View Profile
// 3. Change first name from "John" to "Johnny"
// 4. Save button should appear
// 5. Click Save
// 6. Success message should appear
// 7. Navigate away and back
// 8. First name should still be "Johnny"
```

## File Structure

```
mobile/
├── app/
│   ├── auth-modal.tsx           # Login/Register screen
│   ├── upload.tsx               # CV upload (protected)
│   └── user-profile.tsx         # User profile view/edit
├── components/
│   └── ui/
│       ├── Header.tsx           # Main header with UserAvatar
│       └── UserAvatar.tsx       # Avatar dropdown component
└── lib/
    ├── services/
    │   ├── authApi.ts           # Auth API endpoints
    │   ├── userApi.ts           # User API endpoints
    │   └── cvApi.ts             # CV API endpoints
    └── slices/
        └── authSlice.ts         # Auth state management
```

## Future Enhancements

### Planned Features
1. **Profile Picture Upload**
   - Camera integration
   - Image picker
   - Upload to cloud storage
   - Display in avatar

2. **Password Change UI**
   - Current password verification
   - New password with strength indicator
   - Confirmation password
   - API integration ready

3. **Session Restore**
   - Check AsyncStorage on app launch
   - Auto-login if valid tokens exist
   - Silent token refresh

4. **Email Verification**
   - Verify email on registration
   - Resend verification email
   - Update email with re-verification

5. **Two-Factor Authentication**
   - SMS or authenticator app
   - Backup codes
   - Security settings page

## Troubleshooting

### Issue: Redirected to login after successful login
**Solution**: Check if tokens are being saved to AsyncStorage correctly
```typescript
// In authSlice.ts, verify setCredentials saves tokens
await AsyncStorage.setItem('accessToken', action.payload.accessToken);
```

### Issue: Profile changes not persisting
**Solution**: 
1. Check API response in network tab
2. Verify Redux state update in `updateUser` action
3. Check database update on backend

### Issue: Avatar not showing user initials
**Solution**: 
1. Check if user data is in Redux store
2. Verify `useSelector` is getting correct state
3. Check `getInitials()` function logic

### Issue: Can access upload without login
**Solution**: 
1. Verify authentication check in `upload.tsx`
2. Check `isAuthenticated` selector
3. Ensure `useEffect` redirect is working
