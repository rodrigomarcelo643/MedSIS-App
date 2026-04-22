# Image Blur Analysis Feature

## Overview

The **Image Blur Analysis** feature is an ML-powered quality control system that automatically checks document images for blur before upload. This ensures that only clear, readable documents are submitted as academic requirements.

## How It Works

### 1. Pre-Upload Quality Check

When a student selects an image for upload in the **Folder** screen, the system automatically performs a blur analysis before allowing the upload to proceed.

### 2. ML API Analysis

The image is sent to the ML API endpoint (`/api/app/blur-check`) which uses **Laplacian variance** algorithm to detect blur:

- **Laplacian Variance**: A computer vision technique that measures edge sharpness
- Higher values indicate sharper images (threshold: ~100)
- Lower values indicate blurry images

### 3. Quality Scoring

The analysis returns:

| Metric | Description | Range |
|--------|-------------|-------|
| `is_blurry` | Boolean flag indicating if image is blurry | true/false |
| `blur_score` | Raw Laplacian variance score | 0-1000+ |
| `quality_score` | Normalized percentage score | 0-100% |

### 4. User Feedback

The system provides visual feedback through a **Quality Modal**:

- **Sharpness Progress Bar**: Shows sharp percentage (green)
- **Blur Progress Bar**: Shows blur percentage (orange)
- **Quality Status**: Clear pass/fail indication
- **Auto-Upload Countdown**: 3-second timer before automatic upload (if quality passes)

### 5. Upload Decision

```
If is_blurry OR blur_score > 40%:
    → Show blur error modal
    → Prevent upload
    → User must select clearer image
Else:
    → Show quality success modal
    → Auto-upload after countdown
```

## Architecture

### File Structure

```
ARDMS-App/
├── services/
│   └── imageAnalysisService.ts    # API service for ML endpoints
├── lib/
│   └── imageAnalysisUtils.ts      # Utility functions for analysis results
├── app/
│   └── (tabs)/
│       └── folder.tsx             # UI implementation with blur check modal
└── tests/
    └── screens/
        └── folder-blur-check.test.ts  # Unit tests for blur detection
```

### Key Components

#### 1. Image Analysis Service (`services/imageAnalysisService.ts`)

```typescript
// Single image analysis
analyzeImage(fileId: number, apiKey: string): Promise<ImageAnalysisResult>

// Batch analysis for multiple files
batchAnalyzeImages(fileIds: number[], apiKey: string): Promise<BatchAnalysisResult>
```

**Interfaces:**

```typescript
interface ImageAnalysisResult {
  success: boolean;
  result?: {
    is_blurry?: boolean;
    blur_score?: number;
    quality_score?: number;
    issues?: string[];
    upload?: {
      student_name: string;
      requirement_name: string;
      file_name: string;
    };
  };
  message?: string;
}
```

#### 2. Analysis Utilities (`lib/imageAnalysisUtils.ts`)

Helper functions for working with analysis results:

| Function | Purpose |
|----------|---------|
| `isImageBlurry(result)` | Check if image failed blur test |
| `getBlurScore(result)` | Get raw blur score |
| `getQualityScore(result)` | Get normalized quality percentage |
| `getImageIssues(result)` | Get list of detected issues |
| `isImageQualityAcceptable(result, minScore)` | Check if quality meets threshold |
| `formatAnalysisResult(result)` | Format result for display |
| `getQualityStatusColor(result)` | Get color code (green/yellow/red) |

#### 3. UI Implementation (`app/(tabs)/folder.tsx`)

Key states and functions:

```typescript
// Blur check states
const [checkingBlur, setCheckingBlur] = useState<boolean>(false);
const [showQualityModal, setShowQualityModal] = useState<boolean>(false);
const [showBlurErrorModal, setShowBlurErrorModal] = useState<boolean>(false);
const [blurPercentage, setBlurPercentage] = useState<number>(0);
const [sharpPercentage, setSharpPercentage] = useState<number>(0);

// Blur check function
const checkImageBlur = async (fileInfo: FileInfo): Promise<{
  isBlurry: boolean;
  blurScore: number;
  sharpScore: number;
}> => {
  // Calls ML API: POST ${ML_API_BASE_URL}/api/app/blur-check
  // Returns blur analysis results
}
```

## API Endpoints

### Primary Endpoint

```
POST /api/app/blur-check
Content-Type: multipart/form-data

Request:
- file: Image file (multipart)

Response:
{
  "is_blurry": boolean,
  "blur_score": number,      // Laplacian variance
  "confidence_score": number
}
```

### Review Endpoints (for backend analysis)

```
POST /api/review
Body: { file_id: number, api_key: string }

POST /api/batch-review
Body: { file_ids: number[], api_key: string }
```

## Quality Thresholds

| Threshold | Value | Description |
|-----------|-------|-------------|
| Blur Limit | 40% | Maximum acceptable blur percentage |
| Quality Pass | 60%+ | Minimum quality score for auto-upload |
| Quality Good | 80%+ | High quality image (green status) |
| Quality Fair | 60-79% | Acceptable quality (yellow status) |
| Quality Poor | <60% | Rejected quality (red status) |

## Testing

The feature includes comprehensive unit tests:

```typescript
// tests/screens/folder-blur-check.test.ts

Test Cases:
- ✅ Blur detection with sharp image (score < 40%)
- ✅ Blur detection with blurry image (score > 40%)
- ✅ Quality modal display with correct percentages
- ✅ Auto-upload countdown functionality
- ✅ Blur error modal for rejected images
- ✅ Edge cases (null/undefined scores)
```

Run tests:
```bash
node tests/test-runner.js
```

## Usage Flow

```
Student selects image
        ↓
System checks permissions
        ↓
Image blur analysis API call
        ↓
Parse blur_score & is_blurry
        ↓
Calculate sharp/blur percentages
        ↓
Quality decision
        ↓
    ┌─────────┴─────────┐
    ↓                   ↓
Too Blurry            Quality OK
    ↓                   ↓
Error Modal        Success Modal
    ↓                   ↓
Retry Upload      Auto-upload (3s)
```

## Benefits

1. **Document Quality**: Ensures all submitted requirements are readable
2. **Reduced Rejections**: Prevents blurry uploads that would be rejected by faculty
3. **User Experience**: Real-time feedback with visual indicators
4. **Automated**: No manual intervention required - seamless integration
5. **Configurable**: Thresholds can be adjusted via backend ML API

## Configuration

The ML API endpoint is configured in `constants/Config.ts`:

```typescript
export const ML_API_BASE_URL = 'https://your-ml-api-domain.com';
```

## Future Enhancements

- Support for additional quality checks (lighting, rotation, cropping)
- Batch analysis for multiple simultaneous uploads
- Quality history tracking per student
- Custom threshold settings per requirement type
