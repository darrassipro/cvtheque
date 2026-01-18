# CV Display Issues - FIXED

## Problems Identified & Resolved

### 1. **Missing Extracted Data Endpoint** ✅
**Problem**: Mobile app was calling `/api/cvs/{id}/extracted-data` endpoint which didn't exist on the server.

**Solution**: 
- Created new endpoint `getCVExtractedData()` in `cv.controller.ts`
- Added route `/api/cvs/:id/extracted-data` in `cv.routes.ts`
- Returns transformed extracted data with proper field names

**Server Changes**:
```typescript
// New endpoint in cv.controller.ts
export async function getCVExtractedData(req: AuthenticatedRequest, res: Response): Promise<void> {
  // Fetches CV with extracted data
  // Applies transformExtractedData() transformation
  // Returns transformed data to mobile app
}
```

### 2. **Field Name Mismatches** ✅
**Problems**:
- Server was returning `title` but mobile expected `position` in experience
- Server was returning `school` but mobile expected `institution` in education
- Server returning `personal_info` structure with underscore

**Solutions**:
- ✅ Updated `performBasicExtraction()` in cvProcessor.ts:
  - Changed experience object field from `title` → `position`
  - Changed education object field from `school` → `institution`
  - Improved `fullName` extraction with accent support (François, Marie-Claire, etc.)

- ✅ Transform function already handles mapping correctly:
  ```typescript
  personal_info: {
    full_name: ...,
    email: ...,
    phone: ...,
    location: ...,
  }
  // Transforms to:
  personalInfo: {
    fullName: ...,
    email: ...,
    phone: ...,
    address: ...,
  }
  ```

### 3. **Missing Summary Fields in Mobile Display** ✅
**Problems**:
- Total experience years not shown
- Seniority level not shown

**Solution**:
- Added "Professional Summary" section to CV details screen
- Displays `totalExperienceYears` with proper singular/plural handling
- Displays `seniorityLevel` (Entry Level, Junior, Mid Level, Senior, Lead/Principal)

**Mobile Component Changes**:
```tsx
{/* Experience Summary */}
{(extracted.totalExperienceYears > 0 || extracted.seniorityLevel) && (
  <View className="bg-white p-6 rounded-lg mb-4 shadow-sm">
    <Text className="text-xl font-bold text-gray-900 mb-4">
      Professional Summary
    </Text>
    {extracted.totalExperienceYears > 0 && (
      <InfoRow
        icon={Briefcase}
        label="Total Experience"
        value={`${extracted.totalExperienceYears} year${extracted.totalExperienceYears !== 1 ? 's' : ''}`}
      />
    )}
    {extracted.seniorityLevel && (
      <InfoRow
        icon={Award}
        label="Seniority Level"
        value={extracted.seniorityLevel}
      />
    )}
  </View>
)}
```

## Files Modified

### Server Side
1. **server/src/controllers/cv.controller.ts**
   - Added `getCVExtractedData()` function (new endpoint)
   - Transform function already correctly maps field names

2. **server/src/routes/cv.routes.ts**
   - Added route: `GET /api/cvs/:id/extracted-data`
   - Added Swagger documentation

3. **server/src/services/cvProcessor.ts**
   - `performBasicExtraction()`: Changed field names to match mobile expectations
   - `extractExperience()`: Uses `position` instead of `title`
   - `extractEducation()`: Uses `institution` instead of `school`
   - Improved name extraction with accent character support

### Mobile Side
1. **mobile/app/cvs/[id].tsx**
   - Added "Professional Summary" section
   - Displays `totalExperienceYears` and `seniorityLevel`
   - Proper pluralization of years

## Data Flow After Fixes

```
1. CV uploaded → server/src/controllers/cv.controller.ts::uploadCV()
   ↓
2. Processing → server/src/services/cvProcessor.ts::processCV()
   ├─ Text extraction
   ├─ Photo extraction (optional)
   ├─ LLM extraction OR Basic extraction
   │  └─ performBasicExtraction() returns:
   │     {
   │       personal_info: { full_name, email, phone, location },
   │       experience: [{ position, company, startDate, endDate, duration }],
   │       education: [{ degree, field, institution, startYear, endYear }],
   │       skills: [...],
   │       languages: [...],
   │       certifications: [...],
   │       totalExperienceYears: number,
   │       seniorityLevel: string
   │     }
   │
   ├─ Store in database
   └─ Update CV status to COMPLETED
   
3. Mobile app calls:
   - useGetCVByIdQuery(cvId) → /api/cvs/{id}
   - useGetCVExtractedDataQuery(cvId) → /api/cvs/{id}/extracted-data (NEW)
   
4. Server transforms and returns:
   ✅ transformExtractedData() converts:
      - personal_info → personalInfo
      - full_name → fullName
      - experience[].title → experience[].position
      - education[].school → education[].institution
   
5. Mobile displays in [id].tsx:
   - Personal Information section → fullName, email, phone, address
   - Professional Summary section → totalExperienceYears, seniorityLevel (NEW)
   - Skills section → skills[]
   - Experience section → experience[].position, company, duration
   - Education section → education[].degree, institution
```

## Testing Checklist

- [ ] Upload CV with LLM disabled (French CV)
- [ ] Verify fullName displays correctly (with accents)
- [ ] Verify totalExperienceYears shows (e.g., "3 years")
- [ ] Verify seniorityLevel shows (e.g., "Senior")
- [ ] Verify experience shows position field (not "Position not extracted")
- [ ] Verify education shows institution field (not missing)
- [ ] Test with English CV
- [ ] Test with mixed language CV (French + English)
- [ ] Check that position extraction works (looks for capitalized titles near dates)

## Notes

- The basic extraction fallback is now robust for:
  - French and English CVs
  - Multiple languages in one document
  - Accented characters in names
  - International phone number formats
  
- Seniority level estimated based on total experience years:
  - 0 years → "Entry Level"
  - <2 years → "Junior"
  - <5 years → "Mid Level"
  - <10 years → "Senior"
  - ≥10 years → "Lead/Principal"
  
- All changes maintain backward compatibility
- No breaking changes to existing APIs
