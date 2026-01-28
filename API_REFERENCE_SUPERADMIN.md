# 📡 Superadmin API Reference

## Authentication
All endpoints require authentication via Bearer token with `role: SUPERADMIN`.

```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### 1. Bulk Upload CVs
Upload multiple CVs without user account association.

**Endpoint:** `POST /api/cvs/bulk-upload`
**Access:** Superadmin only
**Content-Type:** `multipart/form-data`

**Request:**
```bash
curl -X POST http://localhost:3000/api/cvs/bulk-upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "cvs=@cv1.pdf" \
  -F "cvs=@cv2.pdf" \
  -F "cvs=@cv3.docx"
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk upload completed: 3 CVs queued, 0 failed",
  "data": {
    "total": 3,
    "queued": 3,
    "failed": 0,
    "results": [
      {
        "fileName": "cv1.pdf",
        "cvId": "uuid-1",
        "status": "queued"
      },
      {
        "fileName": "cv2.pdf",
        "cvId": "uuid-2",
        "status": "queued"
      },
      {
        "fileName": "cv3.docx",
        "cvId": "uuid-3",
        "status": "queued"
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Access denied",
  "message": "Only superadmins can bulk upload CVs"
}
```

---

### 2. List CVs with Filters
Get paginated list of CVs with optional source filtering.

**Endpoint:** `GET /api/cvs`
**Access:** Authenticated users (visibility depends on role)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string, optional)
- `status` (enum, optional): PENDING | PROCESSING | COMPLETED | FAILED
- `source` (enum, superadmin only): USER_UPLOAD | SUPERADMIN_BULK
- `sortBy` (string, default: 'createdAt')
- `sortOrder` (string, default: 'desc')

**Request:**
```bash
# All CVs
curl http://localhost:3000/api/cvs \
  -H "Authorization: Bearer YOUR_TOKEN"

# Only bulk uploads
curl http://localhost:3000/api/cvs?source=SUPERADMIN_BULK \
  -H "Authorization: Bearer YOUR_TOKEN"

# Completed user uploads
curl "http://localhost:3000/api/cvs?source=USER_UPLOAD&status=COMPLETED" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cv-uuid",
      "userId": null,
      "source": "SUPERADMIN_BULK",
      "status": "COMPLETED",
      "originalFileName": "john_doe_cv.pdf",
      "extractedData": {
        "personalInfo": {
          "fullName": "John Doe",
          "email": "john@example.com"
        },
        "totalExperienceYears": 5,
        "seniorityLevel": "Senior"
      },
      "metadata": {
        "source": "SUPERADMIN_BULK"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasMore": true
  }
}
```

---

### 3. Update CV Extracted Data
Manually edit extracted CV information.

**Endpoint:** `PUT /api/cvs/:id/extracted-data`
**Access:** Superadmin only
**Content-Type:** `application/json`

**Request:**
```bash
curl -X PUT http://localhost:3000/api/cvs/CV_UUID/extracted-data \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+33 6 12 34 56 78",
    "city": "Paris",
    "country": "France",
    "age": 32,
    "totalExperienceYears": 8,
    "seniorityLevel": "Senior",
    "industry": "Technology"
  }'
```

**Editable Fields:**
- `fullName` (string)
- `email` (string)
- `phone` (string)
- `location` (string)
- `city` (string)
- `country` (string)
- `age` (number)
- `gender` (string)
- `education` (array)
- `experience` (array)
- `skills` (object: {technical, soft, tools})
- `languages` (array)
- `certifications` (array)
- `internships` (array)
- `totalExperienceYears` (number)
- `seniorityLevel` (string)
- `industry` (string)
- `keywords` (array)

**Response:**
```json
{
  "success": true,
  "message": "CV data updated successfully",
  "data": {
    "personalInfo": {
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+33 6 12 34 56 78",
      "city": "Paris",
      "country": "France"
    },
    "age": 32,
    "totalExperienceYears": 8,
    "seniorityLevel": "Senior",
    "industry": "Technology"
  }
}
```

---

### 4. Assign CVs to Consultant
Assign CVs to a consultant with flexible filtering options.

**Endpoint:** `POST /api/cvs/assign-to-consultant`
**Access:** Superadmin only
**Content-Type:** `application/json`

#### Option A: Assign by CV
Select individual CVs directly.

**Request:**
```bash
curl -X POST http://localhost:3000/api/cvs/assign-to-consultant \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "consultantId": "consultant-user-uuid",
    "assignmentType": "cv",
    "cvIds": ["cv-uuid-1", "cv-uuid-2", "cv-uuid-3"],
    "name": "Frontend Developers Q1 2026",
    "description": "Candidates for frontend positions",
    "expiresAt": "2026-03-31T23:59:59Z"
  }'
```

#### Option B: Assign by User Profile
Select users, automatically includes all their CVs.

**Request:**
```bash
curl -X POST http://localhost:3000/api/cvs/assign-to-consultant \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "consultantId": "consultant-user-uuid",
    "assignmentType": "user-profile",
    "userIds": ["user-uuid-1", "user-uuid-2"],
    "name": "Experienced Developers",
    "description": "Senior profiles for new project"
  }'
```

**Request Body:**
- `consultantId` (string, required): User ID of the consultant
- `assignmentType` (enum, required): `cv` | `user-profile`
- `cvIds` (array, required for CV mode): Array of CV UUIDs
- `userIds` (array, required for User Profile mode): Array of user UUIDs
- `name` (string, optional): Name for the CV list
- `description` (string, optional): Description of the assignment
- `expiresAt` (ISO date, optional): Expiration date for the share

**Response:**
```json
{
  "success": true,
  "message": "5 CVs assigned to consultant",
  "data": {
    "listId": "list-uuid",
    "consultantId": "consultant-uuid",
    "assignmentType": "cv",
    "cvCount": 5
  }
}
```

---

### 5. Get CV Statistics
Get aggregate CV statistics (admin+).

**Endpoint:** `GET /api/cvs/statistics`
**Access:** Admin or higher

**Request:**
```bash
curl http://localhost:3000/api/cvs/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "byStatus": {
      "COMPLETED": 120,
      "PROCESSING": 15,
      "PENDING": 10,
      "FAILED": 5
    }
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 422 | Validation Error - Invalid data format |
| 500 | Internal Server Error |

**Example Error:**
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "cvIds must be a non-empty array for CV assignment",
  "errors": {
    "cvIds": ["Required field missing"]
  }
}
```

---

## Rate Limits

- Bulk upload: Max 10 files per request
- List endpoint: Max 100 items per page
- No rate limiting on other endpoints (subject to change)

---

## Audit Logging

All superadmin actions are logged:
- Bulk uploads
- CV data updates
- Consultant assignments
- CV deletions

Audit logs include:
- User ID
- Action type
- Resource ID
- Timestamp
- IP address
- Details object

---

## Mobile SDK Usage

### RTK Query Hooks

```typescript
import {
  useListCVsQuery,
  useBulkUploadCVsMutation,
  useUpdateCVExtractedDataMutation,
  useAssignCVsToConsultantMutation,
} from '@/lib/services/cvApi';

// List CVs with filtering
const { data, isLoading } = useListCVsQuery({
  source: CVSource.SUPERADMIN_BULK,
  status: CVStatus.COMPLETED,
  page: 1,
  limit: 20,
});

// Bulk upload
const [bulkUpload, { isLoading }] = useBulkUploadCVsMutation();
await bulkUpload(formData);

// Update CV data
const [updateCV] = useUpdateCVExtractedDataMutation();
await updateCV({
  id: cvId,
  data: { fullName: 'New Name' }
});

// Assign to consultant
const [assignCVs] = useAssignCVsToConsultantMutation();
await assignCVs({
  consultantId: 'uuid',
  assignmentType: 'cv',
  cvIds: ['uuid1', 'uuid2']
});
```

---

## TypeScript Types

```typescript
// CV Source
enum CVSource {
  USER_UPLOAD = 'USER_UPLOAD',
  SUPERADMIN_BULK = 'SUPERADMIN_BULK',
}

// CV Status
enum CVStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ARCHIVED = 'ARCHIVED',
}

// Assignment Types
type AssignmentType = 'cv' | 'user-profile';

// Bulk Upload Result
interface BulkUploadResult {
  total: number;
  queued: number;
  failed: number;
  results: Array<{
    fileName: string;
    cvId?: string;
    status: string;
    error?: string;
  }>;
}
```

---

**Version**: 1.0.0
**Last Updated**: January 28, 2026
