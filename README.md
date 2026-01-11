# CVTHEQUE - Enterprise CV Management Platform

A production-ready, enterprise-grade CV/Resume management system with AI-powered data extraction, multi-provider LLM support, and comprehensive role-based access control.

## 🚀 Features

### Core Functionality
- **CV Upload & Processing** - Support for PDF, DOCX, and image formats
- **AI Data Extraction** - Intelligent extraction using Google Gemini, OpenAI, or Grok
- **Photo Extraction** - Automatic profile photo extraction and optimization
- **Multi-Provider LLM** - Pluggable architecture supporting multiple AI providers
- **Advanced Search** - Search and filter CVs by skills, experience, location, and more

### Security & Access Control
- **JWT Authentication** - Secure token-based authentication with refresh tokens
- **Role-Based Access** - Four-tier permission system (Superadmin, Admin, Moderator, User)
- **Audit Logging** - Comprehensive activity tracking
- **Rate Limiting** - Protection against abuse
- **Input Validation** - Zod-based validation for all endpoints

### Storage & Integration
- **Google Drive Integration** - Secure document storage
- **Cloudinary Integration** - Profile photo hosting and optimization
- **MySQL Database** - Production-ready relational database

### Developer Experience
- **TypeScript** - Full type safety
- **RESTful API** - Clean, well-documented endpoints
- **Swagger Documentation** - Interactive API docs at `/api-docs`
- **Comprehensive Testing** - Integration and E2E tests
- **Error Handling** - Consistent error responses

## 📋 Prerequisites

- **Node.js** >= 20.0.0
- **MySQL** >= 8.0
- **npm** 

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone .
cd server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up MySQL Database

```bash
mysql -u root -p

CREATE DATABASE cvtech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Required Configuration:**

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cvtech
DB_USER=root
DB_PASSWORD=your_password

# JWT Secrets (change these!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32

# Superadmin Credentials
SUPERADMIN_EMAIL=admin@cvtech.com
SUPERADMIN_PASSWORD=ChangeMe123!
```

**Optional Configuration:**

```env
# Google Drive (for CV storage)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=your-folder-id

# Cloudinary (for photo storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# LLM Providers (at least one required for AI extraction)
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
GROK_API_KEY=your-grok-api-key
DEFAULT_LLM_PROVIDER=gemini
```

### 5. Initialize Database

```bash
npm run db:seed
```

This creates:
- The superadmin user
- Default LLM configurations
- Database schema

### 6. Start the Server

```bash
# Development with hot reload
npm run dev

# Production
npm run build
npm start
```

Server will start on:
- HTTP: `http://localhost:12000`
- HTTPS: `https://localhost:12001` (if SSL certs configured)
- API Docs: `http://localhost:12000/api-docs`

## 📚 API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {...},
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "15m"
  }
}
```

### CV Management

#### Upload CV
```http
POST /api/cvs/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

cv: [binary file]
```

#### List CVs
```http
GET /api/cvs?page=1&limit=20&status=COMPLETED
Authorization: Bearer {token}
```

#### Get CV Details
```http
GET /api/cvs/{id}
Authorization: Bearer {token}
```

#### Delete CV
```http
DELETE /api/cvs/{id}
Authorization: Bearer {token}
```

### User Management (Admin)

#### List Users
```http
GET /api/users?role=USER&status=ACTIVE
Authorization: Bearer {admin_token}
```

#### Create User
```http
POST /api/users
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "Password123!",
  "firstName": "New",
  "lastName": "User",
  "role": "USER"
}
```

#### Update User Role
```http
PATCH /api/users/{id}/role
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "role": "MODERATOR"
}
```

### Admin Dashboard

#### Get Statistics
```http
GET /api/admin/dashboard
Authorization: Bearer {admin_token}
```

#### Get Audit Logs
```http
GET /api/admin/audit-logs?action=LOGIN&page=1&limit=50
Authorization: Bearer {admin_token}
```

## 🧪 Testing

See [TESTING.md](./TESTING.md) for comprehensive testing documentation.

### Quick Start

```bash
# Setup test database
npm run db:setup

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 🏗️ Architecture

### Project Structure

```
server/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── index.ts               # Server entry point
│   ├── config/                # Configuration
│   │   ├── database.ts        # Database setup
│   │   └── index.ts           # Environment config
│   ├── controllers/           # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── cv.controller.ts
│   │   ├── user.controller.ts
│   │   ├── admin.controller.ts
│   │   └── llmConfig.controller.ts
│   ├── middleware/            # Express middleware
│   │   ├── auth.ts            # JWT authentication
│   │   ├── authorize.ts       # Role-based access control
│   │   ├── validate.ts        # Input validation
│   │   ├── errorHandler.ts    # Error handling
│   │   ├── upload.ts          # File upload
│   │   └── audit.ts           # Audit logging
│   ├── models/                # Sequelize models
│   │   ├── User.ts
│   │   ├── CV.ts
│   │   ├── CVExtractedData.ts
│   │   ├── LLMConfiguration.ts
│   │   ├── AuditLog.ts
│   │   └── SystemSettings.ts
│   ├── routes/                # API routes
│   │   ├── auth.routes.ts
│   │   ├── cv.routes.ts
│   │   ├── user.routes.ts
│   │   ├── admin.routes.ts
│   │   └── llmConfig.routes.ts
│   ├── services/              # Business logic
│   │   ├── cvProcessor.ts     # CV processing pipeline
│   │   ├── llm/               # LLM integrations
│   │   │   ├── gemini.ts
│   │   │   ├── openai.ts
│   │   │   ├── grok.ts
│   │   │   └── prompts.ts
│   │   ├── parsing/           # Document parsing
│   │   │   ├── textExtractor.ts
│   │   │   └── photoExtractor.ts
│   │   └── storage/           # Storage integrations
│   │       ├── googleDrive.ts
│   │       └── cloudinary.ts
│   ├── types/                 # TypeScript types
│   │   └── index.ts
│   └── utils/                 # Utilities
│       └── logger.ts          # Winston logger
├── tests/                     # Test files
│   ├── integration.test.ts
│   └── e2e.test.ts
└── uploads/                   # Temporary upload directory
```

### Database Schema

**Users Table:**
- User authentication and profile data
- Roles: SUPERADMIN, ADMIN, MODERATOR, USER
- Statuses: ACTIVE, INACTIVE, SUSPENDED, PENDING

**CVs Table:**
- Uploaded document metadata
- Processing status tracking
- Links to Google Drive storage

**CV Extracted Data Table:**
- Structured data extracted by AI
- Personal info, education, experience, skills
- Searchable metadata

**LLM Configurations Table:**
- Multi-provider AI configurations
- Model parameters and prompts

**Audit Logs Table:**
- All user actions and system events
- IP addresses and user agents

## 🔐 Security

### Authentication Flow

1. User registers/logs in
2. Server generates JWT access token (15min) and refresh token (7 days)
3. Access token used for API requests
4. Refresh token used to obtain new access tokens
5. All tokens revoked on logout

### Authorization Levels

| Role       | Permissions |
|------------|-------------|
| USER       | Own CV management, profile updates |
| MODERATOR  | View all users, reprocess CVs |
| ADMIN      | User management, system settings |
| SUPERADMIN | Full system access, LLM configuration |

### Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT token expiration and refresh
- ✅ Rate limiting (100 req/15min by default)
- ✅ Input validation with Zod
- ✅ SQL injection protection (Sequelize ORM)
- ✅ XSS protection (Helmet)
- ✅ CORS configuration
- ✅ Audit logging
- ✅ HTTPS support

## 🚀 Deployment

### Environment Variables

Ensure all required environment variables are set:
- Database credentials
- JWT secrets (strong, random values)
- LLM API keys (at least one provider)
- External service credentials

### Production Checklist

- [ ] Change default superadmin password
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Configure log rotation
- [ ] Set up monitoring (health endpoint: `/health`)
- [ ] Configure rate limiting for your traffic
- [ ] Set up external storage (Google Drive, Cloudinary)

### Docker Deployment (Optional)

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 12000

CMD ["npm", "start"]
```

### PM2 (Process Manager)

```bash
npm install -g pm2

pm2 start npm --name "cvtech" -- start
pm2 save
pm2 startup
```

## 📊 Monitoring

### Health Check

```http
GET /health
```

Returns:
```json
{
  "status": "ok",
  "timestamp": "2025-01-11T10:30:00.000Z"
}
```

### Logs

Application logs are stored in:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- `logs/exceptions.log` - Uncaught exceptions
- `logs/rejections.log` - Unhandled promise rejections

### Code Standards

- Use TypeScript
- Follow existing code style
- Add tests for new features
- Update documentation
- Maintain >80% test coverage


## 🙏 Acknowledgments

- Google Gemini for AI extraction
- OpenAI for alternative LLM support
- Cloudinary for image optimization
- Google Drive for document storage

---


