# CMS API Documentation

Complete API documentation for the ChatGPT Philippines CMS integration.

## Overview

The CMS provides RESTful API endpoints for managing pages, SEO metadata, FAQs, and media. All endpoints require authentication via Auth0.

## Authentication

All CMS API routes require an authenticated Auth0 session. Include the Auth0 session cookie in requests.

**Authentication Headers:**
```
Cookie: appSession=<auth0-session-token>
```

**Unauthorized Response (401):**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

## Pages API

### List Pages

**Endpoint:** `GET /api/cms/pages`

**Description:** Retrieve a paginated list of pages with optional filters.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| status | string | No | - | Filter by page status (`draft`, `published`, `scheduled`, `archived`) |
| page_type | string | No | - | Filter by page type (`tool`, `home`, `static`, `landing`) |
| search | string | No | - | Search in title and slug |
| created_by | string | No | - | Filter by creator user ID |
| date_from | string | No | - | Filter by creation date (ISO 8601) |
| date_to | string | No | - | Filter by creation date (ISO 8601) |
| sort_by | string | No | `created_at` | Sort field (`created_at`, `updated_at`, `title`, `view_count`) |
| sort_order | string | No | `desc` | Sort order (`asc`, `desc`) |
| page | number | No | 1 | Page number |
| per_page | number | No | 20 | Items per page (max 100) |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "Page Title",
        "slug": "page-title",
        "page_type": "tool",
        "status": "published",
        "content": {},
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 100,
      "total_pages": 5,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

**Example Request:**
```bash
curl -X GET "https://yourdomain.com/api/cms/pages?status=published&page_type=tool&page=1&per_page=20" \
  -H "Cookie: appSession=<token>"
```

---

### Get Single Page

**Endpoint:** `GET /api/cms/pages/[id]`

**Description:** Get a single page by ID with all relations (SEO, FAQs, components).

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| relations | boolean | No | true | Include related data (SEO, FAQs, components) |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Page Title",
    "slug": "page-title",
    "page_type": "tool",
    "status": "published",
    "content": {
      "hero": {
        "title": "Hero Title",
        "subtitle": "Subtitle",
        "description": "Description"
      },
      "sections": []
    },
    "seo_metadata": {
      "meta_title": "SEO Title",
      "meta_description": "SEO Description"
    },
    "faqs": [],
    "components": [],
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

**Example Request:**
```bash
curl -X GET "https://yourdomain.com/api/cms/pages/123e4567-e89b-12d3-a456-426614174000" \
  -H "Cookie: appSession=<token>"
```

---

### Create Page

**Endpoint:** `POST /api/cms/pages`

**Description:** Create a new page.

**Request Body:**
```json
{
  "title": "Page Title",
  "slug": "page-title",
  "page_type": "tool",
  "content": {
    "hero": {
      "title": "Hero Title",
      "subtitle": "Subtitle"
    },
    "sections": []
  },
  "status": "draft",
  "is_homepage": false,
  "allow_comments": false,
  "is_indexable": true
}
```

**Required Fields:**
- `title` (string, max 200 chars)
- `page_type` (enum: `tool`, `home`, `static`, `landing`)
- `content` (object)

**Optional Fields:**
- `slug` (string, auto-generated from title if not provided)
- `status` (enum: `draft`, `published`, `scheduled`, `archived`, default: `draft`)
- `template` (string)
- `layout_config` (object)
- `featured_image` (UUID)
- `is_homepage` (boolean, default: false)
- `allow_comments` (boolean, default: false)
- `is_indexable` (boolean, default: true)
- `parent_id` (UUID)
- `sort_order` (number)
- `scheduled_publish_at` (ISO 8601 datetime)

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Page Title",
    "slug": "page-title",
    "...": "..."
  },
  "message": "Page created successfully"
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_type",
      "path": ["title"],
      "message": "Required"
    }
  ]
}
```

**Example Request:**
```bash
curl -X POST "https://yourdomain.com/api/cms/pages" \
  -H "Cookie: appSession=<token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Page",
    "page_type": "tool",
    "content": {"hero": {"title": "Welcome"}},
    "status": "draft"
  }'
```

---

### Update Page

**Endpoint:** `PATCH /api/cms/pages?id=<uuid>`

**Description:** Update an existing page.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Page UUID |

**Request Body:** (All fields optional, only include fields to update)
```json
{
  "title": "Updated Title",
  "status": "published",
  "content": {
    "hero": {
      "title": "Updated Hero"
    }
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Updated Title",
    "...": "..."
  },
  "message": "Page updated successfully"
}
```

**Example Request:**
```bash
curl -X PATCH "https://yourdomain.com/api/cms/pages?id=123e4567-e89b-12d3-a456-426614174000" \
  -H "Cookie: appSession=<token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title", "status": "published"}'
```

---

### Delete Page

**Endpoint:** `DELETE /api/cms/pages?id=<uuid>`

**Description:** Delete a page (soft delete by default - archives the page).

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| id | string | Yes | - | Page UUID |
| permanent | boolean | No | false | If true, permanently deletes the page |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Page archived successfully"
}
```

**Example Request:**
```bash
# Soft delete (archive)
curl -X DELETE "https://yourdomain.com/api/cms/pages?id=123e4567-e89b-12d3-a456-426614174000" \
  -H "Cookie: appSession=<token>"

# Permanent delete
curl -X DELETE "https://yourdomain.com/api/cms/pages?id=123e4567-e89b-12d3-a456-426614174000&permanent=true" \
  -H "Cookie: appSession=<token>"
```

---

### Publish/Unpublish Page

**Endpoint:** `POST /api/cms/pages/publish`

**Description:** Publish or unpublish a page.

**Request Body:**
```json
{
  "id": "uuid",
  "action": "publish"
}
```

**Fields:**
- `id` (string, required): Page UUID
- `action` (string, optional): `publish` (default) or `unpublish`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "published",
    "published_at": "2025-01-01T00:00:00Z"
  },
  "message": "Page published successfully"
}
```

**Example Request:**
```bash
curl -X POST "https://yourdomain.com/api/cms/pages/publish" \
  -H "Cookie: appSession=<token>" \
  -H "Content-Type: application/json" \
  -d '{"id": "123e4567-e89b-12d3-a456-426614174000", "action": "publish"}'
```

---

### Duplicate Page

**Endpoint:** `POST /api/cms/pages/duplicate`

**Description:** Create a duplicate of an existing page.

**Request Body:**
```json
{
  "id": "uuid"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "new-uuid",
    "title": "Original Title (Copy)",
    "slug": "original-slug-copy-1234567890"
  },
  "message": "Page duplicated successfully"
}
```

**Example Request:**
```bash
curl -X POST "https://yourdomain.com/api/cms/pages/duplicate" \
  -H "Cookie: appSession=<token>" \
  -H "Content-Type: application/json" \
  -d '{"id": "123e4567-e89b-12d3-a456-426614174000"}'
```

---

## SEO Metadata API

### Get SEO Metadata

**Endpoint:** `GET /api/cms/seo?page_id=<uuid>`

**Description:** Get SEO metadata for a specific page.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page_id | string | Yes | Page UUID |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "page_id": "uuid",
    "meta_title": "SEO Title",
    "meta_description": "SEO Description",
    "meta_keywords": ["keyword1", "keyword2"],
    "og_title": "OG Title",
    "og_description": "OG Description",
    "og_image": "https://example.com/image.jpg",
    "canonical_url": "https://example.com/page",
    "robots_index": true,
    "robots_follow": true,
    "focus_keyword": "main keyword",
    "seo_score": 85,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

**Example Request:**
```bash
curl -X GET "https://yourdomain.com/api/cms/seo?page_id=123e4567-e89b-12d3-a456-426614174000" \
  -H "Cookie: appSession=<token>"
```

---

### Create/Update SEO Metadata

**Endpoint:** `POST /api/cms/seo`

**Description:** Create or update SEO metadata for a page (upsert operation).

**Request Body:**
```json
{
  "page_id": "uuid",
  "meta_title": "SEO Title (max 60 chars)",
  "meta_description": "SEO Description (max 160 chars)",
  "meta_keywords": ["keyword1", "keyword2"],
  "og_title": "OG Title",
  "og_description": "OG Description",
  "og_image": "https://example.com/image.jpg",
  "og_type": "website",
  "twitter_card": "summary_large_image",
  "canonical_url": "https://example.com/page",
  "robots_index": true,
  "robots_follow": true,
  "focus_keyword": "main keyword",
  "schema_markup": {}
}
```

**Required Fields:**
- `page_id` (UUID)

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "page_id": "uuid",
    "...": "..."
  },
  "message": "SEO metadata saved successfully"
}
```

**Example Request:**
```bash
curl -X POST "https://yourdomain.com/api/cms/seo" \
  -H "Cookie: appSession=<token>" \
  -H "Content-Type: application/json" \
  -d '{
    "page_id": "123e4567-e89b-12d3-a456-426614174000",
    "meta_title": "My Page SEO Title",
    "meta_description": "This is a great page about..."
  }'
```

---

### Delete SEO Metadata

**Endpoint:** `DELETE /api/cms/seo?id=<uuid>`

**Description:** Delete SEO metadata.

**Success Response (200):**
```json
{
  "success": true,
  "message": "SEO metadata deleted successfully"
}
```

---

## FAQs API

### List FAQs

**Endpoint:** `GET /api/cms/faqs?page_id=<uuid>`

**Description:** Get all FAQs for a specific page.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page_id | string | Yes | Page UUID |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "page_id": "uuid",
      "question": "What is this?",
      "answer": "This is an answer.",
      "sort_order": 0,
      "is_featured": false,
      "schema_enabled": true,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

**Example Request:**
```bash
curl -X GET "https://yourdomain.com/api/cms/faqs?page_id=123e4567-e89b-12d3-a456-426614174000" \
  -H "Cookie: appSession=<token>"
```

---

### Create FAQ

**Endpoint:** `POST /api/cms/faqs`

**Description:** Create a new FAQ.

**Request Body:**
```json
{
  "page_id": "uuid",
  "question": "What is this?",
  "answer": "This is an answer.",
  "sort_order": 0,
  "is_featured": false,
  "schema_enabled": true
}
```

**Required Fields:**
- `page_id` (UUID)
- `question` (string, max 500 chars)
- `answer` (string)

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "page_id": "uuid",
    "question": "What is this?",
    "answer": "This is an answer.",
    "sort_order": 0
  },
  "message": "FAQ created successfully"
}
```

**Example Request:**
```bash
curl -X POST "https://yourdomain.com/api/cms/faqs" \
  -H "Cookie: appSession=<token>" \
  -H "Content-Type: application/json" \
  -d '{
    "page_id": "123e4567-e89b-12d3-a456-426614174000",
    "question": "How do I use this?",
    "answer": "Here is how to use it..."
  }'
```

---

### Update FAQ

**Endpoint:** `PATCH /api/cms/faqs`

**Description:** Update an existing FAQ.

**Request Body:**
```json
{
  "id": "uuid",
  "question": "Updated question?",
  "answer": "Updated answer."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "question": "Updated question?",
    "...": "..."
  },
  "message": "FAQ updated successfully"
}
```

---

### Reorder FAQs

**Endpoint:** `PATCH /api/cms/faqs`

**Description:** Reorder multiple FAQs at once.

**Request Body:**
```json
{
  "updates": [
    { "id": "uuid-1", "sort_order": 0 },
    { "id": "uuid-2", "sort_order": 1 },
    { "id": "uuid-3", "sort_order": 2 }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "FAQs reordered successfully"
}
```

**Example Request:**
```bash
curl -X PATCH "https://yourdomain.com/api/cms/faqs" \
  -H "Cookie: appSession=<token>" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {"id": "uuid-1", "sort_order": 0},
      {"id": "uuid-2", "sort_order": 1}
    ]
  }'
```

---

### Delete FAQ

**Endpoint:** `DELETE /api/cms/faqs?id=<uuid>`

**Description:** Delete a FAQ.

**Success Response (200):**
```json
{
  "success": true,
  "message": "FAQ deleted successfully"
}
```

---

## Media API

**Note:** Media API endpoints are placeholder implementations. Full file upload functionality requires Supabase Storage integration.

### List Media

**Endpoint:** `GET /api/cms/media`

**Status:** Not Implemented (501)

---

### Upload Media

**Endpoint:** `POST /api/cms/media`

**Status:** Not Implemented (501)

---

### Delete Media

**Endpoint:** `DELETE /api/cms/media?id=<uuid>`

**Status:** Not Implemented (501)

---

## Error Responses

### Common Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Missing or invalid authentication |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error - Server-side error |
| 501 | Not Implemented - Feature not yet available |

### Error Response Format

```json
{
  "success": false,
  "error": "Error message"
}
```

### Validation Error Format

```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_type",
      "path": ["field_name"],
      "message": "Error description"
    }
  ]
}
```

---

## File Structure

```
/Users/adityaaman/Desktop/ChatGPTPH/
├── app/api/cms/
│   ├── pages/
│   │   ├── route.ts (GET, POST, PATCH, DELETE)
│   │   ├── [id]/route.ts (GET single page)
│   │   ├── publish/route.ts (POST)
│   │   └── duplicate/route.ts (POST)
│   ├── seo/route.ts (GET, POST, DELETE)
│   ├── faqs/route.ts (GET, POST, PATCH, DELETE)
│   └── media/route.ts (GET, POST, DELETE - placeholder)
├── lib/cms/
│   ├── repositories/
│   │   ├── base.repository.ts
│   │   ├── page.repository.ts
│   │   ├── seo.repository.ts
│   │   ├── faq.repository.ts
│   │   ├── component.repository.ts
│   │   └── revision.repository.ts
│   ├── services/
│   │   └── page.service.ts
│   ├── utils/
│   │   └── slug.ts
│   └── validation/
│       └── page.schema.ts
└── types/
    └── cms.ts
```

---

## Next Steps

1. **Create Database Tables:** Run the SQL migration in `/supabase/migrations/` to create CMS tables
2. **Configure Auth0:** Ensure Auth0 is configured with proper roles/permissions for CMS access
3. **Implement Media Upload:** Complete the media API with Supabase Storage integration
4. **Build Admin UI:** Create React components for the CMS admin interface
5. **Add Middleware:** Implement role-based access control for admin-only routes

---

## Support

For questions or issues, please refer to the main project documentation or contact the development team.
