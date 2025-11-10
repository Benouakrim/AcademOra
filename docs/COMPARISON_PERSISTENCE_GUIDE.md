# Comparison Data Persistence Guide

## Overview
The Comparison Data Persistence feature allows users to save their university comparisons for later viewing, making it easy to revisit and share comparison sets over time.

## Features Implemented

### 1. **Database Schema**
- **Table**: `saved_comparisons`
- **Columns**:
  - `id`: UUID primary key
  - `user_id`: Reference to user (CASCADE delete)
  - `name`: User-defined name for the comparison
  - `description`: Optional description/notes
  - `university_ids`: Array of university UUIDs (max 5)
  - `created_at`: Timestamp
  - `updated_at`: Timestamp (auto-updated)
  - `last_viewed_at`: Tracks when user last accessed comparison
  - `is_favorite`: Boolean flag for favorite comparisons

- **Indexes**:
  - `user_id` for fast user queries
  - `created_at` DESC for chronological listing
  - `is_favorite` for quick favorite filtering
  - GIN index on `university_ids` for array queries

### 2. **API Endpoints**

#### **POST /api/compare/saved**
Save a new comparison
```typescript
Request:
{
  name: string,              // Required: Display name
  description?: string,      // Optional: Notes about comparison
  university_ids: string[]   // Required: 2-5 university UUIDs
}

Response:
{
  id: string,
  user_id: string,
  name: string,
  description: string | null,
  university_ids: string[],
  created_at: string,
  updated_at: string,
  last_viewed_at: string | null,
  is_favorite: boolean
}

Error Cases:
- 400: Invalid input (missing fields, wrong array length)
- 409: Duplicate comparison exists
```

#### **GET /api/compare/saved**
Get all saved comparisons for current user
```typescript
Query Parameters:
- limit?: number (default: 50)
- offset?: number (default: 0)
- sort_by?: string (default: 'created_at')
- sort_order?: 'asc' | 'desc' (default: 'desc')
- favorites_only?: boolean (default: false)

Response:
{
  comparisons: SavedComparison[],
  count: number,
  has_more: boolean
}
```

#### **GET /api/compare/saved/:id**
Get a specific saved comparison with full university data
```typescript
Response:
{
  ...SavedComparison,
  universities: University[],      // Full university details
  predictions: Prediction[] | null, // Financial aid predictions if profile complete
  profile_complete: boolean
}

Features:
- Automatically marks comparison as viewed (updates last_viewed_at)
- Fetches full university details
- Includes financial aid predictions if user has complete profile
```

#### **PUT /api/compare/saved/:id**
Update a saved comparison
```typescript
Request:
{
  name?: string,
  description?: string,
  university_ids?: string[]  // Must be 2-5 if provided
}

Response: Updated SavedComparison
```

#### **DELETE /api/compare/saved/:id**
Delete a saved comparison
```typescript
Response:
{
  success: true,
  message: "Comparison deleted successfully"
}
```

#### **POST /api/compare/saved/:id/favorite**
Toggle favorite status
```typescript
Response: Updated SavedComparison with toggled is_favorite
```

### 3. **Frontend Features**

#### **Save Modal**
- **Trigger**: "Save" button visible when 2+ universities selected
- **Fields**:
  - Name (required)
  - Description (optional)
  - Preview of universities being saved
- **Validation**:
  - Name cannot be empty
  - Checks for duplicate comparisons
- **Success Animation**: Checkmark with auto-close after 2 seconds

#### **API Integration**
```typescript
// Save comparison
await compareAPI.saveComparison(
  name: string,
  universityIds: string[],
  description?: string
)

// Get saved comparisons
await compareAPI.getSavedComparisons({
  limit?: number,
  offset?: number,
  sort_by?: string,
  sort_order?: 'asc' | 'desc',
  favorites_only?: boolean
})

// Get specific comparison
await compareAPI.getSavedComparisonById(id: string)

// Update comparison
await compareAPI.updateSavedComparison(id: string, updates)

// Delete comparison
await compareAPI.deleteSavedComparison(id: string)

// Toggle favorite
await compareAPI.toggleFavorite(id: string)
```

### 4. **Data Layer Functions**

Located in `server/data/savedComparisons.js`:

- `createSavedComparison()`: Create new saved comparison
- `getSavedComparisonsByUserId()`: Get all comparisons for user with filtering/sorting
- `getSavedComparisonById()`: Get specific comparison
- `updateSavedComparison()`: Update comparison details
- `deleteSavedComparison()`: Delete comparison
- `toggleComparisonFavorite()`: Toggle favorite status
- `markComparisonAsViewed()`: Update last_viewed_at timestamp
- `getSavedComparisonsCount()`: Get total count for user
- `findDuplicateComparison()`: Check for existing comparison with same universities

## Usage Workflow

### Saving a Comparison

1. User selects 2-5 universities for comparison
2. Clicks "Save" button in header
3. Modal appears with name/description fields
4. User enters name (required) and optional description
5. Preview shows which universities will be saved
6. Click "Save Comparison" to persist
7. Success animation shows, modal auto-closes
8. Comparison is saved to database

### Viewing Saved Comparisons

1. User navigates to saved comparisons page (to be implemented)
2. List shows all saved comparisons with:
   - Name and description
   - Number of universities
   - Created/updated dates
   - Favorite status
3. Click to load comparison
4. Full comparison view opens with all data
5. `last_viewed_at` timestamp updated

### Managing Comparisons

- **Edit**: Update name, description, or university list
- **Delete**: Remove comparison permanently
- **Favorite**: Mark important comparisons for quick access
- **Filter**: View only favorites
- **Sort**: By date, name, or last viewed

## Database Migration

Run the migration to create the table:

```bash
# Using psql
psql -U your_user -d your_database -f server/database/migrations/create-saved-comparisons.sql

# Or via Supabase Dashboard
# Copy contents of migration file to SQL Editor and run
```

## Error Handling

### Duplicate Detection
```typescript
// Checks if comparison with same universities exists
// Sorted comparison to handle different orderings
if (duplicate found) {
  return 409 Conflict with existing_id
}
```

### Validation
- Name must be non-empty string
- University IDs must be array of 2-5 UUIDs
- User must own comparison for update/delete operations

### Security
- All endpoints require authentication (`requireUser` middleware)
- Row-level security ensures users can only access their own comparisons
- Cascade delete removes comparisons when user is deleted

## Future Enhancements

### Recommended Features
1. **Sharing**:
   - Generate shareable links
   - Public/private toggle
   - Share via email or social media

2. **Comparison Library Page**:
   - Dedicated page to browse saved comparisons
   - Card view with thumbnails
   - Search and filter capabilities
   - Bulk actions (delete multiple, export)

3. **Notifications**:
   - Alert when university data changes significantly
   - Remind to review saved comparisons
   - Suggest updates based on new data

4. **Export**:
   - PDF export of comparison
   - CSV data export
   - Print-friendly view

5. **Collaboration**:
   - Share with counselors or family
   - Comments/notes on comparisons
   - Version history

6. **Analytics**:
   - Track most popular comparison sets
   - See trending universities
   - Personalized recommendations

7. **Smart Lists**:
   - Auto-save "Recent Comparisons"
   - "Recommended by others like you"
   - "Top Engineering Schools" templates

## Testing

### Manual Testing Checklist
- [ ] Create comparison with valid data
- [ ] Create comparison with duplicate universities (expect 409)
- [ ] Get list of saved comparisons
- [ ] Get specific comparison with full data
- [ ] Update comparison name
- [ ] Update comparison university list
- [ ] Delete comparison
- [ ] Toggle favorite status
- [ ] Verify last_viewed_at updates on view
- [ ] Test pagination with many comparisons
- [ ] Test sorting options
- [ ] Test favorites-only filter

### API Testing Example
```bash
# Save comparison
curl -X POST http://localhost:3000/api/compare/saved \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Top CS Schools",
    "description": "Best computer science programs",
    "university_ids": ["uuid1", "uuid2", "uuid3"]
  }'

# Get all saved
curl http://localhost:3000/api/compare/saved \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get specific
curl http://localhost:3000/api/compare/saved/:id \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update
curl -X PUT http://localhost:3000/api/compare/saved/:id \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'

# Delete
curl -X DELETE http://localhost:3000/api/compare/saved/:id \
  -H "Authorization: Bearer YOUR_TOKEN"

# Toggle favorite
curl -X POST http://localhost:3000/api/compare/saved/:id/favorite \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Performance Considerations

- GIN index on `university_ids` enables fast array queries
- Pagination prevents loading too much data at once
- Indexes on commonly filtered/sorted columns
- `last_viewed_at` updated asynchronously (doesn't block response)

## Conclusion

The Comparison Data Persistence feature provides a complete solution for users to save, manage, and revisit their university comparisons. The implementation includes robust database schema, comprehensive API endpoints, elegant UI, and proper error handling. Users can now build a library of comparisons to support their decision-making process over time.
