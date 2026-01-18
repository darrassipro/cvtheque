# LLM Response Alignment with Database Structure

## Overview
Updated the LLM extraction system to ensure the response structure aligns perfectly with the database schema, particularly for skills categorization.

## Changes Made

### 1. Updated LLM Prompt Template
**File:** `server/src/services/llm/prompts.ts`

#### System Prompt
- Added explicit rule for skills categorization:
  - **technical**: Programming languages, frameworks, databases, technical competencies
  - **soft**: Communication, leadership, teamwork, problem-solving
  - **tools**: IDEs, software applications, platforms, development tools

#### User Prompt (JSON Schema)
Updated the expected JSON structure to match database schema:

```json
{
  "skills": {
    "technical": ["array of technical/hard skills"],
    "soft": ["array of soft skills"],
    "tools": ["array of tools and technologies"]
  }
}
```

**Before:** `"skills": ["flat array"]`  
**After:** `"skills": { "technical": [], "soft": [], "tools": [] }`

Also added missing fields:
- `personal_info.city`
- `personal_info.country`
- `education[].description`
- `experience[].location`
- `languages[].spoken`
- `languages[].written`
- `certifications[].expiry_date`
- `certifications[].credential_id`

### 2. Updated TypeScript Interfaces
**File:** `server/src/types/index.ts`

#### CVExtractionResult Interface
```typescript
skills: {
  technical: string[];
  soft: string[];
  tools: string[];
};
languages: LanguageEntry[];  // Changed from string[]
```

#### Updated Interfaces
- **PersonalInfo**: Added `city?` and `country?`
- **EducationEntry**: Added `description?`
- **ExperienceEntry**: Added `location?`
- **LanguageEntry**: Changed from simple string array to structured object with `spoken?` and `written?`
- **CertificationEntry**: Added `expiry_date?` and `credential_id?`

### 3. Updated CV Processor
**File:** `server/src/services/cvProcessor.ts`

Added backward-compatible skills handling:

```typescript
// Handle skills: LLM now returns categorized skills directly
let skills;
if (cvData.skills && typeof cvData.skills === 'object' && 'technical' in cvData.skills) {
  // Already categorized from LLM (new format)
  skills = {
    technical: cvData.skills.technical || [],
    soft: cvData.skills.soft || [],
    tools: cvData.skills.tools || [],
  };
} else if (Array.isArray(cvData.skills)) {
  // Fallback for old flat array format
  skills = {
    technical: cvData.skills.filter(s => this.isTechnicalSkill(s)),
    soft: cvData.skills.filter(s => this.isSoftSkill(s)),
    tools: cvData.skills.filter(s => this.isToolSkill(s)),
  };
} else {
  skills = { technical: [], soft: [], tools: [] };
}
```

## Benefits

1. **Improved Accuracy**: LLM now categorizes skills during extraction instead of post-processing
2. **Better Data Quality**: Categorization happens at the source with AI intelligence
3. **Backward Compatible**: Fallback to old filtering logic if LLM returns flat array
4. **Complete Schema Alignment**: All fields now match between LLM response and database
5. **Reduced Processing**: No need for post-processing categorization logic

## Testing Recommendations

1. Upload a new CV and verify skills are properly categorized in the database
2. Check that age, gender, city, and country are extracted correctly
3. Verify education descriptions and experience locations are captured
4. Test language proficiency levels with spoken/written details
5. Ensure certifications include expiry dates and credential IDs when present

## Backward Compatibility

The changes are fully backward compatible:
- Old CVs with flat skills arrays will continue to work
- The processor has fallback logic for both old and new formats
- No database migration required as the schema already supported the structure

## Related Files

- Database Model: `server/src/models/CVExtractedData.ts`
- Controller: `server/src/controllers/cv.controller.ts`
- API Types: `server/src/types/index.ts`
- LLM Service: `server/src/services/llm/providers/`
