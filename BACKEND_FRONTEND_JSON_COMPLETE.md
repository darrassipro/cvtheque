# Complete JSON Reference - Backend ↔ Frontend

## 🔴 BACKEND SENDS (From cvProcessor.ts + cv.controller.ts)

### GET /api/cvs (List of CVs)
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "originalFileName": "YOUNES_DARRASSI_CV.pdf",
      "status": "COMPLETED",
      "photoUrl": "https://cloudinary.com/image.jpg",
      "fileSize": 245670,
      "createdAt": "2026-01-18T10:00:00Z",
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
          "mongodb",
          "aws",
          "docker"
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
          },
          {
            "position": "AI Integration Specialist",
            "company": "Tech Company B",
            "location": "CASABLANCA",
            "startDate": "2023-06-01",
            "endDate": "2024-01-14",
            "duration": "7 months"
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
          "Microsoft Azure Fundamentals",
          "Oracle Cloud Infrastructure",
          "Laravel Web Development"
        ],
        "linkedinUrl": "https://linkedin.com/in/younes-darrassi"
      },
      "aiSummary": "Full Stack Developer with 4 years of experience at Mid Level..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 15
  }
}
```

---

### GET /api/cvs/{id}/extracted-data (Single CV Details)
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "cvId": "cv-550e8400-e29b-41d4-a716-446655440000",
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
    "linkedinUrl": "https://linkedin.com/in/younes-darrassi",
    "skills": [
      "javascript",
      "typescript",
      "python",
      "react",
      "node.js",
      "mongodb",
      "aws",
      "docker"
    ],
    "languages": [
      "english",
      "french",
      "arabic"
    ],
    "education": [
      {
        "degree": "Bachelor of Science",
        "institution": "Université Ibn Tofail",
        "field": "Computer Science",
        "start_date": "2019",
        "end_date": "2023",
        "grade": null
      }
    ],
    "experience": [
      {
        "position": "Full Stack Developer",
        "company": "Tech Company A",
        "location": "FES",
        "startDate": "2024-01-15",
        "endDate": "2024-12-31",
        "duration": "1 year"
      },
      {
        "position": "AI Integration Specialist",
        "company": "Tech Company B",
        "location": "CASABLANCA",
        "startDate": "2023-06-01",
        "endDate": "2024-01-14",
        "duration": "7 months"
      }
    ],
    "certifications": [
      "AWS Solutions Architect",
      "Microsoft Azure Fundamentals",
      "Oracle Cloud Infrastructure",
      "Laravel Web Development"
    ],
    "internships": [],
    "createdAt": "2026-01-18T10:00:00Z",
    "updatedAt": "2026-01-18T10:00:00Z"
  }
}
```

---

## 🟢 FRONTEND INTERNAL TYPE (After transformApiCV)

```typescript
const cv: CV = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  
  personalInfo: {
    firstName: "YOUNES",
    lastName: "DARRASSI",
    fullName: "YOUNES DARRASSI",
    photo: "https://cloudinary.com/image.jpg",
    age: 26,
    email: "darrassi-you@upf.ac.ma",
    phone: "+212 6 12 34 56 78",
    address: "FES, Morocco",
    city: "FES",
    country: "Morocco",
    nationality: "Morocco"
  },
  
  professional: {
    position: "FULL STACK DEVELOPER | AI INTEGRATION SPECIALIST",
    totalExperience: 4,
    experience: 4,
    seniority: "Mid Level",
    summary: "Full Stack Developer with 4 years of experience at Mid Level in Technology sector. 2 position(s) of experience. 1 education background(s). Key skills: javascript, typescript, python, react, node.js",
    currentSalary: 0,
    expectedSalary: 0,
    contractType: "CDI",
    workMode: "Hybride"
  },
  
  skills: [
    {
      name: "javascript",
      level: "Intermédiaire",
      category: "Technical"
    },
    {
      name: "typescript",
      level: "Intermédiaire",
      category: "Technical"
    },
    {
      name: "python",
      level: "Intermédiaire",
      category: "Technical"
    },
    {
      name: "react",
      level: "Intermédiaire",
      category: "Technical"
    },
    {
      name: "node.js",
      level: "Intermédiaire",
      category: "Technical"
    },
    {
      name: "mongodb",
      level: "Intermédiaire",
      category: "Technical"
    },
    {
      name: "aws",
      level: "Intermédiaire",
      category: "Technical"
    },
    {
      name: "docker",
      level: "Intermédiaire",
      category: "Technical"
    }
  ],
  
  languages: [
    {
      name: "English",
      level: "B2"
    },
    {
      name: "French",
      level: "B2"
    },
    {
      name: "Arabic",
      level: "B2"
    }
  ],
  
  experience: [
    {
      company: "Tech Company A",
      position: "Full Stack Developer",
      duration: "1 year",
      startDate: "2024-01-15",
      endDate: "2024-12-31",
      description: null,
      achievements: []
    },
    {
      company: "Tech Company B",
      position: "AI Integration Specialist",
      duration: "7 months",
      startDate: "2023-06-01",
      endDate: "2024-01-14",
      description: null,
      achievements: []
    }
  ],
  
  education: [
    {
      institution: "Université Ibn Tofail",
      degree: "Bachelor of Science",
      field: "Computer Science",
      year: "2023",
      grade: null,
      description: null
    }
  ],
  
  metadata: {
    fileName: "YOUNES_DARRASSI_CV.pdf",
    uploadedAt: "2026-01-18T10:00:00Z",
    processingStatus: "COMPLETED",
    fileSize: 245670,
    rawData: {
      id: "550e8400-e29b-41d4-a716-446655440000",
      originalFileName: "YOUNES_DARRASSI_CV.pdf",
      status: "COMPLETED",
      photoUrl: "https://cloudinary.com/image.jpg",
      fileSize: 245670,
      createdAt: "2026-01-18T10:00:00Z",
      aiSummary: "Full Stack Developer with 4 years of experience...",
      extractedData: {
        personalInfo: { /* ... */ },
        position: "FULL STACK DEVELOPER | AI INTEGRATION SPECIALIST",
        totalExperienceYears: 4,
        seniorityLevel: "Mid Level",
        linkedinUrl: "https://linkedin.com/in/younes-darrassi",
        languages: ["english", "french", "arabic"],
        certifications: ["AWS Solutions Architect", "Microsoft Azure Fundamentals"],
        city: "FES",
        country: "Morocco"
      }
    }
  }
}
```

---

## 🟡 FRONTEND DISPLAY FORMAT (CVCardDisplay for Home Page)

```typescript
const cvCard: CVCardDisplay = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  
  // Avatar
  photo: "https://cloudinary.com/image.jpg",
  
  // Main Info (Used by CVInfo component)
  fullName: "YOUNES DARRASSI",
  position: "FULL STACK DEVELOPER | AI INTEGRATION SPECIALIST",
  
  // Location
  location: "FES, Morocco",
  city: "FES",
  country: "Morocco",
  
  // Experience
  experience: 4,
  totalExperienceYears: 4,
  seniorityLevel: "Mid Level",
  
  // Skills (top 5)
  mainSkills: [
    "javascript",
    "typescript",
    "python",
    "react",
    "node.js"
  ],
  
  // Languages with proficiency
  languages: [
    "English (B2)",
    "French (B2)",
    "Arabic (B2)"
  ],
  
  // Contact
  email: "darrassi-you@upf.ac.ma",
  phone: "+212 6 12 34 56 78",
  
  // Job Preferences
  contractType: "CDI",
  workMode: "Hybride",
  
  // Additional Info
  industry: "Technology",
  uploadedAt: "2026-01-18T10:00:00Z",
  processingStatus: "COMPLETED",
  
  // Detailed Data
  education: [
    {
      institution: "Université Ibn Tofail",
      degree: "Bachelor of Science",
      field: "Computer Science",
      year: "2023",
      grade: null,
      description: null
    }
  ],
  
  workExperience: [
    {
      company: "Tech Company A",
      position: "Full Stack Developer",
      duration: "1 year",
      startDate: "2024-01-15",
      endDate: "2024-12-31",
      description: null,
      achievements: []
    },
    {
      company: "Tech Company B",
      position: "AI Integration Specialist",
      duration: "7 months",
      startDate: "2023-06-01",
      endDate: "2024-01-14",
      description: null,
      achievements: []
    }
  ],
  
  certifications: [
    "AWS Solutions Architect",
    "Microsoft Azure Fundamentals",
    "Oracle Cloud Infrastructure",
    "Laravel Web Development"
  ],
  
  internships: [],
  
  aiSummary: "Full Stack Developer with 4 years of experience at Mid Level in Technology sector..."
}
```

---

## 📊 FIELD MAPPING TABLE

| **Backend API** | **Backend Field Type** | **Frontend Internal CV** | **CV Card Display** | **Display Type** |
|---|---|---|---|---|
| `extractedData.personalInfo.fullName` | string | `personalInfo.fullName` | `fullName` | string |
| `extractedData.personalInfo.email` | string | `personalInfo.email` | `email` | string |
| `extractedData.personalInfo.phone` | string | `personalInfo.phone` | `phone` | string |
| `extractedData.personalInfo.city` | string | `personalInfo.city` | `city` | string |
| `extractedData.personalInfo.country` | string | `personalInfo.country` | `country` | string |
| `extractedData.personalInfo.address` | string | `personalInfo.address` | `location` | string |
| `extractedData.position` | string | `professional.position` | `position` | string |
| `extractedData.totalExperienceYears` | number | `professional.totalExperience` | `totalExperienceYears` | number |
| `extractedData.seniorityLevel` | string | `professional.seniority` | `seniorityLevel` | string |
| `extractedData.industry` | string | — | `industry` | string |
| `extractedData.skills[]` | string[] | `skills[]` with level | `mainSkills[]` (top 5) | string[] |
| `extractedData.languages[]` | string[] | `languages[]` with level | `languages[]` formatted | string[] |
| `extractedData.experience[]` | object[] | `experience[]` | `workExperience[]` | object[] |
| `extractedData.education[]` | object[] | `education[]` | `education[]` | object[] |
| `extractedData.certifications[]` | string[] | — | `certifications[]` | string[] |
| `extractedData.linkedinUrl` | string | `metadata.rawData.extractedData.linkedinUrl` | — | string |
| `photoUrl` | string | `metadata.rawData.photoUrl` | `photo` | string |
| `aiSummary` | string | `professional.summary` | `aiSummary` | string |

---

## 🔄 TRANSFORMATION STEPS

### 1. Backend Extraction
```
CV Text File → cvProcessor.ts → extractedData { ... }
```

### 2. Backend API Response
```
extractedData → cv.controller.ts → API JSON response
```

### 3. Frontend RTK Query
```
API JSON → cvApi.getCVExtractedDataQuery → result
```

### 4. Frontend Data Transformation
```
result.data → transformApiCV() → CV (internal type)
```

### 5. Frontend Display Transformation
```
CV → toCVCardDisplay() → CVCardDisplay (for home page)
```

### 6. Component Rendering
```
CVCardDisplay → CVCard → CVInfo/CVSkills/CVLanguages → Display
```

---

## ✅ TESTING CHECKLIST

### Backend Outputs
- [ ] Server logs show complete extraction result
- [ ] API response includes personalInfo with fullName
- [ ] API response includes position field (not empty)
- [ ] API response includes totalExperienceYears (not 0 if experience exists)
- [ ] API response includes seniorityLevel
- [ ] API response includes skills as string array
- [ ] API response includes languages as string array
- [ ] API response includes experience with position, company, dates
- [ ] API response includes education with degree, institution
- [ ] API response includes city and country separated
- [ ] API response includes photoUrl
- [ ] API response includes aiSummary

### Frontend Transformations
- [ ] Console shows `[transformApiCV] EXTRACTED DATA: { fullName: "...", position: "...", ... }`
- [ ] Console shows `[toCVCardDisplay] CARD DATA: { ... }`
- [ ] CV internal type has all fields populated
- [ ] Languages have level added (default B2)
- [ ] Skills have level and category added
- [ ] totalExperienceYears maps to professional.totalExperience

### Frontend Display
- [ ] CVCard shows fullName correctly
- [ ] CVCard shows position correctly
- [ ] CVCard shows location (city, country combined)
- [ ] CVCard shows top 5 skills
- [ ] CVCard shows languages with proficiency "(Level)"
- [ ] CVCard shows experience years
- [ ] CVCard shows seniority level
- [ ] No "not extracted" placeholders appear
- [ ] No missing data defaults to fallback values

---

**Version**: 2.0 - Complete with cvService.api.ts fixes
**Last Updated**: January 18, 2026
**Status**: ✅ Ready for Production
