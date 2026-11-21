# Creator OS API Documentation (V1: Foundation)

## Base URL
`/api/v1`

All private endpoints require an `Authorization` header containing a valid Supabase bearer token:
```http
Authorization: Bearer <supabase_access_token>
```

---

## 1. Response Formats

### Standard Success Response
```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The supplied data is invalid.",
    "details": []
  }
}
```

Standard Error Codes:
- `VALIDATION_ERROR` (400)
- `UNAUTHENTICATED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409)
- `RATE_LIMITED` (429)
- `INTERNAL_SERVER_ERROR` (500)
- `EXTERNAL_PROVIDER_ERROR` (502)
- `AI_PROVIDER_ERROR` (502)
- `DATABASE_ERROR` (500)

---

## 2. Health & System Endpoints

### `GET /api/v1/health`
Checks backend and service connectivity.
- **Auth**: None
- **Response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-11-21T00:00:00.000Z",
    "version": "1.0.0",
    "services": {
      "database": "connected" | "disconnected",
      "aiProvider": "configured" | "unconfigured"
    }
  }
}
```

---

## 3. User Endpoints

### `GET /api/v1/users/me`
Retrieves or automatically provisions the current authenticated application user profile.
- **Auth**: Required
- **Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "creator@example.com",
    "displayName": "Jane Doe",
    "avatarUrl": null,
    "createdAt": "2026-11-21T00:00:00.000Z"
  }
}
```

### `PATCH /api/v1/users/me`
Updates user profile fields.
- **Auth**: Required
- **Body**:
```json
{
  "displayName": "Jane D.",
  "avatarUrl": "https://..."
}
```

---

## 4. Workspace Endpoints

### `GET /api/v1/workspaces`
Lists all workspaces the authenticated user belongs to.
- **Auth**: Required
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Jane's Workspace",
      "slug": "janes-workspace",
      "role": "owner",
      "createdAt": "2026-11-21T00:00:00.000Z"
    }
  ]
}
```

### `POST /api/v1/workspaces`
Creates or initializes a default workspace for the user (idempotent).
- **Auth**: Required
- **Body**:
```json
{
  "name": "Jane's Studio",
  "slug": "janes-studio"
}
```

### `GET /api/v1/workspaces/:workspaceId`
Retrieves workspace details. Requires user membership.
- **Auth**: Required

### `PATCH /api/v1/workspaces/:workspaceId`
Updates workspace name. Requires 'owner' or 'admin' role.
- **Auth**: Required

### `GET /api/v1/workspaces/:workspaceId/members`
Lists members of the workspace.
- **Auth**: Required

---

## 5. Creator Profile Endpoints

### `GET /api/v1/workspaces/:workspaceId/creator-profile`
Retrieves the creator profile for the specified workspace.
- **Auth**: Required

### `PUT /api/v1/workspaces/:workspaceId/creator-profile`
Creates or completely updates the creator profile (used by Onboarding flow).
- **Auth**: Required
- **Body**:
```json
{
  "displayName": "Jane Doe",
  "username": "janedoe",
  "bio": "Sharing tech tutorials & AI workflows",
  "primaryNiche": "Tech & AI",
  "secondaryNiches": ["Productivity", "Coding"],
  "primaryPlatform": "Instagram",
  "otherPlatforms": ["YouTube", "Twitter"],
  "goals": ["Grow to 50k followers", "Secure brand deals"],
  "targetAudience": "Early career software developers and enthusiasts",
  "experienceLevel": "Intermediate",
  "preferredLanguage": "English",
  "country": "India",
  "timezone": "Asia/Kolkata",
  "onboardingCompleted": true
}
```

### `PATCH /api/v1/workspaces/:workspaceId/creator-profile`
Partially updates specific fields in the creator profile (used in Profile Settings).
- **Auth**: Required
- **Body**:
```json
{
  "displayName": "Jane Doe Updated",
  "bio": "New bio..."
}
```

---

## 6. Dashboard Endpoints

### `GET /api/v1/workspaces/:workspaceId/dashboard`
Returns real workspace summary information. Does not return fake analytics or fabricated metrics.
- **Auth**: Required
- **Response**:
```json
{
  "success": true,
  "data": {
    "creator": {
      "displayName": "Jane Doe",
      "username": "janedoe",
      "primaryNiche": "Tech & AI",
      "primaryPlatform": "Instagram",
      "onboardingCompleted": true
    },
    "workspace": {
      "id": "uuid",
      "name": "Jane's Studio"
    },
    "quickStats": {
      "profileConfigured": true,
      "connectedPlatformsCount": 0
    },
    "recentIdeas": [],
    "recentScripts": [],
    "upcomingContent": [],
    "recommendations": []
  }
}
```
