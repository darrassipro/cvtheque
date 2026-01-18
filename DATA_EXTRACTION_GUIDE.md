# Data Extraction & Transformation Guide

## ✅ BACKEND EXTRACTION CHECKLIST

### What Backend MUST Extract and Send

The server's `cvProcessor.ts` extracts and sends this data:

```json
{
  "extractedData": {
    "personalInfo": {
      "fullName": "YOUNES DARRASSI",
      "email": "darrassi-you@upf.ac.ma",
      "phone": "+212 6 12 34 56 78",
      "address": "FES, Morocco",
      "city": "FES",
      "country": "Morocco",
      "age": 26
    },
    "position": "FULL STACK DEVELOPER | AI INTEGRATION SPECIALIST",
    "totalExperienceYears": 4,
    "seniorityLevel": "Mid Level",
    "industry": "Technology",
    "skills": [
      "javascript",
      "typescript",
      "python",
      "react",
      "node.js",
      "mongodb"
    ],
    "languages": [
      "english",
      "french",
      "arabic"
    ],
    "experience": [
      {
        "position": "Full Stack Developer",
        "company": "Tech Company A",
        "location": "FES",
        "startDate": "2024-01-15",
        "endDate": "2024-12-31",
        "duration": "1 year"
      }
    ],
    "education": [
      {
        "degree": "Bachelor of Science",
        "institution": "Université Ibn Tofail",
        "field": "Computer Science",
        "start_date": "2019",
        "end_date": "2023"
      }
    ],
    "certifications": [
      "AWS Solutions Architect",
      "Microsoft Azure Fundamentals"
    ],
    "linkedinUrl": "https://linkedin.com/in/younes-darrassi"
  },
  "photoUrl": "https://cloudinary.com/image.jpg",
  "aiSummary": "Full Stack Developer with 4 years of experience..."
}
```

---

## 🔄 FRONTEND TRANSFORMATION FLOW

### Step 1: transformApiCV() - Backend → Internal CV Type

**Input**: Raw API response from backend
**Output**: Internal CV type with enriched data

**Key Mappings**:
```typescript
// Backend → Frontend
extractedData.personalInfo.fullName    → personalInfo.fullName
extractedData.position                 → professional.position
extractedData.totalExperienceYears     → professional.totalExperience
extractedData.seniorityLevel           → professional.seniority
extractedData.skills[]                 → skills[] (with level, category added)
extractedData.languages[]              → languages[] (with level added)
extractedData.experience[]             → experience[]
extractedData.education[]              → education[]
photoUrl                               → metadata.rawData.photoUrl
aiSummary                              → professional.summary
```

**Language Handling**:
- Backend sends: `["english", "french", "arabic"]` (simple strings)
- Frontend converts to: `[{ name: "English", level: "B2" }, ...]` (with proficiency)

**Example transformApiCV Output**:
```typescript
const cv: CV = {
  id: "uuid-12345",
  personalInfo: {
    fullName: "YOUNES DARRASSI",
    email: "darrassi-you@upf.ac.ma",
    phone: "+212 6 12 34 56 78",
    city: "FES",
    country: "Morocco"
  },
  professional: {
    position: "FULL STACK DEVELOPER | AI INTEGRATION SPECIALIST",
    totalExperience: 4,
    seniority: "Mid Level"
  },
  skills: [
    { name: "javascript", level: "Intermédiaire", category: "Technical" },
    { name: "typescript", level: "Intermédiaire", category: "Technical" }
  ],
  languages: [
    { name: "English", level: "B2" },
    { name: "French", level: "B2" },
    { name: "Arabic", level: "B2" }
  ]
}
```

---

### Step 2: toCVCardDisplay() - Internal CV → Card Display Format

**Input**: Internal CV type
**Output**: CVCardDisplay (ready for home page rendering)

**Key Transformations**:
```typescript
cv.personalInfo.fullName               → fullName
cv.professional.position               → position
cv.professional.totalExperience        → totalExperienceYears
cv.professional.seniority              → seniorityLevel
cv.skills.slice(0, 5).map(s => s.name) → mainSkills (top 5)
cv.languages[]                         → languages (formatted with proficiency)
cv.experience[]                        → workExperience
cv.education[]                         → education
extractedData.certifications[]         → certifications
```

**Language Formatting**:
```typescript
// Internal CV languages (objects)
[{ name: "English", level: "B2" }]

// Formatted for display (strings)
["English (B2)"]
```

**Example toCVCardDisplay Output**:
```typescript
const cardDisplay: CVCardDisplay = {
  id: "uuid-12345",
  fullName: "YOUNES DARRASSI",
  position: "FULL STACK DEVELOPER | AI INTEGRATION SPECIALIST",
  totalExperienceYears: 4,
  seniorityLevel: "Mid Level",
  mainSkills: ["javascript", "typescript", "python", "react", "node.js"],
  languages: ["English (B2)", "French (B2)", "Arabic (B2)"],
  city: "FES",
  country: "Morocco",
  location: "FES, Morocco",
  email: "darrassi-you@upf.ac.ma",
  phone: "+212 6 12 34 56 78",
  workExperience: [
    {
      company: "Tech Company A",
      position: "Full Stack Developer",
      startDate: "2024-01-15",
      endDate: "2024-12-31"
    }
  ],
  education: [
    {
      institution: "Université Ibn Tofail",
      degree: "Bachelor of Science"
    }
  ],
  certifications: ["AWS Solutions Architect", "Microsoft Azure Fundamentals"]
}
```

---

## 🎨 COMPONENT RENDERING

### CVCard Component

**Receives**: CVCardDisplay
**Uses** in order:
1. `cv.photo` → CVAvatar
2. `cv.fullName` → CVInfo
3. `cv.position` → CVInfo
4. `cv.location` / `cv.city`, `cv.country` → Location display
5. `cv.mainSkills` → CVSkills
6. `cv.languages` → CVLanguages (formatted strings)
7. `cv.totalExperienceYears` → Metadata badge
8. `cv.seniorityLevel` → Metadata badge

### CVInfo Component

**Receives**: fullName, position
**Displays**:
```
YOUNES DARRASSI (bold, dark gray)
💼 FULL STACK DEVELOPER | AI INTEGRATION SPECIALIST (orange)
```

**Code**:
```tsx
<CVInfo 
  fullName={cv.fullName}           // "YOUNES DARRASSI"
  position={cv.position}            // "FULL STACK DEVELOPER | AI INTEGRATION SPECIALIST"
/>
```

---

## 🧪 DATA VALIDATION CHECKLIST

### Backend Must Provide ✅
- [ ] `extractedData.personalInfo.fullName` - Not empty, not "Name not extracted"
- [ ] `extractedData.position` - Primary position, not "Position not extracted"
- [ ] `extractedData.totalExperienceYears` - Number ≥ 0, not 0 if experience exists
- [ ] `extractedData.seniorityLevel` - Mapped from experience years
- [ ] `extractedData.skills[]` - Array of skill strings
- [ ] `extractedData.languages[]` - Array of language strings
- [ ] `extractedData.experience[]` - Array with position, company, dates
- [ ] `extractedData.education[]` - Array with degree, institution
- [ ] `extractedData.city` and `extractedData.country` - Location split
- [ ] `photoUrl` - URL to avatar image

### Frontend Must Transform ✅
- [ ] Extract fullName from personalInfo
- [ ] Extract position (use direct field, not from experience)
- [ ] Convert skills array to objects with level
- [ ] Convert languages array to objects with proficiency level
- [ ] Map totalExperienceYears to professional.totalExperience
- [ ] Map seniorityLevel to professional.seniority
- [ ] Create display strings for languages ("Language (Level)")

### Display Must Show ✅
- [ ] CVCard shows fullName without truncation
- [ ] CVCard shows position without truncation
- [ ] Languages display with proficiency levels
- [ ] Skills show top 5
- [ ] Experience years display correctly
- [ ] Seniority level displays

---

## 🐛 DEBUGGING

### If fullName shows "Name not extracted"
Check in order:
1. Backend: `cvProcessor.ts` - performBasicExtraction() name extraction
2. Server logs: "[performBasicExtraction] Extracted name..."
3. API response: `extractedData.personalInfo.fullName`
4. Frontend: `transformApiCV()` - fullName mapping
5. Console: `[transformApiCV] EXTRACTED DATA: { fullName: ... }`
6. Component: CVInfo receives correct prop

### If position shows "Position not extracted"
Check in order:
1. Backend: `cvProcessor.ts` - performBasicExtraction() position extraction
2. Server logs: "[performBasicExtraction] Found position..."
3. API response: `extractedData.position`
4. Frontend: `transformApiCV()` - position mapping + experience fallback
5. Console: `[transformApiCV] EXTRACTED DATA: { position: ... }`
6. Component: CVInfo receives correct prop

### If languages don't show with proficiency
Check in order:
1. Backend: `cvProcessor.ts` - languageKeywords extraction
2. API response: `extractedData.languages[]` - array of strings
3. Frontend: `transformApiCV()` - map languages to objects
4. Frontend: `toCVCardDisplay()` - format languages with proficiency
5. Console: `[toCVCardDisplay] CARD DATA: { languagesCount: ... }`
6. Component: CVLanguages receives formatted strings

---

## 📊 COMPLETE DATA FLOW EXAMPLE

### Input: Raw CV Text
```
YOUNES DARRASSI
darrassi-you@upf.ac.ma
+212 6 12 34 56 78

EXPERIENCE
FULL STACK DEVELOPER | Tech Company A | FES
January 2024 - December 2024

EDUCATION
Bachelor of Science | Université Ibn Tofail | 2023

LANGUAGES
English, French, Arabic

SKILLS
JavaScript, TypeScript, Python, React, Node.js, MongoDB
```

### Step 1: Backend Extracts
```json
{
  "personalInfo": {
    "fullName": "YOUNES DARRASSI",
    "email": "darrassi-you@upf.ac.ma"
  },
  "position": "FULL STACK DEVELOPER",
  "totalExperienceYears": 1,
  "seniorityLevel": "Junior",
  "skills": ["javascript", "typescript", "python"],
  "languages": ["english", "french", "arabic"]
}
```

### Step 2: Frontend transformApiCV()
```typescript
const cv: CV = {
  personalInfo: {
    fullName: "YOUNES DARRASSI"
  },
  professional: {
    position: "FULL STACK DEVELOPER",
    totalExperience: 1,
    seniority: "Junior"
  },
  skills: [
    { name: "javascript", level: "Intermédiaire", category: "Technical" }
  ],
  languages: [
    { name: "English", level: "B2" },
    { name: "French", level: "B2" },
    { name: "Arabic", level: "B2" }
  ]
}
```

### Step 3: Frontend toCVCardDisplay()
```typescript
const card: CVCardDisplay = {
  fullName: "YOUNES DARRASSI",
  position: "FULL STACK DEVELOPER",
  totalExperienceYears: 1,
  seniorityLevel: "Junior",
  mainSkills: ["javascript", "typescript", "python"],
  languages: ["English (B2)", "French (B2)", "Arabic (B2)"]
}
```

### Step 4: Component Renders
```
YOUNES DARRASSI (from CVInfo)
💼 FULL STACK DEVELOPER (from CVInfo)
Languages: English (B2) French (B2) Arabic (B2) (from CVLanguages)
Skills: JavaScript TypeScript Python (from CVSkills)
1 ans | Junior | CDI | Hybride (from CVMetadata)
```

---

## 🎯 QUALITY CHECKPOINTS

### ✅ All Data Must Be Extracted
- Name from CV text
- Position from CV text
- Experience years from dates
- Seniority from years calculation
- Skills from CV text
- Languages from CV text
- Education from CV text
- Certifications from CV text

### ✅ All Data Must Transform Correctly
- Backend → Internal CV type (with enrichment)
- Internal CV → Display format (with formatting)

### ✅ All Data Must Display Correctly
- No "not extracted" placeholders
- No missing required fields
- Languages show with proficiency
- Skills show top 5
- Experience shows years
- Seniority shows level
- Photo shows avatar

---

## 📝 FILES TO CHECK

### Backend
- `server/src/services/cvProcessor.ts` - Extraction logic
- `server/src/controllers/cv.controller.ts` - API response formatting

### Frontend
- `mobile/services/cv/cvService.api.ts` - transformApiCV() & toCVCardDisplay()
- `mobile/types/cv.types.ts` - Type definitions
- `mobile/components/cv/CVInfo.tsx` - Display component

### Debugging
- Browser console: `[transformApiCV] EXTRACTED DATA:`
- Browser console: `[toCVCardDisplay] CARD DATA:`
- Server logs: `[performBasicExtraction] COMPLETE EXTRACTION RESULT:`

---

**Last Updated**: January 18, 2026
**Status**: ✅ Production Ready
