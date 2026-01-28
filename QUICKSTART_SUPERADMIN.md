# Superadmin Features Quick Start

## 🚀 Quick Setup (3 steps)

### 1. Run Database Migration
```bash
cd server
npm run migrate
# or manually run the migration file
```

### 2. Restart Server
```bash
cd server
npm run dev
```

### 3. Test in Mobile App
```bash
cd mobile
npm start
```

## 🧪 Testing the Features

### Create a Superadmin User
```sql
-- In your database
UPDATE users 
SET role = 'SUPERADMIN' 
WHERE email = 'your-admin@example.com';
```

### Test Endpoints with cURL

#### 1. Bulk Upload
```bash
curl -X POST http://localhost:3000/api/cvs/bulk-upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "cvs=@cv1.pdf" \
  -F "cvs=@cv2.pdf"
```

#### 2. List with Source Filter
```bash
curl http://localhost:3000/api/cvs?source=SUPERADMIN_BULK \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 3. Update CV Data
```bash
curl -X PUT http://localhost:3000/api/cvs/CV_ID/extracted-data \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@test.com",
    "totalExperienceYears": 5
  }'
```

#### 4. Assign to Consultant
```bash
curl -X POST http://localhost:3000/api/cvs/assign-to-consultant \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "consultantId": "CONSULTANT_USER_ID",
    "assignmentType": "cv",
    "cvIds": ["CV_ID_1", "CV_ID_2"]
  }'
```

## 📱 Mobile Navigation

### Access Superadmin Features
1. Login as superadmin user
2. Navigate to Admin section (if tab exists)
3. Or directly access:
   - `/admin/cv-list` - Main CV list
   - `/admin/bulk-upload` - Bulk upload
   - `/admin/consultant-assignment` - Assign CVs
   - `/admin/edit-cv/[id]` - Edit CV

### Quick Links Code
```tsx
// Add to your navigation
<TouchableOpacity onPress={() => router.push('/admin/cv-list')}>
  <Text>CV Management</Text>
</TouchableOpacity>
```

## ✅ Verification Steps

1. **Check Migration**
```sql
DESCRIBE cvs;
-- Should show 'source' column and nullable 'user_id'
```

2. **Verify Role**
```sql
SELECT email, role FROM users WHERE role = 'SUPERADMIN';
```

3. **Test Upload**
- Use Postman or mobile app
- Upload 2-3 CVs via bulk upload
- Check they appear in CV list with "Bulk" badge

4. **Test Filtering**
```bash
# All CVs
GET /api/cvs

# Only bulk uploads
GET /api/cvs?source=SUPERADMIN_BULK

# Only user uploads
GET /api/cvs?source=USER_UPLOAD
```

## 🔧 Troubleshooting

### Migration Issues
```bash
# Check migration status
npm run migrate:status

# Rollback if needed
npm run migrate:undo

# Re-run
npm run migrate
```

### Permission Denied
- Verify token includes `role: 'SUPERADMIN'`
- Check middleware in `server/src/middleware/authorize.ts`
- Review logs in `server/logs/`

### CVs Not Showing
- Check source filter isn't excluding CVs
- Verify role has correct permissions
- Check database records exist

## 📊 Expected Results

After setup, you should see:

### Database
```
cvs table:
- source column (enum: USER_UPLOAD, SUPERADMIN_BULK)
- user_id can be NULL
```

### API Response
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "source": "SUPERADMIN_BULK",
      "userId": null,
      "status": "COMPLETED",
      "metadata": {
        "source": "SUPERADMIN_BULK"
      }
    }
  ]
}
```

### Mobile UI
- CV List shows source badges (Bulk / User)
- Filter buttons for source selection
- Edit button visible on CV details
- Bulk upload button in header

## 🎉 Success Indicators

✅ Bulk upload returns success response
✅ CVs show in list with source badge
✅ Filtering by source works correctly
✅ Edit form saves changes successfully
✅ Consultant assignment creates shares
✅ Audit logs track all actions

---

**Ready to Go!** 🚀

All features are implemented and ready for testing. See [SUPERADMIN_FEATURES.md](./SUPERADMIN_FEATURES.md) for complete documentation.
