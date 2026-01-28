# ✅ Superadmin Features Deployment Checklist

## Pre-Deployment

### 🗄️ Database
- [ ] Backup current database
- [ ] Review migration file: `server/src/migrations/20260128-add-cv-source-field.ts`
- [ ] Test migration on development environment
- [ ] Verify migration adds `source` column
- [ ] Verify migration makes `userId` nullable
- [ ] Check existing CVs have `source = USER_UPLOAD`

### 🔧 Server
- [ ] Install dependencies: `cd server && npm install`
- [ ] Run TypeScript build: `npm run build`
- [ ] Check no TypeScript errors
- [ ] Review env variables (`.env`)
- [ ] Verify all required services running (DB, Redis, etc.)

### 📱 Mobile
- [ ] Install dependencies: `cd mobile && npm install`
- [ ] Check for TypeScript errors: `npx tsc --noEmit`
- [ ] Test build: `npx expo export`
- [ ] Verify no missing imports

---

## Deployment Steps

### Step 1: Run Migration
```bash
cd server
npm run migrate

# Expected output:
# ✓ Migration 20260128-add-cv-source-field.ts executed successfully
```

**Verify:**
```sql
-- Check source column exists
DESCRIBE cvs;

-- Should show:
-- source | enum('USER_UPLOAD','SUPERADMIN_BULK') | NO | | USER_UPLOAD
-- user_id | char(36) | YES | MUL | NULL

-- Check existing data
SELECT source, COUNT(*) as count FROM cvs GROUP BY source;

-- Should show:
-- USER_UPLOAD | <count of existing CVs>
```

### Step 2: Restart Server
```bash
cd server
npm run dev  # or pm2 restart app-name

# Check logs for errors
tail -f logs/combined.log
```

**Verify:**
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Should return 200 OK
```

### Step 3: Test Endpoints
```bash
# Get auth token first
TOKEN="your-superadmin-jwt-token"

# Test bulk upload (with dummy file)
curl -X POST http://localhost:3000/api/cvs/bulk-upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "cvs=@test.pdf"

# Expected: 202 Accepted with upload results

# Test source filtering
curl "http://localhost:3000/api/cvs?source=SUPERADMIN_BULK" \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK with filtered CVs
```

### Step 4: Create Superadmin User
```sql
-- Promote existing user
UPDATE users 
SET role = 'SUPERADMIN' 
WHERE email = 'admin@yourdomain.com';

-- Verify
SELECT id, email, role FROM users WHERE role = 'SUPERADMIN';
```

### Step 5: Test Mobile App
```bash
cd mobile
npm start

# Or build for specific platform
npm run ios  # or npm run android
```

**Test Flow:**
1. Login as superadmin
2. Navigate to `/admin/cv-list`
3. Verify CV list loads
4. Test filters (source, status)
5. Navigate to bulk upload
6. Test file selection
7. Attempt upload
8. Verify results

---

## Post-Deployment Verification

### ✅ Backend Checks
- [ ] Bulk upload endpoint returns 202
- [ ] CVs created with `source = SUPERADMIN_BULK`
- [ ] CVs created with `userId = NULL`
- [ ] Source filtering works correctly
- [ ] Update endpoint saves changes
- [ ] Assignment endpoint creates shares
- [ ] Audit logs capture all actions
- [ ] Non-superadmin gets 403 on restricted endpoints

### ✅ Mobile Checks
- [ ] CV list shows source badges
- [ ] Bulk/User filters work
- [ ] Bulk upload screen accessible
- [ ] File picker works
- [ ] Upload progress shown
- [ ] Edit screen loads data
- [ ] Save updates successfully
- [ ] Assignment screen functions
- [ ] CV/User Profile toggle works

### ✅ Security Checks
- [ ] Regular users cannot access bulk upload
- [ ] Admins cannot see bulk-uploaded CVs
- [ ] Users only see their own CVs
- [ ] Source filter hidden for non-superadmins
- [ ] Edit endpoint rejects non-superadmin
- [ ] Assignment endpoint rejects non-superadmin

### ✅ Data Integrity
- [ ] Existing CVs unchanged
- [ ] Source defaults to USER_UPLOAD
- [ ] Bulk CVs have NULL userId
- [ ] Processing pipeline still works
- [ ] Extracted data intact
- [ ] Relationships preserved

---

## Rollback Plan

If issues occur, follow this rollback procedure:

### Step 1: Revert Migration
```bash
cd server
npm run migrate:undo

# This will:
# - Remove 'source' column
# - Make 'userId' NOT NULL again
```

### Step 2: Restore Previous Code
```bash
# Git revert (if using version control)
git revert HEAD

# Or manually restore files:
# - server/src/models/CV.ts
# - server/src/controllers/cv.controller.ts
# - server/src/routes/cv.routes.ts
# - mobile/types/cv.types.ts
# - mobile/lib/services/cvApi.ts
```

### Step 3: Clean Up Bulk CVs (if any were created)
```sql
-- Optional: Remove bulk-uploaded CVs before rollback
DELETE FROM cvs WHERE user_id IS NULL;
```

### Step 4: Restart Server
```bash
cd server
npm run dev
```

---

## Monitoring

### Key Metrics to Watch
- [ ] Bulk upload success rate
- [ ] CV processing completion rate
- [ ] API response times
- [ ] Error rates on new endpoints
- [ ] Database query performance

### Log Locations
```
server/logs/combined.log      # All logs
server/logs/error.log          # Errors only
server/logs/audit.log          # Audit trail
```

### Useful Queries
```sql
-- CVs by source
SELECT source, status, COUNT(*) as count 
FROM cvs 
GROUP BY source, status;

-- Recent bulk uploads
SELECT id, originalFileName, status, createdAt 
FROM cvs 
WHERE source = 'SUPERADMIN_BULK' 
ORDER BY createdAt DESC 
LIMIT 10;

-- Audit trail for superadmin actions
SELECT userId, action, resource, createdAt 
FROM audit_logs 
WHERE action IN ('UPLOAD', 'UPDATE', 'CREATE') 
ORDER BY createdAt DESC 
LIMIT 20;
```

---

## Common Issues & Solutions

### Issue 1: Migration fails with "column already exists"
**Solution:**
```sql
-- Check if migration already ran
SELECT * FROM migrations WHERE name LIKE '%add-cv-source%';

-- If exists, manually verify column:
SHOW COLUMNS FROM cvs LIKE 'source';
```

### Issue 2: Bulk upload returns 403
**Solution:**
- Verify user has `role = 'SUPERADMIN'`
- Check JWT token is valid
- Review middleware chain in routes

### Issue 3: Mobile can't find new screens
**Solution:**
```bash
# Clear metro cache
cd mobile
npx expo start --clear

# Rebuild
npx expo export
```

### Issue 4: Source filter not working
**Solution:**
- Verify user is superadmin
- Check query parameter is correctly named `source`
- Review backend logs for filter application

---

## Support Contacts

**Technical Lead**: [Your Name/Team]
**Emergency Contact**: [Phone/Email]
**Documentation**: See SUPERADMIN_FEATURES.md

---

## Sign-Off

- [ ] Database migration completed successfully
- [ ] Server restarted without errors
- [ ] Mobile app tested on device
- [ ] All checklist items verified
- [ ] Team notified of deployment
- [ ] Documentation updated
- [ ] Monitoring alerts configured

**Deployed By**: _______________
**Date**: _______________
**Time**: _______________
**Environment**: Production / Staging / Development

---

**Status**: Ready for Deployment ✅
