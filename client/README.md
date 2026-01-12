# CVTech Client

A modern, scalable Next.js application for CV management with AI-powered extraction.

## Features

- ✅ **Authentication System**: Login, Register, and Password Reset modals
- ✅ **Redux Toolkit**: State management with RTK Query for API calls
- ✅ **Modular Architecture**: Clean separation of concerns
- ✅ **TypeScript**: Full type safety across the application
- ✅ **Responsive Design**: Mobile-first approach with Tailwind CSS
- ✅ **Admin Dashboard**: User management, CV management, and system settings
- ✅ **Internationalization**: Support for multiple languages (EN, FR, AR)

## Tech Stack

- **Framework**: Next.js 15.5.2
- **State Management**: Redux Toolkit + RTK Query
- **UI Components**: Radix UI + Tailwind CSS
- **Forms**: Formik + Yup
- **Icons**: Lucide React
- **Notifications**: Sonner

## Project Structure

```
client/
├── app/                      # Next.js app directory
│   ├── [locale]/            # Internationalized routes
│   │   ├── admin/           # Admin pages
│   │   ├── cvs/             # CV management pages
│   │   ├── profile/         # User profile pages
│   │   ├── layout.tsx       # Locale layout with Header/Footer
│   │   └── page.tsx         # Home page
│   ├── globals.css          # Global styles
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── admin/              # Admin components
│   │   ├── AdminDashboard.tsx
│   │   └── UserManagement.tsx
│   ├── home/               # Home page components
│   │   └── HomePage.tsx
│   ├── layout/             # Layout components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── modals/             # Modal components
│   │   ├── LoginModal.tsx
│   │   ├── RegisterModal.tsx
│   │   ├── ForgotPasswordModal.tsx
│   │   └── ModalContainer.tsx
│   └── ui/                 # Reusable UI components
│       ├── button.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       └── ...
├── lib/                    # Core utilities
│   ├── api/
│   │   └── baseQuery.ts   # RTK Query base configuration
│   ├── services/          # API services
│   │   ├── authApi.ts
│   │   ├── userApi.ts
│   │   ├── cvApi.ts
│   │   ├── adminApi.ts
│   │   └── llmConfigApi.ts
│   ├── slices/            # Redux slices
│   │   ├── authSlice.ts
│   │   └── uiSlice.ts
│   ├── store.ts           # Redux store configuration
│   ├── utils.ts           # Utility functions
│   └── validationSchemas.ts
├── types/                 # TypeScript type definitions
│   ├── auth.types.ts
│   ├── user.types.ts
│   ├── cv.types.ts
│   ├── admin.types.ts
│   └── llm.types.ts
├── i18n/                  # Internationalization
│   ├── navigation.ts
│   ├── request.ts
│   └── routing.ts
└── messages/              # Translation files
    ├── en.json
    ├── fr.json
    └── ar.json
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Running backend server (default: http://localhost:12000)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env.local` file:
```env
NEXT_PUBLIC_SERVER_DOMAIN=http://localhost:12000
NEXT_PUBLIC_APP_NAME=CVTech
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## API Services

### Authentication API (`authApi`)
- `register`: Create new user account
- `login`: Authenticate user
- `logout`: End user session
- `refreshToken`: Refresh access token
- `getCurrentUser`: Get authenticated user data
- `requestPasswordReset`: Request password reset email
- `resetPassword`: Reset password with token
- `verifyEmail`: Verify email address

### User API (`userApi`)
- `getProfile`: Get user profile
- `updateProfile`: Update user profile
- `updateAvatar`: Update user avatar
- `changePassword`: Change user password
- `deleteAccount`: Delete user account

### CV API (`cvApi`)
- `uploadCV`: Upload new CV file
- `listCVs`: Get list of CVs with filters
- `getCVById`: Get CV details
- `getCVExtractedData`: Get extracted CV data
- `updateCV`: Update CV metadata
- `deleteCV`: Delete CV
- `reprocessCV`: Reprocess CV with AI
- `downloadCV`: Download original CV file
- `exportCV`: Export CV data (JSON/PDF)

### Admin API (`adminApi`)
- `getDashboardStats`: Get system statistics
- `listUsers`: Get users with filters
- `getUserById`: Get user details
- `updateUserRole`: Update user role
- `updateUserStatus`: Update user status
- `deleteUser`: Delete user account
- `getAuditLogs`: Get system audit logs
- `getSystemSettings`: Get system settings
- `updateSystemSetting`: Update system setting
- `healthCheck`: Check system health

### LLM Config API (`llmConfigApi`)
- `listLLMConfigs`: Get LLM configurations
- `getLLMConfigById`: Get specific LLM config
- `createLLMConfig`: Create new LLM config
- `updateLLMConfig`: Update LLM config
- `deleteLLMConfig`: Delete LLM config
- `testLLMConfig`: Test LLM configuration
- `setActiveLLMConfig`: Set active LLM provider

## Redux State Management

### Auth Slice
```typescript
{
  user: User | null,
  isAuthenticated: boolean,
  isLoginOpen: boolean,
  isRegisterOpen: boolean,
  isForgotPasswordOpen: boolean,
  status: 'idle' | 'loading' | 'success' | 'error',
  error: string | null
}
```

### UI Slice
```typescript
{
  sidebarOpen: boolean,
  theme: 'light' | 'dark' | 'system',
  locale: string
}
```

## Authentication Flow

1. User clicks "Sign In" button in Header
2. Login modal opens via Redux action `openLoginModal()`
3. User submits credentials
4. `useLoginMutation` sends request to `/api/auth/login`
5. On success:
   - JWT tokens stored in httpOnly cookies (by backend)
   - User data stored in Redux via `setCredentials()`
   - Modal closes and user is redirected
6. Authenticated requests automatically include cookies
7. On 401 error, token refresh is attempted automatically

## Key Features

### Minimalist Design
- Clean, modern UI with Tailwind CSS
- Consistent spacing and typography
- Accessible components from Radix UI
- Responsive design for all screen sizes

### Modular Architecture
- Components are self-contained and reusable
- API services use RTK Query for caching and optimization
- Type-safe throughout with TypeScript
- Separation of concerns (UI, logic, state)

### Security
- HttpOnly cookies for token storage
- Automatic token refresh
- CSRF protection
- Role-based access control (RBAC)

### Performance
- Automatic code splitting
- Optimized images with Next.js Image
- API response caching with RTK Query
- Debounced search inputs

## User Roles

- **USER**: Standard user with CV management access
- **MODERATOR**: Can manage CVs and view analytics
- **ADMIN**: Full system access except superadmin functions
- **SUPERADMIN**: Complete system control

## Development Guidelines

### Adding a New Page
1. Create page in `app/[locale]/your-page/page.tsx`
2. Add route protection if needed
3. Create components in `components/your-feature/`
4. Add translations to `messages/*.json`

### Adding a New API Service
1. Define types in `types/your-feature.types.ts`
2. Create service in `lib/services/yourFeatureApi.ts`
3. Add to store in `lib/store.ts`
4. Use hooks in components

### Adding a New UI Component
1. Create in `components/ui/your-component.tsx`
2. Use Radix UI primitives where possible
3. Style with Tailwind CSS
4. Export from component file

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NEXT_PUBLIC_SERVER_DOMAIN | Backend API URL | http://localhost:12000 |
| NEXT_PUBLIC_APP_NAME | Application name | CVTech |
| NEXT_PUBLIC_APP_URL | Frontend URL | http://localhost:3000 |

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code structure
2. Use TypeScript for all new code
3. Add proper type definitions
4. Test all new features
5. Follow the component naming conventions

## License

Proprietary - All rights reserved
