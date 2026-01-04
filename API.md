# API Documentation - Bookmarks Manager

This documentation describes how to use the public API of Bookmarks Manager to manage your bookmarks, collections, and tags.

## Authentication

The API uses a token-based authentication system. Each Nextcloud user has a unique token that allows them to access their own data.

### Get your API token

1. Log in to your Nextcloud instance
2. Open the Bookmarks Manager application
3. Click on "Settings" in the sidebar
4. Click on "API Token"
5. Generate a new token or copy your existing token

### Using the token

You can use the token in two ways:

**Option 1: Authorization header (recommended)**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Option 2: X-API-Key header**
```
X-API-Key: YOUR_TOKEN_HERE
```

### Example with curl

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     https://your-nextcloud.com/apps/bookmarksmanager/api/v1/bookmarks
```

## Base URL

All API requests must be made to:
```
https://your-nextcloud.com/apps/bookmarksmanager/api/v1
```

## Endpoints

### Bookmarks

#### List all bookmarks

**GET** `/bookmarks`

**Query Parameters:**
- `collectionId` (integer, optional): Filter bookmarks by collection ID
- `tagsId` (string or array, optional): Filter bookmarks by tag IDs. Can be:
  - Comma-separated string: `?tagsId=1,2,3`
  - Multiple parameters: `?tagsId[]=1&tagsId[]=2&tagsId[]=3`

**Note:** When using `tagsId`, bookmarks that have at least one of the specified tags will be returned.

**Response:**
```json
[
  {
    "id": 1,
    "userId": "user123",
    "url": "https://example.com",
    "title": "Example Website",
    "description": "A great website",
    "collectionId": 2,
    "collectionName": "Web Development",
    "screenshot": "https://example.com/screenshot.png",
    "favicon": "https://example.com/favicon.ico",
    "tags": [
      {
        "id": 1,
        "name": "web"
      },
      {
        "id": 3,
        "name": "example"
      }
    ]
  }
]
```

**Examples:**

Get all bookmarks:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-nextcloud.com/apps/bookmarksmanager/api/v1/bookmarks
```

Filter by collection:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "https://your-nextcloud.com/apps/bookmarksmanager/api/v1/bookmarks?collectionId=2"
```

Filter by tags (comma-separated):
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "https://your-nextcloud.com/apps/bookmarksmanager/api/v1/bookmarks?tagsId=1,3,5"
```

Filter by collection and tags:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "https://your-nextcloud.com/apps/bookmarksmanager/api/v1/bookmarks?collectionId=2&tagsId=1,3"
```

#### Create a bookmark

**POST** `/bookmarks`

**Parameters:**
- `url` (string, required): The bookmark URL
- `title` (string, required): The bookmark title
- `description` (string, optional): The bookmark description
- `collectionId` (integer, optional): The collection ID
- `tags` (array, optional): List of tag IDs or tag names (strings)
- `screenshot` (string, optional): Screenshot URL
- `favicon` (string, optional): Favicon URL

**Example:**
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://example.com",
       "title": "Example Website",
       "description": "A great website",
       "collectionId": 2,
       "tags": ["web", "example"],
       "screenshot": "https://example.com/screenshot.png",
       "favicon": "https://example.com/favicon.ico"
     }' \
     https://your-nextcloud.com/apps/bookmarksmanager/api/v1/bookmarks
```

**Response:**
```json
{
  "id": 1,
  "userId": "user123",
  "url": "https://example.com",
  "title": "Example Website",
  "description": "A great website",
  "collectionId": 2,
  "collectionName": "Web Development",
  "screenshot": "https://example.com/screenshot.png",
  "favicon": "https://example.com/favicon.ico",
  "tags": [
    {
      "id": 1,
      "name": "web"
    },
    {
      "id": 3,
      "name": "example"
    }
  ]
}
```

#### Update a bookmark

**PUT** `/bookmarks/{id}`

**Parameters:**
- `url` (string, required): The bookmark URL
- `title` (string, required): The bookmark title
- `description` (string, optional): The bookmark description
- `collectionId` (integer, optional): The collection ID
- `tags` (array, optional): List of tag IDs
- `screenshot` (string, optional): Screenshot URL
- `favicon` (string, optional): Favicon URL

**Example:**
```bash
curl -X PUT \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://example.com",
       "title": "Updated Title",
       "description": "Updated description",
       "collectionId": 3,
       "tags": [1, 2, 4]
     }' \
     https://your-nextcloud.com/apps/bookmarksmanager/api/v1/bookmarks/1
```

**Response:**
```json
{
  "id": 1,
  "userId": "user123",
  "url": "https://example.com",
  "title": "Updated Title",
  "description": "Updated description",
  "collectionId": 3,
  "collectionName": "Updated Collection",
  "screenshot": "https://example.com/screenshot.png",
  "favicon": "https://example.com/favicon.ico",
  "tags": [
    {
      "id": 1,
      "name": "web"
    },
    {
      "id": 2,
      "name": "javascript"
    },
    {
      "id": 4,
      "name": "react"
    }
  ]
}
```

#### Delete a bookmark

**DELETE** `/bookmarks/{id}`

**Example:**
```bash
curl -X DELETE \
     -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-nextcloud.com/apps/bookmarksmanager/api/v1/bookmarks/1
```

**Response:**
- Status: `204 No Content` (success)
- Status: `404 Not Found` (bookmark not found)

### Collections

#### List all collections

**GET** `/collections`

**Response:**
```json
[
  {
    "id": 1,
    "userId": "user123",
    "name": "Web Development",
    "icon": "code",
    "parentId": null
  }
]
```

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-nextcloud.com/apps/bookmarksmanager/api/v1/collections
```

#### Create a collection

**POST** `/collections`

**Parameters:**
- `name` (string, required): The collection name
- `icon` (string, optional): The collection icon
- `parentId` (integer, optional): The parent collection ID (for nested collections)

**Example:**
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Web Development",
       "icon": "code",
       "parentId": null
     }' \
     https://your-nextcloud.com/apps/bookmarksmanager/api/v1/collections
```

#### Update a collection

**PUT** `/collections/{id}`

**Parameters:**
- `name` (string, required): The collection name
- `icon` (string, optional): The collection icon
- `parentId` (integer, optional): The parent collection ID

**Example:**
```bash
curl -X PUT \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Updated Collection Name",
       "icon": "folder",
       "parentId": 2
     }' \
     https://your-nextcloud.com/apps/bookmarksmanager/api/v1/collections/1
```

#### Delete a collection

**DELETE** `/collections/{id}`

**Note:** Deleting a collection also deletes all bookmarks it contains.

**Example:**
```bash
curl -X DELETE \
     -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-nextcloud.com/apps/bookmarksmanager/api/v1/collections/1
```

**Response:**
- Status: `204 No Content` (success)
- Status: `404 Not Found` (collection not found)

### Tags

#### List all tags

**GET** `/tags`

**Response:**
```json
[
  {
    "id": 1,
    "userId": "user123",
    "name": "web"
  }
]
```

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-nextcloud.com/apps/bookmarksmanager/api/v1/tags
```

#### Create a tag

**POST** `/tags`

**Parameters:**
- `name` (string, required): The tag name

**Example:**
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "web"
     }' \
     https://your-nextcloud.com/apps/bookmarksmanager/api/v1/tags
```

#### Update a tag

**PUT** `/tags/{id}`

**Parameters:**
- `name` (string, required): The new tag name

**Example:**
```bash
curl -X PUT \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "updated-tag-name"
     }' \
     https://your-nextcloud.com/apps/bookmarksmanager/api/v1/tags/1
```

#### Delete a tag

**DELETE** `/tags/{id}`

**Example:**
```bash
curl -X DELETE \
     -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-nextcloud.com/apps/bookmarksmanager/api/v1/tags/1
```

**Response:**
- Status: `204 No Content` (success)
- Status: `404 Not Found` (tag not found)

## HTTP Response Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `204 No Content`: Request successful, no content to return
- `400 Bad Request`: Invalid request (missing or invalid parameters)
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Usage Examples

### Create a bookmark with tags

```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://reactjs.org",
       "title": "React - A JavaScript library",
       "description": "Official React documentation",
       "tags": ["javascript", "react", "frontend"]
     }' \
     https://your-nextcloud.com/apps/bookmarksmanager/api/v1/bookmarks
```

### List bookmarks from a specific collection

```bash
# First, retrieve all bookmarks
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-nextcloud.com/apps/bookmarksmanager/api/v1/bookmarks

# Then filter by collectionId in your client code
```

### Create a nested collection

```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Frontend Frameworks",
       "icon": "layers",
       "parentId": 1
     }' \
     https://your-nextcloud.com/apps/bookmarksmanager/api/v1/collections
```

## Important Notes

1. **Security**: Keep your API token secret. Never share it publicly.
2. **Scope**: Each token only provides access to the data of the user who generated it.
3. **Revocation**: You can revoke your token at any time from the application settings.
4. **Regeneration**: If you regenerate a token, the old one becomes immediately invalid.

## Support

For any questions or issues, please consult the application documentation or contact your Nextcloud instance administrator.
