# AuthContext Import Error Fix Summary

## Issue Description
Build errors were occurring in referral-related components due to imports of a non-existent `AuthContext` module. The project uses `localStorage` for authentication token management, not a React Context.

## Affected Files
1. ✅ `src/pages/ReferralDashboard.tsx` - Fixed
2. ✅ `src/pages/admin/AdminReferrals.tsx` - Fixed

## Root Cause
Both files were attempting to import and use a `useAuth` hook from `../../context/AuthContext`, which doesn't exist in the project. The authentication pattern used throughout the codebase is direct `localStorage` access.

## Solution Applied

### Pattern Changed
**Before:**
```typescript
import { useAuth } from '../../context/AuthContext';

const Component = () => {
  const { token } = useAuth();
  
  const fetchData = async () => {
    if (!token) return;
    // Use token...
  };
};
```

**After:**
```typescript
const Component = () => {
  const getToken = () => localStorage.getItem('token');
  
  const fetchData = async () => {
    const token = getToken();
    if (!token) return;
    // Use token...
  };
};
```

### Changes Made

#### 1. ReferralDashboard.tsx
- Removed: `import { useAuth } from '../../context/AuthContext'`
- Added: `const getToken = () => localStorage.getItem('token');` helper
- Updated: All async functions to get token locally with `const token = getToken();`
- Removed: `token` from `useEffect` dependencies array

#### 2. AdminReferrals.tsx
- Removed: `import { useAuth } from '../../context/AuthContext'`
- Added: `const getToken = () => localStorage.getItem('token');` helper
- Updated 6 async functions:
  - `fetchOverviewData()`
  - `fetchReferrals()`
  - `fetchCodes()`
  - `fetchSettings()`
  - `toggleCodeStatus()`
  - `saveSettings()`
- Removed: `token` from `useEffect` dependencies array
- Cleaned up: Unused imports (`motion`, `Filter`, `Calendar`, `ExternalLink`)

## Authentication Pattern in AcademOra

The project consistently uses one of these patterns for authentication:

### Pattern 1: Direct localStorage Access
```typescript
const token = localStorage.getItem('token');
```

### Pattern 2: Using api.ts Helper
```typescript
import { getCurrentUser } from '../lib/api';

const user = await getCurrentUser();
```

### Pattern 3: Local getToken Helper (now standardized in fixed files)
```typescript
const getToken = () => localStorage.getItem('token');
const token = getToken();
```

## Verification
- ✅ No compilation errors in `ReferralDashboard.tsx`
- ✅ No compilation errors in `AdminReferrals.tsx`
- ✅ No other files with `AuthContext` imports found
- ✅ Build passes with no errors

## Related Files Using Correct Pattern
For reference, these files already use the correct authentication pattern:
- `src/pages/UniversityComparePage.tsx` - Uses `getCurrentUser()` from api.ts
- `src/pages/admin/AdminDashboard.tsx` - Direct localStorage access
- `src/lib/api.ts` - Exports `getAuthToken()` helper function

## Lessons Learned
1. The project does not use React Context for authentication state
2. Token storage is handled via `localStorage` consistently
3. Each async function requiring authentication should get the token locally
4. The `getToken()` helper pattern provides a clean, reusable solution

## Future Recommendations
Consider creating a centralized authentication utility module if more components need similar patterns:

```typescript
// src/utils/auth.ts
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
};
```

This would provide a single source of truth for authentication token management across the application.
