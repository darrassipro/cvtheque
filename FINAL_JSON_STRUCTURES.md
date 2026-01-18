# Final JSON Structures - Complete Reference

## 1. BACKEND RESPONSE - `/api/cvs/{id}/extracted-data`

This is what the server sends to the mobile app:

```json
{
  "id": "uuid-12345",
  "cvId": "uuid-cv-001",
  "fullName": "YOUNES DARRASSI",
  "email": "darrassi-you@upf.ac.ma",
  "phone": "+212 6 12 34 56 78",
  "location": "FES, Morocco",
  "age": 26,
  "gender": null,
  "city": "FES",
  "country": "Morocco",
  "address": "FES, Morocco",
  "position": "FULL STACK DEVELOPER | AI INTEGRATION SPECIALIST",
  "totalExperienceYears": 4,
  "seniorityLevel": "Mid Level",
  "industry": "Technology",
  "education": [
    {
      "degree": "Bachelor of Science",
      "institution": "Université Ibn Tofail",
      "field": "Computer Science",
      "start_date": "2019",
      "end_date": "2023",
      "grade": null,
      "description": null
    }
  ],
  "experience": [
    {
      "position": "Full Stack Developer",
      "company": "Tech Company A",
      "location": "FES",
      "startDate": "2024-01-15",
      "endDate": "2024-12-31",
      "duration": "1 year",
      "description": null,
      "achievements": []
    },
    {
      "position": "AI Integration Specialist",
      "company": "Tech Company B",
      "location": "CASABLANCA",
      "startDate": "2023-06-01",
      "endDate": "2024-01-14",
      "duration": "7 months",
      "description": null,
      "achievements": []
    }
  ],
  "skills": [
    "javascript",
    "typescript",
    "python",
    "react",
    "node.js",
    "mongodb",
    "aws",
    "docker",
    "git"
  ],
  "languages": [
    "english",
    "french",
    "arabic"
  ],
  "certifications": [
    "AWS Solutions Architect",
    "Microsoft Azure Fundamentals",
    "Oracle Cloud Infrastructure",
    "Laravel Web Development"
  ],
  "internships": [],
  "linkedinUrl": "https://linkedin.com/in/younes-darrassi",
  "createdAt": "2026-01-18T12:00:00Z",
  "updatedAt": "2026-01-18T12:00:00Z"
}
```

---

## 2. FRONTEND TRANSFORMATION - Internal CV Type

After `transformApiCV()` processes the backend response:

```json
{
  "id": "uuid-12345",
  "personalInfo": {
    "firstName": "YOUNES",
    "lastName": "DARRASSI",
    "fullName": "YOUNES DARRASSI",
    "photo": "https://cloudinary.com/image.jpg",
    "age": 26,
    "email": "darrassi-you@upf.ac.ma",
    "phone": "+212 6 12 34 56 78",
    "address": "FES, Morocco",
    "city": "FES",
    "country": "Morocco",
    "nationality": null
  },
  "professional": {
    "position": "FULL STACK DEVELOPER | AI INTEGRATION SPECIALIST",
    "totalExperience": 4,
    "experience": 4,
    "seniority": "Mid Level",
    "summary": "Full Stack Developer with 4 years of experience at Mid Level in Technology sector. 2 position(s) of experience. 1 education background(s). Key skills: javascript, typescript, python, react, node.js",
    "contractType": "CDI",
    "workMode": "Hybride"
  },
  "skills": [
    {
      "name": "javascript",
      "level": "Avancé",
      "category": "technical"
    },
    {
      "name": "typescript",
      "level": "Avancé",
      "category": "technical"
    },
    {
      "name": "python",
      "level": "Intermédiaire",
      "category": "technical"
    },
    {
      "name": "react",
      "level": "Avancé",
      "category": "technical"
    },
    {
      "name": "node.js",
      "level": "Avancé",
      "category": "technical"
    },
    {
      "name": "mongodb",
      "level": "Intermédiaire",
      "category": "technical"
    },
    {
      "name": "aws",
      "level": "Intermédiaire",
      "category": "technical"
    },
    {
      "name": "docker",
      "level": "Intermédiaire",
      "category": "technical"
    },
    {
      "name": "git",
      "level": "Intermédiaire",
      "category": "technical"
    }
  ],
  "languages": [
    {
      "name": "English",
      "level": "B2"
    },
    {
      "name": "French",
      "level": "C1"
    },
    {
      "name": "Arabic",
      "level": "Native"
    }
  ],
  "experience": [
    {
      "company": "Tech Company A",
      "position": "Full Stack Developer",
      "duration": "1 year",
      "startDate": "2024-01-15",
      "endDate": "2024-12-31",
      "description": null,
      "achievements": []
    },
    {
      "company": "Tech Company B",
      "position": "AI Integration Specialist",
      "duration": "7 months",
      "startDate": "2023-06-01",
      "endDate": "2024-01-14",
      "description": null,
      "achievements": []
    }
  ],
  "education": [
    {
      "institution": "Université Ibn Tofail",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "year": "2023",
      "grade": null,
      "description": null
    }
  ],
  "metadata": {
    "fileName": "YOUNES_DARRASSI_CV.pdf",
    "uploadedAt": "2026-01-18T10:00:00Z",
    "processingStatus": "COMPLETED",
    "fileSize": 245670,
    "rawData": {
      "cvId": "uuid-cv-001",
      "photoUrl": "https://cloudinary.com/image.jpg",
      "extractedData": {
        "fullName": "YOUNES DARRASSI",
        "email": "darrassi-you@upf.ac.ma",
        "phone": "+212 6 12 34 56 78",
        "location": "FES, Morocco",
        "totalExperienceYears": 4,
        "seniorityLevel": "Mid Level",
        "linkedinUrl": "https://linkedin.com/in/younes-darrassi",
        "languages": ["english", "french", "arabic"],
        "certifications": ["AWS Solutions Architect", "Microsoft Azure Fundamentals"],
        "city": "FES",
        "country": "Morocco"
      }
    }
  }
}
```

---

## 3. CV CARD DISPLAY - Home Page Format

After `toCVCardDisplay()` creates the card:

```json
{
  "id": "uuid-12345",
  "photo": "https://cloudinary.com/image.jpg",
  "fullName": "YOUNES DARRASSI",
  "position": "FULL STACK DEVELOPER | AI INTEGRATION SPECIALIST",
  "experience": 4,
  "mainSkills": [
    "javascript",
    "typescript",
    "python",
    "react",
    "node.js"
  ],
  "languages": [
    "English (B2)",
    "French (C1)",
    "Arabic (Native)"
  ],
  "contractType": "CDI",
  "workMode": "Hybride",
  "email": "darrassi-you@upf.ac.ma",
  "phone": "+212 6 12 34 56 78",
  "location": "FES, Morocco",
  "city": "FES",
  "country": "Morocco",
  "totalExperienceYears": 4,
  "seniorityLevel": "Mid Level",
  "industry": "Technology",
  "uploadedAt": "2026-01-18T10:00:00Z",
  "processingStatus": "COMPLETED",
  "education": [
    {
      "institution": "Université Ibn Tofail",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "year": "2023"
    }
  ],
  "workExperience": [
    {
      "company": "Tech Company A",
      "position": "Full Stack Developer",
      "duration": "1 year",
      "startDate": "2024-01-15",
      "endDate": "2024-12-31"
    },
    {
      "company": "Tech Company B",
      "position": "AI Integration Specialist",
      "duration": "7 months",
      "startDate": "2023-06-01",
      "endDate": "2024-01-14"
    }
  ],
  "certifications": [
    "AWS Solutions Architect",
    "Microsoft Azure Fundamentals",
    "Oracle Cloud Infrastructure",
    "Laravel Web Development"
  ],
  "internships": [],
  "aiSummary": "Full Stack Developer with 4 years of experience at Mid Level in Technology sector..."
}
```

---

## 4. FIELD MAPPING TABLE

| **Backend** | **Frontend (Internal CV)** | **Display (CV Card)** | **Type** |
|---|---|---|---|
| `fullName` | `personalInfo.fullName` | `fullName` | string |
| `email` | `personalInfo.email` | `email` | string |
| `phone` | `personalInfo.phone` | `phone` | string |
| `city` | `personalInfo.city` | `city` | string |
| `country` | `personalInfo.country` | `country` | string |
| `address` / `location` | `personalInfo.address` | `location` | string |
| `position` | `professional.position` | `position` | string |
| `totalExperienceYears` | `professional.totalExperience` | `totalExperienceYears` | number |
| `seniorityLevel` | `professional.seniority` | `seniorityLevel` | string |
| `industry` | — | `industry` | string |
| `skills[]` | `skills[]` (as objects) | `mainSkills[]` (top 5 names) | array |
| `languages[]` | `languages[]` (as objects with level) | `languages[]` (formatted) | array |
| `experience[]` | `experience[]` | `workExperience[]` | array |
| `education[]` | `education[]` | `education[]` | array |
| `certifications[]` | — | `certifications[]` | array |
| `linkedinUrl` | `metadata.rawData.extractedData.linkedinUrl` | — | string |

---

## 5. DATA FLOW DIAGRAM

```
Backend Database (CVExtractedData)
         ↓
    /api/cvs/{id}/extracted-data
         ↓
Mobile RTK Query (cvApi.getCVExtractedDataQuery)
         ↓
transformApiCV() [cvService.api.ts]
         ↓
Internal CV Type (fullName, skills with levels, etc.)
         ↓
toCVCardDisplay() [cvService.api.ts]
         ↓
CVCardDisplay Type (for home page cards)
         ↓
Display Components (CVInfo.tsx, CVCard components)
```

---

## 6. LANGUAGE HANDLING

### Backend Extraction
```typescript
const languages = ['english', 'french', 'arabic']; // Simple strings
```

### Frontend Internal Type
```typescript
languages: Language[] = [
  { name: 'English', level: 'B2' },
  { name: 'French', level: 'C1' },
  { name: 'Arabic', level: 'Native' }
]
```

### Frontend Display (CV Card)
```typescript
languages: string[] = [
  'English (B2)',
  'French (C1)',
  'Arabic (Native)'
]
```

**Formatting Logic** (in `toCVCardDisplay()`):
```typescript
const formattedLanguages = languages.map((lang: any) => {
  if (typeof lang === 'string') return lang; // If string from backend
  const langName = lang.name || lang.language || '';
  const proficiency = lang.level || lang.proficiency || '';
  return proficiency ? `${langName} (${proficiency})` : langName;
}).filter(Boolean);
```

---

## 7. KEY DIFFERENCES

| **Aspect** | **Backend** | **Frontend** |
|---|---|---|
| **Skills** | Array of strings | Array of objects with `{ name, level, category }` |
| **Languages** | Array of strings | Array of objects with `{ name, level }` or formatted strings |
| **Experience** | Same structure | Same structure (kept as-is) |
| **Names** | Combined `fullName` | Split into `firstName`, `lastName`, `fullName` |
| **Years** | `totalExperienceYears` (number) | `professional.totalExperience` and `professional.experience` |
| **Seniority** | `seniorityLevel` (string) | `professional.seniority` |
| **Location** | Single `location` field | Split into `city`, `country`, `address` |

---

## 8. EXAMPLE - CV CARD COMPONENT USAGE

```typescript
// Home page receives CV Card Display format
<CVCard {...cvCardDisplay} />

// Inside CVCard/CVInfo.tsx
<View>
  <Text>{cvCard.fullName}</Text>           {/* "YOUNES DARRASSI" */}
  <Text>{cvCard.position}</Text>            {/* "FULL STACK DEVELOPER | AI INTEGRATION SPECIALIST" */}
  <Text>{cvCard.city}, {cvCard.country}</Text> {/* "FES, Morocco" */}
  
  <Skills skills={cvCard.mainSkills} />    {/* ["javascript", "typescript", ...] */}
  <Languages langs={cvCard.languages} />   {/* ["English (B2)", "French (C1)", ...] */}
  
  <Badge>{cvCard.seniorityLevel}</Badge>   {/* "Mid Level" */}
  <Badge>{cvCard.totalExperienceYears} yrs</Badge> {/* "4 yrs" */}
</View>
```

---

## 9. PROFILE DETAILS PAGE SECTIONS

```
Header
├── Photo: cvCard.photo
├── Full Name: cvCard.fullName
├── Position: cvCard.position
└── Location: cvCard.city, cvCard.country

Personal Info
├── Email: cvCard.email
├── Phone: cvCard.phone
├── Address: cvCard.location
└── LinkedIn: (from metadata)

Professional Summary
├── Experience: cvCard.totalExperienceYears years
├── Seniority: cvCard.seniorityLevel
└── Summary: cv.professional.summary

Skills
└── cvCard.mainSkills (with categories from cv.skills[].category)

Languages
└── cvCard.languages (formatted with proficiency levels)

Experience
└── cvCard.workExperience[] (with company, position, duration)

Education
└── cvCard.education[] (with degree, institution, year)

Certifications
└── cvCard.certifications[]
```

---

## 10. BACKEND TO FRONTEND - COMPLETE TRANSFORMATION EXAMPLE

**Input from Backend:**
```json
{
  "fullName": "YOUNES DARRASSI",
  "position": "FULL STACK DEVELOPER",
  "totalExperienceYears": 4,
  "seniorityLevel": "Mid Level",
  "languages": ["english", "french"],
  "skills": ["javascript", "react", "node.js"]
}
```

**Output for CV Card:**
```json
{
  "fullName": "YOUNES DARRASSI",
  "position": "FULL STACK DEVELOPER",
  "totalExperienceYears": 4,
  "seniorityLevel": "Mid Level",
  "languages": ["English (B2)", "French (C1)"],
  "mainSkills": ["javascript", "react", "node.js"]
}
```

**Transformation Logic:**
1. Backend sends simple strings for skills and languages
2. `transformApiCV()` enriches with levels from proficiency mappings
3. `toCVCardDisplay()` formats for display (adds proficiency in parentheses)
4. Components receive ready-to-display format

---

**Last Updated:** January 18, 2026  
**Status:** ✅ Complete - All fields mapped and documented
