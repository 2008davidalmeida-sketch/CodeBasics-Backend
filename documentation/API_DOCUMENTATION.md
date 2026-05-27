# API Documentation - CodeBasics Backend

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Challenges](#challenges)
3. [Submissions](#submissions)
4. [Users](#users)
5. [Turmas (Classes)](#turmas-classes)
6. [Error Handling](#error-handling)

---

## Authentication

### Google OAuth Login

Redirects user to Google login page.

```
GET /auth/google
```

**Response:** Redirects to Google OAuth consent screen

---

### Google OAuth Callback

Handles Google's OAuth callback and returns JWT token.

```
GET /auth/google/callback?code=...&state=...
```

**Query Parameters:**
- `code` - Authorization code from Google
- `state` - State parameter for security

**Response (Redirect):**
```
Location: http://localhost:5173/auth/callback?token=eyJ...
```

**Response Body:** `null` (redirects)

---

### Get Current User

Returns authenticated user's information.

```
GET /auth/me
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "João Silva",
  "email": "joao@example.com",
  "googleId": "118452698234859234850",
  "photo": "https://...",
  "role": "student",
  "createdAt": "2026-05-20T10:30:00Z"
}
```

**Error Response (401):**
```json
{
  "error": "No token provided" | "Invalid token"
}
```

---

### Logout

Clears authentication cookie.

```
POST /auth/logout
```

**Response (200):**
```json
{
  "message": "Logged out"
}
```

---

## Challenges

### List All Challenges

```
GET /challenges
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by title or description
- `difficulty` - Filter by difficulty (easy, medium, hard)

**Response (200):**
```json
{
  "challenges": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Sum of Two Numbers",
      "description": "Calculate the sum of two input numbers",
      "difficulty": "easy",
      "points": 10,
      "createdBy": "507f1f77bcf86cd799439011",
      "createdAt": "2026-05-20T10:30:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "pages": 5
}
```

---

### Get Single Challenge

```
GET /challenges/:id
```

**Path Parameters:**
- `id` - Challenge MongoDB ID

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Sum of Two Numbers",
  "description": "Calculate the sum of two input numbers",
  "difficulty": "easy",
  "points": 10,
  "starterCode": "function sum(a, b) {\n  // Write your code here\n}",
  "testCases": [
    {
      "input": "2, 3",
      "expectedOutput": "5"
    }
  ],
  "createdBy": "507f1f77bcf86cd799439011",
  "createdAt": "2026-05-20T10:30:00Z"
}
```

**Error Response (404):**
```json
{
  "error": "Challenge not found"
}
```

---

### Create Challenge

**Requires:** Teacher role

```
POST /challenges
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Palindrome Checker",
  "description": "Check if a string is a palindrome",
  "difficulty": "medium",
  "points": 25,
  "starterCode": "function isPalindrome(str) {\n  // Write your code here\n}",
  "testCases": [
    {
      "input": "racecar",
      "expectedOutput": "true"
    },
    {
      "input": "hello",
      "expectedOutput": "false"
    }
  ]
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "title": "Palindrome Checker",
  "description": "Check if a string is a palindrome",
  "difficulty": "medium",
  "points": 25,
  "createdBy": "507f1f77bcf86cd799439011",
  "createdAt": "2026-05-21T10:30:00Z"
}
```

---

### Update Challenge

**Requires:** Challenge creator or teacher

```
PUT /challenges/:id
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:** Same as create challenge

**Response (200):** Updated challenge object

---

### Delete Challenge

**Requires:** Challenge creator or teacher

```
DELETE /challenges/:id
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "message": "Challenge deleted successfully"
}
```

---

## Submissions

### Get User's Submissions

Returns all submissions for authenticated user.

```
GET /submissions/me
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439011",
    "challengeId": "507f1f77bcf86cd799439012",
    "code": "function sum(a, b) {\n  return a + b;\n}",
    "status": "pending",
    "submittedAt": "2026-05-21T14:30:00Z",
    "aiReview": null
  }
]
```

---

### Get Challenge Submissions

**Requires:** Teacher role

```
GET /submissions/challenge/:challengeId
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439011",
    "username": "João Silva",
    "challengeId": "507f1f77bcf86cd799439012",
    "code": "function sum(a, b) {\n  return a + b;\n}",
    "status": "completed",
    "submittedAt": "2026-05-21T14:30:00Z",
    "aiReview": {
      "feedback": "Great solution!",
      "score": 95
    }
  }
]
```

---

### Create Submission

Submit code for a challenge.

```
POST /submissions
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "challengeId": "507f1f77bcf86cd799439012",
  "code": "function sum(a, b) {\n  return a + b;\n}"
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "userId": "507f1f77bcf86cd799439011",
  "challengeId": "507f1f77bcf86cd799439012",
  "code": "function sum(a, b) {\n  return a + b;\n}",
  "status": "pending",
  "submittedAt": "2026-05-21T14:30:00Z"
}
```

**Note:** Submission is queued for AI review asynchronously

---

### Get Submission

```
GET /submissions/:id
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "userId": "507f1f77bcf86cd799439011",
  "challengeId": "507f1f77bcf86cd799439012",
  "code": "function sum(a, b) {\n  return a + b;\n}",
  "status": "completed",
  "submittedAt": "2026-05-21T14:30:00Z",
  "completedAt": "2026-05-21T14:35:00Z",
  "aiReview": {
    "feedback": "Good implementation. Consider adding input validation.",
    "score": 85,
    "timestamp": "2026-05-21T14:35:00Z"
  }
}
```

---

### Delete Submission

```
DELETE /submissions/:id
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "message": "Submission deleted successfully"
}
```

---

## Users

### List All Students

**Requires:** Teacher role

```
GET /users/students
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "João Silva",
    "email": "joao@example.com",
    "photo": "https://...",
    "role": "student",
    "completedChallenges": 15,
    "totalPoints": 250
  }
]
```

---

### Get User Profile

```
GET /users/:id
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "João Silva",
  "email": "joao@example.com",
  "photo": "https://...",
  "role": "student",
  "createdAt": "2026-05-20T10:30:00Z",
  "statistics": {
    "submissionsCount": 45,
    "completedCount": 15,
    "totalPoints": 250,
    "averageScore": 85
  }
}
```

---

### Update User Profile

```
PUT /users/:id
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "João Silva Updated",
  "photo": "https://..."
}
```

**Response (200):** Updated user object

---

## Turmas (Classes)

### List All Turmas

**Requires:** Teacher role

```
GET /turmas
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439015",
    "name": "Programming 101",
    "description": "Introduction to programming",
    "teacherId": "507f1f77bcf86cd799439011",
    "studentCount": 25,
    "createdAt": "2026-05-01T10:00:00Z"
  }
]
```

---

### Create Turma

**Requires:** Teacher role

```
POST /turmas
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Advanced JavaScript",
  "description": "Master JavaScript ES6+ features"
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439016",
  "name": "Advanced JavaScript",
  "description": "Master JavaScript ES6+ features",
  "teacherId": "507f1f77bcf86cd799439011",
  "students": [],
  "createdAt": "2026-05-21T10:30:00Z"
}
```

---

### Add Student to Turma

**Requires:** Teacher role

```
POST /turmas/:turmaId/students
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "studentId": "507f1f77bcf86cd799439011"
}
```

**Response (200):**
```json
{
  "message": "Student added successfully",
  "turma": { /* updated turma object */ }
}
```

---

### Get Turma Details

```
GET /turmas/:id
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "name": "Programming 101",
  "description": "Introduction to programming",
  "teacherId": "507f1f77bcf86cd799439011",
  "students": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "João Silva",
      "email": "joao@example.com"
    }
  ],
  "createdAt": "2026-05-01T10:00:00Z"
}
```

---

## Error Handling

### Standard Error Response Format

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Request processed successfully |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid request body |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | User lacks required permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected error |

### Common Errors

**401 Unauthorized**
```json
{
  "error": "No token provided"
}
```

**403 Forbidden**
```json
{
  "error": "Access denied"
}
```

**404 Not Found**
```json
{
  "error": "Challenge not found"
}
```

---

## Rate Limiting

Public endpoints are rate limited to prevent abuse:

- **Public routes**: 100 requests per 15 minutes
- **Rate limit headers** in response:
  ```
  RateLimit-Limit: 100
  RateLimit-Remaining: 95
  RateLimit-Reset: 1621609800
  ```

---

## Testing Endpoints

### Using cURL

```bash
# Get current user
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/auth/me

# List challenges
curl http://localhost:5000/challenges

# Create submission
curl -X POST http://localhost:5000/submissions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"challengeId":"...","code":"..."}'
```

### Using Thunder Client (VS Code)

1. Install Thunder Client extension
2. Create requests from `.thunderclient/` directory
3. Set `Authorization: Bearer YOUR_TOKEN` header

### Using Postman

1. Import endpoints as documented above
2. Set environment variable `token` with JWT
3. Use `{{token}}` in Authorization header

---

**Last Updated**: May 27, 2026
