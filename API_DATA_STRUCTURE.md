# Backend ↔ Frontend Data Structure

## 1. LIST CVs ENDPOINT
**Backend Route:** `GET /api/cvs`
**Frontend Hook:** `useListCVsQuery()`

### Backend Response (from `listCVs`)
```json
{
  "success": true,
  "data": [
    {
      "id": "dd8a004f-0a49-45df-9dc2-41cb1ba489e6",
      "userId": "f27ed9e6-0d3c-4784-b2ac-b0b603575e42",
      "originalFileName": "Younes_Darrassi_CV.pdf",
      "documentType": "PDF",
      "fileSize": 245000,
      "status": "COMPLETED",
      "processingStartedAt": "2026-01-18T17:11:49.000Z",
      "processingCompletedAt": "2026-01-18T17:11:50.000Z",
      "aiSummary": "Younes Darrassi is a professional at Mid Level level...",
      "confidenceScore": 0.4,
      "createdAt": "2026-01-18T17:11:48.000Z",
      "updatedAt": "2026-01-18T17:11:50.000Z",
      "extractedData": {
        "id": "uuid",
        "cvId": "dd8a004f-0a49-45df-9dc2-41cb1ba489e6",
        "fullName": "YOUNES DARRASSI",
        "email": "darrassi-you@upf.ac.ma",
        "phone": "212629419616",
        "location": "FES, Morocco",
        "city": "FES",
        "country": "Morocco",
        "education": [
          {
            "degree": "COMPUTER ENGINEERING STATE ENGINEER",
            "institution": "Université Privée de Fès",
            "field_of_study": null,
            "start_date": "2022",
            "end_date": "2024"
          },
          {
            "degree": "BACHELOR IN MATHEMATICAL AND COMPUTER SCIENCES",
            "institution": "Faculté dhar el mahraz",
            "field_of_study": null,
            "start_date": "2016",
            "end_date": "2020"
          }
        ],
        "experience": [
          {
            "position": "FULL STACK DEVELOPER | AI INTEGRATION SPECIALIST",
            "company": "3D Smart Factory",
            "startDate": "2024",
            "endDate": "2024",
            "description": "",
            "duration": "0 years"
          },
          {
            "position": "FULL STACK WEB DEVELOPER",
            "company": "3D Smart Factory",
            "startDate": "2023",
            "endDate": "2023",
            "description": "",
            "duration": "0 years"
          }
        ],
        "skills": [
          "javascript",
          "typescript",
          "python",
          "react",
          "angular",
          "aws",
          "docker",
          "kubernetes"
        ],
        "languages": [
          "english",
          "french",
          "arabic"
        ],
        "certifications": [
          {
            "name": "AWS Certified Developer – Associate",
            "issuer": "",
            "date": ""
          },
          {
            "name": "Oracle Certified Professional, Java SE Developer",
            "issuer": "",
            "date": ""
          }
        ],
        "internships": [],
        "totalExperienceYears": 4,
        "seniorityLevel": "Mid Level",
        "industry": "",
        "keywords": ["javascript", "typescript", "python", ...]
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 41,
    "totalPages": 1,
    "hasMore": false
  }
}
```

---

## 2. GET CV EXTRACTED DATA ENDPOINT
**Backend Route:** `GET /api/cvs/{id}/extracted-data`
**Frontend Hook:** `useGetCVExtractedDataQuery(id)`

### Backend Raw Data (from `CVExtractedData` table)
```json
{
  "id": "extracted-data-uuid",
  "cvId": "dd8a004f-0a49-45df-9dc2-41cb1ba489e6",
  "fullName": "YOUNES DARRASSI",
  "email": "darrassi-you@upf.ac.ma",
  "phone": "212629419616",
  "location": "FES, Morocco",
  "city": "FES",
  "country": "Morocco",
  "age": null,
  "gender": null,
  "education": [
    {
      "degree": "COMPUTER ENGINEERING STATE ENGINEER",
      "institution": "Université Privée de Fès",
      "field_of_study": null,
      "start_date": "2022",
      "end_date": "2024"
    }
  ],
  "experience": [
    {
      "position": "FULL STACK DEVELOPER | AI INTEGRATION SPECIALIST",
      "company": "3D Smart Factory",
      "startDate": "2024",
      "endDate": "2024",
      "description": "",
      "duration": "0 years"
    }
  ],
  "skills": {
    "technical": ["javascript", "typescript", "python", "react", "aws"],
    "soft": [],
    "tools": ["jira", "git"]
  },
  "languages": ["english", "french", "arabic"],
  "certifications": [
    {
      "name": "AWS Certified Developer – Associate",
      "issuer": "",
      "date": ""
    }
  ],
  "internships": [],
  "totalExperienceYears": 4,
  "seniorityLevel": "Mid Level",
  "industry": "",
  "keywords": ["javascript", "typescript", "python", ...],
  "rawText": "YOUNES DARRASSI\nFULL STACK SOFTWARE ENGINEER...",
  "createdAt": "2026-01-18T17:11:49.000Z",
  "updatedAt": "2026-01-18T17:11:49.000Z"
}
```

### Backend Transformed Response (what `getCVExtractedData` returns)
```json
{
  "success": true,
  "data": {
    "id": "extracted-data-uuid",
    "cvId": "dd8a004f-0a49-45df-9dc2-41cb1ba489e6",
    "personalInfo": {
      "fullName": "YOUNES DARRASSI",
      "email": "darrassi-you@upf.ac.ma",
      "phone": "212629419616",
      "address": "FES, Morocco",
      "city": "FES",
      "country": "Morocco"
    },
    "experience": [
      {
        "position": "FULL STACK DEVELOPER | AI INTEGRATION SPECIALIST",
        "company": "3D Smart Factory",
        "startDate": "2024",
        "endDate": "2024",
        "description": "",
        "duration": "0 years"
      }
    ],
    "education": [
      {
        "degree": "COMPUTER ENGINEERING STATE ENGINEER",
        "institution": "Université Privée de Fès",
        "field_of_study": null,
        "start_date": "2022",
        "end_date": "2024"
      }
    ],
    "skills": [
      "javascript",
      "typescript",
      "python",
      "react",
      "aws"
    ],
    "languages": ["english", "french", "arabic"],
    "certifications": [
      {
        "name": "AWS Certified Developer – Associate",
        "issuer": "",
        "date": ""
      }
    ],
    "internships": [],
    "totalExperienceYears": 4,
    "seniorityLevel": "Mid Level",
    "industry": "",
    "keywords": ["javascript", "typescript", ...],
    "rawText": "YOUNES DARRASSI\nFULL STACK SOFTWARE ENGINEER...",
    "createdAt": "2026-01-18T17:11:49.000Z",
    "updatedAt": "2026-01-18T17:11:49.000Z"
  }
}
```

---

## 3. FRONTEND - CV CARD DISPLAY STRUCTURE
**Type:** `CVCardDisplay`
**Usage:** Displaying in `CVList` component (home page)
**Generated by:** `apiCVService.toCVCardDisplay(cv)`

```json
{
  "id": "dd8a004f-0a49-45df-9dc2-41cb1ba489e6",
  "photo": "https://ui-avatars.com/api/?name=YOUNES%20DARRASSI",
  "fullName": "YOUNES DARRASSI",
  "position": "FULL STACK DEVELOPER | AI INTEGRATION SPECIALIST",
  "location": "FES, Morocco",
  "city": "FES",
  "country": "Morocco",
  "experience": 4,
  "contractType": "CDI",
  "workMode": "Hybride",
  "mainSkills": ["javascript", "typescript", "python", "react", "aws"],
  "languages": ["english", "french", "arabic"],
  "email": "darrassi-you@upf.ac.ma",
  "phone": "212629419616",
  "totalExperienceYears": 4,
  "seniorityLevel": "Mid Level",
  "industry": "",
  "uploadedAt": "2026-01-18T17:11:48.000Z",
  "processingStatus": "COMPLETED",
  "education": [
    {
      "institution": "Université Privée de Fès",
      "degree": "COMPUTER ENGINEERING STATE ENGINEER",
      "field": null,
      "year": "2024"
    }
  ],
  "workExperience": [
    {
      "company": "3D Smart Factory",
      "position": "FULL STACK DEVELOPER | AI INTEGRATION SPECIALIST",
      "duration": "0 years",
      "startDate": "2024",
      "endDate": "2024",
      "description": ""
    }
  ],
  "certifications": [
    {
      "name": "AWS Certified Developer – Associate",
      "issuer": "",
      "date": ""
    }
  ],
  "internships": [],
  "aiSummary": "Younes Darrassi is a professional at Mid Level level..."
}
```

---

## 4. FRONTEND - CV INTERNAL TYPE STRUCTURE
**Type:** `CV`
**Usage:** Internal representation after transformation
**Generated by:** `apiCVService.transformApiCV(apiCV)`

```json
{
  "id": "dd8a004f-0a49-45df-9dc2-41cb1ba489e6",
  "personalInfo": {
    "fullName": "YOUNES DARRASSI",
    "email": "darrassi-you@upf.ac.ma",
    "phone": "212629419616",
    "address": "FES, Morocco",
    "city": "FES",
    "country": "Morocco",
    "age": 0,
    "nationality": "Morocco"
  },
  "professional": {
    "position": "FULL STACK DEVELOPER | AI INTEGRATION SPECIALIST",
    "totalExperience": 4,
    "seniority": "Mid Level",
    "currentSalary": 0,
    "expectedSalary": 0,
    "contractType": "CDI",
    "workMode": "Hybride"
  },
  "skills": [
    {
      "name": "javascript",
      "level": "Intermédiaire",
      "category": "Technical"
    },
    {
      "name": "typescript",
      "level": "Intermédiaire",
      "category": "Technical"
    }
  ],
  "languages": [
    {
      "name": "english",
      "level": "B2"
    },
    {
      "name": "french",
      "level": "B2"
    },
    {
      "name": "arabic",
      "level": "B2"
    }
  ],
  "experience": [
    {
      "company": "3D Smart Factory",
      "position": "FULL STACK DEVELOPER | AI INTEGRATION SPECIALIST",
      "duration": "0 years",
      "startDate": "2024",
      "endDate": "2024",
      "description": "",
      "achievements": []
    }
  ],
  "education": [
    {
      "institution": "Université Privée de Fès",
      "degree": "COMPUTER ENGINEERING STATE ENGINEER",
      "field": null,
      "year": "2024",
      "grade": null,
      "description": null
    }
  ],
  "metadata": {
    "fileName": "Younes_Darrassi_CV.pdf",
    "uploadedAt": "2026-01-18T17:11:48.000Z",
    "processingStatus": "COMPLETED",
    "fileSize": 245000,
    "rawData": {
      "id": "dd8a004f-0a49-45df-9dc2-41cb1ba489e6",
      "extractedData": {
        "totalExperienceYears": 4,
        "seniorityLevel": "Mid Level",
        "skills": { ... },
        "languages": [ ... ]
      }
    }
  }
}
```

---

## 5. FRONTEND - PROFILE DETAILS SCREEN
**Screen:** `mobile/app/cvs/[id].tsx`
**Endpoint Called:** 
- `useGetCVByIdQuery(cvId)` → returns CV object
- `useGetCVExtractedDataQuery(cvId)` → returns extracted data

### Expected Rendered Sections

```json
{
  "headerInfo": {
    "fileName": "Younes_Darrassi_CV.pdf",
    "status": "COMPLETED",
    "uploadDate": "January 18, 2026",
    "fileSize": "239 KB"
  },
  
  "personalSection": {
    "fullName": "YOUNES DARRASSI",
    "email": "darrassi-you@upf.ac.ma",
    "phone": "212629419616",
    "address": "FES, Morocco"
  },
  
  "professionalSection": {
    "totalExperienceYears": 4,
    "seniorityLevel": "Mid Level"
  },
  
  "skillsSection": {
    "skills": [
      "javascript",
      "typescript",
      "python",
      "react",
      "aws",
      "docker"
    ]
  },
  
  "experienceSection": [
    {
      "position": "FULL STACK DEVELOPER | AI INTEGRATION SPECIALIST",
      "company": "3D Smart Factory",
      "duration": "0 years",
      "startDate": "2024",
      "endDate": "2024"
    },
    {
      "position": "FULL STACK WEB DEVELOPER",
      "company": "3D Smart Factory",
      "duration": "0 years",
      "startDate": "2023",
      "endDate": "2023"
    }
  ],
  
  "educationSection": [
    {
      "degree": "COMPUTER ENGINEERING STATE ENGINEER",
      "institution": "Université Privée de Fès",
      "year": "2024"
    },
    {
      "degree": "BACHELOR IN MATHEMATICAL AND COMPUTER SCIENCES",
      "institution": "Faculté dhar el mahraz",
      "year": "2020"
    }
  ]
}
```

---

## 6. FIELD NAME MAPPING
**Backend → Frontend Transformations**

| Backend Field | Backend Location | Frontend Transform | Frontend Field | Frontend Location |
|---|---|---|---|---|
| `fullName` | CV.extractedData | personalize | CV.personalInfo.fullName | CV Card & Profile |
| `totalExperienceYears` | CV.extractedData | CV.professional.totalExperience | Experience section |
| `seniorityLevel` | CV.extractedData | CV.professional.seniority | Badge display |
| `experience[].position` | CV.extractedData | CV.experience[].position | Experience card |
| `experience[].company` | CV.extractedData | CV.experience[].company | Experience card |
| `education[].degree` | CV.extractedData | CV.education[].degree | Education card |
| `education[].institution` | CV.extractedData | CV.education[].institution | Education card |
| `education[].start_date` | CV.extractedData | CV.education[].year (uses end_date) | Education card |
| `skills` (flat array) | CV.extractedData | CV.skills (with metadata) | Skills badges |
| `languages` (array) | CV.extractedData | CV.languages (with proficiency) | Language tags |
| `location` | CV.extractedData | CV.personalInfo.address | Location display |
| `city` | CV.extractedData | CV.personalInfo.city | Map/Location |
| `country` | CV.extractedData | CV.personalInfo.country | Map/Location |

---

## 7. KEY DIFFERENCES

### Backend sends:
- ✅ `experience[].position` (job title)
- ✅ `totalExperienceYears` (calculated)
- ✅ `seniorityLevel` (calculated from years)
- ✅ Flat skills array
- ✅ City and country separately
- ❌ No `seniority` key (uses `seniorityLevel`)

### Frontend expects:
- ✅ CV.professional.position
- ✅ CV.professional.totalExperience (maps to backend's `totalExperienceYears`)
- ✅ CV.professional.seniority (maps to backend's `seniorityLevel`)
- ✅ CV.skills with name/level/category
- ✅ CV.personalInfo.city and .country
- ✅ Proper transformation in `transformApiCV()`
