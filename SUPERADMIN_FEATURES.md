# Superadmin Features Implementation Guide

## 🎯 Overview
This implementation adds comprehensive superadmin functionality to the CVthèque platform, enabling bulk CV management, advanced filtering, and consultant assignment.

## 🔑 Key Features Implemented

### 1️⃣ **Bulk CV Upload (Superadmin Only)**
- **Endpoint**: `POST /api/cvs/bulk-upload`
- **Description**: Upload multiple CVs without user account association
- **Access**: Superadmin only
- **Features**:
  - Upload up to 10 CVs simultaneously
  - Automatic processing pipeline (extraction, normalization, indexing)
  - No user association (userId is NULL)
  - Source tracking: `SUPERADMIN_BULK`

**Mobile Screen**: `/app/admin/bulk-upload.tsx`
- Drag-and-drop file selection
- Progress tracking
- Result summary with success/failure counts

---

### 2️⃣ **Enhanced CV List with Source Filtering**
- **Endpoint**: `GET /api/cvs?source=USER_UPLOAD|SUPERADMIN_BULK`
- **Description**: View all CVs with filtering by upload source
- **Access Levels**:
  - **Superadmin**: See ALL CVs (user uploads + bulk uploads)
  - **Admin/Moderator**: See only user-uploaded CVs
  - **User**: See only their own CVs

**Mobile Screen**: `/app/admin/cv-list.tsx`
- Filter by status (Pending, Processing, Completed, Failed)
- Filter by source (User Upload, Bulk Upload)
- Search functionality
- Pagination
- Real-time statistics

---

### 3️⃣ **CV Data Editing (Superadmin Only)**
- **Endpoint**: `PUT /api/cvs/:id/extracted-data`
- **Description**: Manually edit extracted CV information
- **Access**: Superadmin only
- **Editable Fields**:
  - Personal info (name, email, phone, location)
  - Professional info (experience years, seniority, industry)
  - Skills, education, certifications (future enhancement)

**Mobile Screen**: `/app/admin/edit-cv/[id].tsx`
- Form-based editing
- Real-time validation
- Preserves original file archive

---

### 4️⃣ **Consultant Assignment with Filters**
- **Endpoint**: `POST /api/cvs/assign-to-consultant`
- **Description**: Assign CVs to consultants with flexible filtering
- **Assignment Types**:
  - **By CV**: Select individual CVs directly
  - **By User Profile**: Select users, assigns all their CVs

**Mobile Screen**: `/app/admin/consultant-assignment.tsx`
- Toggle between CV and User Profile modes
- Multi-selection interface
- Optional list naming
- Expiration date support

---

## 📊 Database Changes

### CV Model Updates
```typescript
// New field: source
source: CVSource (USER_UPLOAD | SUPERADMIN_BULK)

// Modified field: userId
userId?: string | null  // Nullable for bulk uploads
```

### Migration
**File**: `server/src/migrations/20260128-add-cv-source-field.ts`
- Adds `source` enum column
- Makes `userId` nullable
- Sets default source to `USER_UPLOAD`
- Handles existing records gracefully

**To run migration:**
```bash
cd server
npm run migrate
```

---

## 🔐 Security & Permissions

### Role Hierarchy
```
SUPERADMIN > ADMIN > MODERATOR > USER
```

### Access Control Matrix

| Feature | Superadmin | Admin | Moderator | User |
|---------|-----------|-------|-----------|------|
| Bulk Upload CVs | ✅ | ❌ | ❌ | ❌ |
| View All CVs | ✅ | ✅ (user CVs only) | ✅ (user CVs only) | ❌ |
| Edit CV Data | ✅ | ❌ | ❌ | ❌ |
| Assign to Consultant | ✅ | ❌ | ❌ | ❌ |
| Filter by Source | ✅ | ❌ | ❌ | ❌ |

### Middleware
- `requireSuperAdmin`: Enforces superadmin-only access
- Route-level authorization checks
- Audit logging for all superadmin actions

---

## 🎨 UI/UX Design

### Navigation Structure
```
Superadmin Dashboard
├── CV List (Main Tab)
│   ├── Filters (Status, Source, Search)
│   ├── Statistics Dashboard
│   └── CV Cards with Badges
│       └── Click → CV Details → CV Information Section
│
├── Bulk Upload
│   ├── File Selector
│   ├── Upload Queue
│   └── Results Summary
│
└── Consultant Assignment
    ├── Assignment Type Toggle
    ├── CV/User Selection
    └── Consultant Picker
```

### Design Consistency
- CV Information section is **100% identical** to user profile view
- Only access path differs:
  - **User**: Profile → CV Informations
  - **Superadmin**: CV List → CV Details → CV Informations

---

## 📱 Mobile Implementation

### New Screens
1. **`/app/admin/cv-list.tsx`** - Main CV list with filtering
2. **`/app/admin/bulk-upload.tsx`** - Bulk upload interface
3. **`/app/admin/consultant-assignment.tsx`** - Assignment screen
4. **`/app/admin/edit-cv/[id].tsx`** - CV editing form

### API Integration
**File**: `mobile/lib/services/cvApi.ts`
- Added `bulkUploadCVs` mutation
- Added `updateCVExtractedData` mutation
- Added `assignCVsToConsultant` mutation
- Enhanced `listCVs` with source filtering

### Type Updates
**File**: `mobile/types/cv.types.ts`
- Added `CVSource` enum
- Added `CVStatus` enum
- Enhanced `CVMetadata` with source tracking

---

## 🚀 Usage Examples

### 1. Bulk Upload CVs
```typescript
// Backend
POST /api/cvs/bulk-upload
Content-Type: multipart/form-data
Authorization: Bearer <superadmin-token>

Form Data:
  cvs: [file1.pdf, file2.pdf, file3.docx]

Response:
{
  "success": true,
  "message": "Bulk upload completed: 3 CVs queued, 0 failed",
  "data": {
    "total": 3,
    "queued": 3,
    "failed": 0,
    "results": [...]
  }
}
```

### 2. Filter CVs by Source
```typescript
// Backend
GET /api/cvs?source=SUPERADMIN_BULK&status=COMPLETED

// Mobile
const { data } = useListCVsQuery({
  source: CVSource.SUPERADMIN_BULK,
  status: CVStatus.COMPLETED,
});
```

### 3. Assign CVs to Consultant
```typescript
// By CV
POST /api/cvs/assign-to-consultant
{
  "consultantId": "user-uuid",
  "assignmentType": "cv",
  "cvIds": ["cv-uuid-1", "cv-uuid-2"],
  "name": "Frontend Developers Q1"
}

// By User Profile
POST /api/cvs/assign-to-consultant
{
  "consultantId": "consultant-uuid",
  "assignmentType": "user-profile",
  "userIds": ["user-uuid-1", "user-uuid-2"]
}
```

### 4. Update CV Data
```typescript
PUT /api/cvs/:id/extracted-data
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "totalExperienceYears": 5,
  "seniorityLevel": "Senior"
}
```

---

## ✅ Testing Checklist

### Backend
- [ ] Bulk upload creates CVs with NULL userId
- [ ] Source field defaults to USER_UPLOAD
- [ ] Superadmin can see all CVs
- [ ] Admin cannot see bulk-uploaded CVs
- [ ] User only sees own CVs
- [ ] CV data update requires superadmin role
- [ ] Assignment by CV works correctly
- [ ] Assignment by User Profile retrieves all user CVs

### Mobile
- [ ] CV List shows source badges
- [ ] Source filter only visible to superadmin
- [ ] Bulk upload accepts multiple files
- [ ] Upload progress shown correctly
- [ ] CV edit form pre-fills data
- [ ] Save updates CV successfully
- [ ] Consultant assignment supports both modes
- [ ] Proper error handling for all mutations

---

## 🔄 Future Enhancements

### Planned Features
1. **Advanced CV Editing**
   - Edit experience entries
   - Modify education records
   - Update skills categorization

2. **Batch Operations**
   - Bulk delete
   - Bulk status update
   - Bulk export

3. **Analytics Dashboard**
   - Source distribution charts
   - Processing success rates
   - Timeline visualizations

4. **Audit Trail**
   - Track all CV modifications
   - Show edit history
   - Rollback capability

---

## 🐛 Troubleshooting

### Issue: Bulk uploaded CVs not appearing
**Solution**: Check that:
1. Migration ran successfully
2. Superadmin role is correctly set
3. Source filter is not excluding bulk CVs

### Issue: Permission denied on edit
**Solution**: Verify JWT contains `role: 'SUPERADMIN'`

### Issue: Assignment returns 0 CVs for user
**Solution**: Ensure user has CVs with `isDefault: true`

---

## 📞 Support

For questions or issues:
- Check server logs: `server/logs/`
- Review audit trail: `AuditLog` table
- Verify role permissions in middleware

---

**Version**: 1.0.0
**Last Updated**: January 28, 2026
**Author**: CVthèque Development Team
