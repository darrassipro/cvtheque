import { vi, beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// Mock sharp library (image processing) to avoid ARM64 Windows issues
vi.mock('sharp', () => {
  return {
    default: vi.fn(() => ({
      resize: vi.fn().mockReturnThis(),
      jpeg: vi.fn().mockReturnThis(),
      toBuffer: vi.fn().mockResolvedValue(Buffer.from('fake-image-data')),
      metadata: vi.fn().mockResolvedValue({ 
        width: 400, 
        height: 400, 
        format: 'jpeg' 
      }),
    })),
  };
});

// Mock external services for testing
vi.mock('../src/services/storage/googleDrive.js', () => ({
  getGoogleDriveService: () => ({
    isAvailable: () => false,
    uploadFile: vi.fn(),
    downloadFile: vi.fn(),
    deleteFile: vi.fn(),
    getFileMetadata: vi.fn(),
  }),
  GoogleDriveService: vi.fn(),
}));

vi.mock('../src/services/storage/cloudinary.js', () => ({
  getCloudinaryService: () => ({
    isAvailable: () => false,
    uploadProfilePhoto: vi.fn(),
    deleteImage: vi.fn(),
  }),
  CloudinaryService: vi.fn(),
}));

// Mock photo extractor service
vi.mock('../src/services/parsing/photoExtractor.js', () => ({
  getPhotoExtractorService: () => ({
    extractPhoto: vi.fn().mockResolvedValue(null),
    isLikelyProfilePhoto: vi.fn().mockResolvedValue(false),
  }),
  PhotoExtractorService: vi.fn(),
}));

// Mock LLM services
vi.mock('../src/services/llm/index.js', async () => {
  const actual = await vi.importActual('../src/services/llm/index.js');
  return {
    ...actual,
    getLLMService: () => ({
      isProviderAvailable: () => false,
      extractCVData: vi.fn().mockResolvedValue({
        result: {
          personal_info: {
            full_name: 'Test User',
            email: 'test@test.com',
            phone: '+1234567890',
            location: 'Test City',
            age: 30,
            gender: 'Male',
          },
          education: [],
          experience: [],
          skills: ['JavaScript', 'TypeScript', 'Node.js'],
          languages: [{ language: 'English', proficiency: 'Native' }],
          certifications: [],
          internships: [],
          metadata: {
            total_experience_years: 5,
            seniority_level: 'Senior',
            industry: 'Technology',
            keywords: ['software', 'development'],
          },
          photo_detected: false,
          confidence_score: 0.9,
        },
        provider: 'gemini',
        model: 'gemini-1.5-flash',
      }),
      generateSummary: vi.fn().mockResolvedValue('Test AI Summary'),
      getProvider: vi.fn().mockReturnValue({
        provider: 'GEMINI',
        isAvailable: () => false,
        extractCVData: vi.fn(),
        generateSummary: vi.fn(),
        generateCompletion: vi.fn(),
      }),
      getAvailableProviders: vi.fn().mockReturnValue([]),
      setDefaultProvider: vi.fn(),
      getDefaultProvider: vi.fn().mockReturnValue('GEMINI'),
    }),
  };
});

// Mock Tesseract (OCR) - can be slow and problematic in tests
vi.mock('tesseract.js', () => ({
  createWorker: vi.fn().mockResolvedValue({
    recognize: vi.fn().mockResolvedValue({
      data: {
        text: 'Mock OCR text',
        confidence: 85,
      },
    }),
    terminate: vi.fn().mockResolvedValue(undefined),
  }),
}));

// Global test timeout
vi.setConfig({ testTimeout: 30000 });