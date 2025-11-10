# Financial Aid Predictor - Implementation Guide

## Overview

The Financial Aid Predictor is a sophisticated feature that provides personalized financial aid estimates for students based on their academic profile, financial situation, and university-specific aid policies. This feature has been fully implemented with real prediction algorithms.

## Architecture

### Components

1. **Frontend Component**: `src/components/FinancialAidPredictor.tsx`
   - React component that displays predictions to users
   - Handles loading, error states, and user interactions
   - Includes fallback calculation for offline scenarios

2. **Backend Service**: `server/services/financialAidPredictor.js`
   - Core prediction algorithm implementation
   - Calculates EFC (Expected Family Contribution)
   - Determines merit-based and need-based aid
   - Provides optimistic, realistic, and conservative scenarios

3. **API Routes**: `server/routes/financialProfile.js`
   - `GET /api/profile/financial` - Fetch user's financial profile
   - `PUT /api/profile/financial` - Update user's financial profile
   - `POST /api/profile/financial/predict` - Predict aid for a single university
   - `POST /api/profile/financial/predict-batch` - Predict aid for multiple universities

4. **Database**: `server/database/migrations/19_create_user_financial_profiles.sql`
   - Stores user financial profiles
   - Fields: GPA, SAT/ACT scores, family income, student type, special talents

5. **Data Layer**: `server/data/userFinancialProfiles.js`
   - CRUD operations for financial profiles
   - Data validation and normalization

6. **API Client**: `src/lib/api.ts`
   - `financialProfileAPI.getProfile()` - Get user profile
   - `financialProfileAPI.updateProfile(data)` - Update profile
   - `financialProfileAPI.predictAid(universityId, universityData)` - Get prediction
   - `financialProfileAPI.predictAidBatch(universityIds)` - Batch predictions

## Prediction Algorithm

### Key Components

#### 1. Expected Family Contribution (EFC)
```javascript
// Simplified federal methodology
- Income ≤ $30k: 5% of income
- Income $30k-$50k: Progressive scale starting at $1,500
- Income $50k-$75k: Progressive scale starting at $3,900
- Income $75k-$100k: Progressive scale starting at $9,400
- Income $100k-$150k: Progressive scale starting at $15,650
- Income > $150k: Progressive scale starting at $30,650
```

#### 2. Academic Merit Score (0-100)
```javascript
Components:
- GPA (0-40 points)
  - 4.0+: 40 points
  - 3.8-3.99: 36 points
  - 3.5-3.79: 30 points
  - 3.0-3.49: 22 points
  - 2.5-2.99: 12 points
  - < 2.5: 5 points

- SAT Score (0-35 points)
  - 1500+: 35 points
  - 1400-1499: 30 points
  - 1300-1399: 24 points
  - 1200-1299: 18 points
  - 1100-1199: 12 points
  - < 1100: 6 points

- ACT Score (0-35 points)
  - 33+: 35 points
  - 30-32: 30 points
  - 27-29: 24 points
  - 24-26: 18 points
  - 21-23: 12 points
  - < 21: 6 points

- Special Talents (0-25 points)
  - 8 points per talent, max 25 points
```

#### 3. Need-Based Aid Calculation
```javascript
1. Calculate EFC from family income
2. Determine demonstrated need: max(0, tuition - EFC)
3. Apply university policy:
   - Need-blind schools: 95% of demonstrated need
   - Regular schools: 60-80% of demonstrated need (scaled by % receiving aid)
4. First-generation bonus: +8% of demonstrated need
```

#### 4. Merit-Based Aid Calculation
```javascript
1. Calculate merit score (0-100)
2. Determine merit factor based on score:
   - 90+: 70% of base aid
   - 75-89: 50% of base aid
   - 60-74: 35% of base aid
   - 45-59: 20% of base aid
   - < 45: 12% of base aid
3. Apply adjustments:
   - International students without scholarships: 40% reduction
   - In-state at public universities: 15% increase
```

#### 5. Scholarships Calculation
```javascript
- International students (if university offers):
  - Base: min($20k, 30% of avg aid package)
  - Scaled by merit score (0-100)
  
- Domestic students:
  - Base: 20% of avg aid package
  - Scaled by merit score
  - First-generation: 30% increase
```

#### 6. Scenarios
```javascript
- Optimistic: 25% more aid than realistic
- Realistic: Calculated aid amount
- Conservative: 25% less aid than realistic
```

#### 7. Confidence Score (50-95%)
```javascript
Base: 50%
Bonuses:
- Has avg financial aid package: +10%
- Has % receiving aid: +10%
- Has need-blind policy: +5%
- Has scholarship info: +5%
- User has GPA: +4%
- User has test scores: +4%
- User has income data: +8%
- User has residency status: +2%
- User has in-state status: +2%
```

## Data Flow

### Prediction Request Flow

```
User Profile Page
    ↓
Financial Aid Predictor Component
    ↓
financialProfileAPI.predictAid()
    ↓
POST /api/profile/financial/predict
    ↓
1. Validate user authentication
2. Fetch user's financial profile from DB
3. Fetch/validate university data
4. Call predictFinancialAid(university, userProfile)
5. Return prediction with metadata
    ↓
Component displays results with:
- Gross tuition
- Estimated aid (breakdown)
- Net cost
- Cost of living
- Total out-of-pocket
- 3 scenarios
- Confidence score
```

## Usage Examples

### Frontend - Display Predictor

```tsx
import FinancialAidPredictor from '../components/FinancialAidPredictor'

function UniversityPage() {
  const [userProfile, setUserProfile] = useState(null)
  
  useEffect(() => {
    loadProfile()
  }, [])
  
  const loadProfile = async () => {
    const profile = await financialProfileAPI.getProfile()
    setUserProfile(profile)
  }
  
  return (
    <FinancialAidPredictor 
      university={university} 
      userProfile={userProfile}
      onRequestCompleteProfile={() => openProfileModal()}
    />
  )
}
```

### Backend - Call Prediction Service

```javascript
import { predictFinancialAid } from '../services/financialAidPredictor.js'

// Single prediction
const prediction = predictFinancialAid(university, userProfile)

// Batch predictions
import { predictFinancialAidBatch } from '../services/financialAidPredictor.js'
const predictions = predictFinancialAidBatch(universities, userProfile)
```

### API - Make Prediction Request

```javascript
// Single university
const response = await financialProfileAPI.predictAid(
  universityId,
  optionalUniversityData
)

// Multiple universities
const response = await financialProfileAPI.predictAidBatch([
  'uni-id-1',
  'uni-id-2',
  'uni-id-3'
])
```

## User Profile Requirements

### Required Fields (for accurate prediction)
- `family_income` (number) - Annual family income in USD
- `international_student` (boolean) - Student's residency status
- `in_state` (boolean) - Whether student is in-state for public universities

### Optional Fields (improve accuracy)
- `gpa` (number, 0.0-4.0) - Grade point average
- `sat_score` (number, 400-1600) - SAT score
- `act_score` (number, 1-36) - ACT score
- `first_generation` (boolean) - First-generation college student
- `special_talents` (string[]) - Array of special talents/achievements

### Incomplete Profile Handling

When user profile is incomplete or missing:
1. Component displays a prompt to complete profile
2. "Complete profile" button triggers modal/redirect
3. Prediction is not displayed until minimum requirements are met

## University Data Requirements

### Required Fields
- `id` - University identifier
- `name` - University name
- One of:
  - `tuition_international`
  - `tuition_out_of_state`
  - `tuition_in_state`

### Optional Fields (improve accuracy)
- `avg_financial_aid_package` - Average aid package amount
- `percentage_receiving_aid` - Percentage of students receiving aid
- `need_blind_admission` - Whether university has need-blind admissions
- `scholarships_international` - Whether international scholarships are available
- `cost_of_living_est` - Estimated annual cost of living
- `type` - University type ('public' or 'private')

## Error Handling

### Frontend
- **API Error**: Shows error message with retry button
- **Fallback**: Uses simplified client-side calculation if API fails
- **Network Error**: Graceful degradation to fallback calculation
- **Missing Profile**: Shows prompt to complete profile

### Backend
- **Missing Profile**: Returns 400 with clear error message
- **Invalid University**: Returns 404 error
- **Calculation Error**: Returns 500 with error details
- **Batch Size Limit**: Maximum 20 universities per batch request

## Testing

### Manual Testing Checklist

1. **Complete Profile Flow**
   - [ ] Create new user account
   - [ ] Navigate to university detail page
   - [ ] See "Complete profile" prompt
   - [ ] Fill out financial profile
   - [ ] Verify prediction appears

2. **Prediction Accuracy**
   - [ ] Test with high GPA (3.8+) and high SAT (1400+)
   - [ ] Test with low income ($30k)
   - [ ] Test with high income ($150k+)
   - [ ] Test as international student
   - [ ] Test as in-state student
   - [ ] Test with first-generation status

3. **Edge Cases**
   - [ ] Incomplete university data
   - [ ] Missing optional profile fields
   - [ ] API failure (disconnect backend)
   - [ ] Multiple rapid predictions
   - [ ] Batch prediction with 20 universities

4. **UI/UX**
   - [ ] Loading state displays properly
   - [ ] Error state displays properly
   - [ ] Results animate smoothly
   - [ ] Scenarios expand/collapse
   - [ ] Mobile responsiveness

### API Testing

```bash
# Test single prediction
curl -X POST http://localhost:3001/api/profile/financial/predict \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"university_id": "uni-123"}'

# Test batch prediction
curl -X POST http://localhost:3001/api/profile/financial/predict-batch \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"university_ids": ["uni-123", "uni-456"]}'
```

## Performance Considerations

### Optimization Strategies

1. **Caching**
   - Cache predictions for 24 hours (recommended)
   - Invalidate cache when user profile changes
   - Invalidate cache when university data changes

2. **Batch Requests**
   - Use batch endpoint for multiple universities
   - Limit to 20 universities per request
   - Consider pagination for larger lists

3. **Client-Side Fallback**
   - Simplified calculation runs in browser
   - No backend dependency for basic functionality
   - Graceful degradation

## Future Enhancements

### Potential Improvements

1. **Machine Learning Model**
   - Train on historical financial aid data
   - Improve prediction accuracy over time
   - Personalize based on similar students

2. **Additional Factors**
   - Academic major (some majors get more aid)
   - Extracurricular activities
   - Athletics/arts participation
   - Legacy status
   - State of residency (for specific programs)

3. **External Data Integration**
   - FAFSA API integration
   - CSS Profile data
   - Real-time financial aid availability

4. **Enhanced Reporting**
   - Compare predictions across universities
   - 4-year cost projections
   - Student loan scenarios
   - Work-study opportunities

5. **User Feedback Loop**
   - Collect actual aid packages
   - Compare predictions vs. reality
   - Improve algorithm based on feedback

## Troubleshooting

### Common Issues

**Issue**: Prediction shows $0 aid
- **Cause**: Family income very high or missing university aid data
- **Solution**: Verify university has `avg_financial_aid_package` set

**Issue**: Prediction seems too optimistic
- **Cause**: University has generous need-blind policy
- **Solution**: Check `need_blind_admission` flag and consider conservative scenario

**Issue**: API returns 400 "Profile not found"
- **Cause**: User hasn't completed financial profile
- **Solution**: Direct user to complete profile first

**Issue**: Confidence score is low (<60%)
- **Cause**: Missing data in university or user profile
- **Solution**: Encourage user to complete profile and verify university data

**Issue**: Fallback calculation used instead of API
- **Cause**: Backend server not running or network error
- **Solution**: Check server status and network connectivity

## Security Considerations

1. **Authentication Required**: All endpoints require valid JWT token
2. **User Isolation**: Users can only access their own profiles
3. **Rate Limiting**: Apply rate limits to prevent abuse
4. **Input Validation**: Validate all user inputs on server
5. **Sensitive Data**: Family income is redacted in API responses
6. **HTTPS Only**: Encrypt all data in transit

## Maintenance

### Regular Tasks

1. **Update Tuition Data**: Update university tuition annually
2. **Review Algorithm**: Quarterly review of prediction accuracy
3. **Monitor Errors**: Track API errors and fallback usage
4. **User Feedback**: Collect and review user feedback on predictions
5. **Database Cleanup**: Archive old profile versions

### Key Metrics to Monitor

- Prediction request volume
- Average confidence scores
- Fallback calculation usage rate
- API error rates
- User profile completion rates
- Time to first prediction

## Conclusion

The Financial Aid Predictor is now fully functional with:
✅ Sophisticated server-side prediction algorithm
✅ Comprehensive API endpoints
✅ React component with loading/error states
✅ Client-side fallback for resilience
✅ Batch prediction support
✅ Complete documentation

The feature provides real value to students by helping them understand potential costs before applying, making the college selection process more transparent and informed.
