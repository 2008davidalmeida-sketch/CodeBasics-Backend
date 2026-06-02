# Database Schema - CodeBasics Backend

## 📦 Collections Overview

The CodeBasics Backend uses **MongoDB** with 4 main collections:

1. **User** - Student and teacher accounts
2. **Challenge** - Coding challenges
3. **Submission** - Code submissions and reviews
4. **Turma** - Classes/groups of students

---

## User Collection

Stores user account information for both students and teachers.

### Schema

```typescript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  googleId: String (unique),
  photo: String,
  role: String, // 'student' | 'teacher'
  createdAt: Date,
  updatedAt: Date
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | ✅ | MongoDB auto-generated ID |
| `name` | String | ✅ | User's full name |
| `email` | String | ✅ | Email address (unique) |
| `googleId` | String | ✅ | Google OAuth ID (unique) |
| `photo` | String | ✅ | Profile photo URL from Google |
| `role` | String | ✅ | User role: `student` or `teacher` |
| `createdAt` | Date | ✅ | Account creation timestamp |
| `updatedAt` | Date | ✅ | Last update timestamp |

### Example Document

```json
{
  "_id": { "$oid": "507f1f77bcf86cd799439011" },
  "name": "João Silva",
  "email": "joao@example.com",
  "googleId": "118452698234859234850",
  "photo": "https://lh3.googleusercontent.com/...",
  "role": "student",
  "createdAt": { "$date": "2026-05-20T10:30:00Z" },
  "updatedAt": { "$date": "2026-05-21T15:45:00Z" }
}
```

### Indexes

```javascript
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "googleId": 1 }, { unique: true })
db.users.createIndex({ "createdAt": -1 })
```

### Typical Queries

```javascript
// Find user by ID
db.users.findOne({ _id: ObjectId("507f1f77bcf86cd799439011") })

// Find user by email
db.users.findOne({ email: "joao@example.com" })

// Find all teachers
db.users.find({ role: "teacher" })

// Count students
db.users.countDocuments({ role: "student" })

// Get recent users (last 7 days)
db.users.find({
  createdAt: {
    $gte: new Date(new Date().setDate(new Date().getDate() - 7))
  }
})
```

---

## Challenge Collection

Stores coding challenges that students solve.

### Schema

```typescript
{
  _id: ObjectId,
  title: String,
  description: String,
  difficulty: String, // 'easy' | 'medium' | 'hard'
  points: Number,
  starterCode: String,
  testCases: [
    {
      input: String,
      expectedOutput: String
    }
  ],
  createdBy: ObjectId, // Reference to User
  createdAt: Date,
  updatedAt: Date
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | ✅ | MongoDB auto-generated ID |
| `title` | String | ✅ | Challenge title |
| `description` | String | ✅ | Problem description |
| `difficulty` | String | ✅ | Difficulty level |
| `points` | Number | ✅ | Points awarded for completion |
| `starterCode` | String | ✅ | Code template for students |
| `testCases` | Array | ✅ | Array of test cases |
| `testCases[].input` | String | ✅ | Test case input |
| `testCases[].expectedOutput` | String | ✅ | Expected output |
| `createdBy` | ObjectId | ✅ | Teacher's User ID |
| `createdAt` | Date | ✅ | Creation timestamp |
| `updatedAt` | Date | ✅ | Last update timestamp |

### Example Document

```json
{
  "_id": { "$oid": "507f1f77bcf86cd799439012" },
  "title": "Sum of Two Numbers",
  "description": "Write a function that returns the sum of two numbers.",
  "difficulty": "easy",
  "points": 10,
  "starterCode": "function sum(a, b) {\n  // Write your code here\n}",
  "testCases": [
    {
      "input": "2, 3",
      "expectedOutput": "5"
    },
    {
      "input": "10, 20",
      "expectedOutput": "30"
    }
  ],
  "createdBy": { "$oid": "507f1f77bcf86cd799439011" },
  "createdAt": { "$date": "2026-05-20T10:30:00Z" },
  "updatedAt": { "$date": "2026-05-20T10:30:00Z" }
}
```

### Indexes

```javascript
db.challenges.createIndex({ "difficulty": 1 })
db.challenges.createIndex({ "createdBy": 1 })
db.challenges.createIndex({ "title": "text", "description": "text" })
db.challenges.createIndex({ "createdAt": -1 })
```

### Typical Queries

```javascript
// Find all challenges by difficulty
db.challenges.find({ difficulty: "easy" })

// Find challenges created by a teacher
db.challenges.find({ createdBy: ObjectId("507f1f77bcf86cd799439011") })

// Search challenges by title/description
db.challenges.find({ $text: { $search: "loop" } })

// Get latest challenges
db.challenges.find().sort({ createdAt: -1 }).limit(10)

// Count challenges by difficulty
db.challenges.aggregate([
  { $group: { _id: "$difficulty", count: { $sum: 1 } } }
])
```

---

## Submission Collection

Stores code submissions from students and AI review feedback.

### Schema

```typescript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User
  challengeId: ObjectId, // Reference to Challenge
  code: String,
  status: String, // 'pending' | 'completed' | 'failed'
  submittedAt: Date,
  completedAt: Date,
  aiReview: {
    feedback: String,
    score: Number, // 0-100
    timestamp: Date
  },
  updatedAt: Date
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | ✅ | MongoDB auto-generated ID |
| `userId` | ObjectId | ✅ | Student's User ID |
| `challengeId` | ObjectId | ✅ | Challenge ID |
| `code` | String | ✅ | Submitted code |
| `status` | String | ✅ | Processing status |
| `submittedAt` | Date | ✅ | Submission timestamp |
| `completedAt` | Date | ❌ | Timestamp when AI review completed |
| `aiReview` | Object | ❌ | AI review object (added after processing) |
| `aiReview.feedback` | String | ❌ | AI-generated feedback |
| `aiReview.score` | Number | ❌ | Quality score (0-100) |
| `aiReview.timestamp` | Date | ❌ | When review was generated |
| `updatedAt` | Date | ✅ | Last update timestamp |

### Example Document

```json
{
  "_id": { "$oid": "507f1f77bcf86cd799439014" },
  "userId": { "$oid": "507f1f77bcf86cd799439011" },
  "challengeId": { "$oid": "507f1f77bcf86cd799439012" },
  "code": "function sum(a, b) {\n  return a + b;\n}",
  "status": "completed",
  "submittedAt": { "$date": "2026-05-21T14:30:00Z" },
  "completedAt": { "$date": "2026-05-21T14:35:00Z" },
  "aiReview": {
    "feedback": "Good implementation. Consider adding input validation for edge cases.",
    "score": 85,
    "timestamp": { "$date": "2026-05-21T14:35:00Z" }
  },
  "updatedAt": { "$date": "2026-05-21T14:35:00Z" }
}
```

### Status Values

- **`pending`** - Submitted, waiting for AI review
- **`completed`** - AI review finished, feedback available
- **`failed`** - AI review failed, student can resubmit

### Indexes

```javascript
db.submissions.createIndex({ "userId": 1 })
db.submissions.createIndex({ "challengeId": 1 })
db.submissions.createIndex({ "status": 1 })
db.submissions.createIndex({ "userId": 1, "challengeId": 1 })
db.submissions.createIndex({ "submittedAt": -1 })
```

### Typical Queries

```javascript
// Get user's submissions
db.submissions.find({ userId: ObjectId("507f1f77bcf86cd799439011") })

// Get submissions for a challenge
db.submissions.find({ challengeId: ObjectId("507f1f77bcf86cd799439012") })

// Find pending submissions (for worker processing)
db.submissions.find({ status: "pending" })

// Get user's submissions with reviews
db.submissions.find({
  userId: ObjectId("507f1f77bcf86cd799439011"),
  "aiReview": { $exists: true }
})

// Average score per challenge
db.submissions.aggregate([
  { $group: {
    _id: "$challengeId",
    avgScore: { $avg: "$aiReview.score" },
    count: { $sum: 1 }
  }}
])
```

---

## Turma Collection

Stores classes/groups that organize students.

### Schema

```typescript
{
  _id: ObjectId,
  name: String,
  description: String,
  teacherId: ObjectId, // Reference to User
  students: [ObjectId], // Array of User IDs
  createdAt: Date,
  updatedAt: Date
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | ✅ | MongoDB auto-generated ID |
| `name` | String | ✅ | Class name |
| `description` | String | ✅ | Class description |
| `teacherId` | ObjectId | ✅ | Teacher's User ID |
| `students` | Array[ObjectId] | ✅ | List of student User IDs |
| `createdAt` | Date | ✅ | Creation timestamp |
| `updatedAt` | Date | ✅ | Last update timestamp |

### Example Document

```json
{
  "_id": { "$oid": "507f1f77bcf86cd799439015" },
  "name": "Programming 101",
  "description": "Introduction to programming concepts",
  "teacherId": { "$oid": "507f1f77bcf86cd799439011" },
  "students": [
    { "$oid": "507f1f77bcf86cd799439020" },
    { "$oid": "507f1f77bcf86cd799439021" },
    { "$oid": "507f1f77bcf86cd799439022" }
  ],
  "createdAt": { "$date": "2026-05-01T10:00:00Z" },
  "updatedAt": { "$date": "2026-05-21T15:45:00Z" }
}
```

### Indexes

```javascript
db.turmas.createIndex({ "teacherId": 1 })
db.turmas.createIndex({ "students": 1 })
db.turmas.createIndex({ "createdAt": -1 })
```

### Typical Queries

```javascript
// Find classes taught by a teacher
db.turmas.find({ teacherId: ObjectId("507f1f77bcf86cd799439011") })

// Find classes that include a student
db.turmas.find({ students: ObjectId("507f1f77bcf86cd799439020") })

// Get class details with populated students
db.turmas.aggregate([
  { $match: { _id: ObjectId("507f1f77bcf86cd799439015") } },
  { $lookup: {
    from: "users",
    localField: "students",
    foreignField: "_id",
    as: "studentDetails"
  }}
])

// Count students in a class
db.turmas.aggregate([
  { $match: { _id: ObjectId("507f1f77bcf86cd799439015") } },
  { $project: { studentCount: { $size: "$students" } } }
])
```

---

## Data Relationships

```
User (teacher)
  ├── creates → Challenge
  └── manages → Turma
       └── contains → User (student)
            └── submits → Submission
                 └── solved → Challenge
```

### Reference Diagram

```
┌─────────────┐
│   User      │
│  (student)  │
└──────┬──────┘
       │
       ├─ submits many → Submission
       │
       └─ belongs to → Turma
       
┌─────────────┐
│   User      │
│  (teacher)  │
└──────┬──────┘
       │
       ├─ creates many → Challenge
       │
       └─ manages many → Turma

┌───────────┐      ┌──────────────┐
│Challenge  │ ─────│  Submission  │
└───────────┘      └──────────────┘
       ↑                 ↓
       └─ scored by ─ aiReview
```

---

## Database Statistics

### Collection Sizes (Typical)

For a platform with **500 students** and **100 challenges**:

| Collection | Documents | Avg Size | Total Size |
|-----------|-----------|----------|-----------|
| User | ~550 | 0.5 KB | ~275 KB |
| Challenge | ~100 | 5 KB | ~500 KB |
| Submission | ~10,000 | 2 KB | ~20 MB |
| Turma | ~20 | 3 KB | ~60 KB |
| **TOTAL** | **10,670** | - | **~21 MB** |

### Growth Estimates

- Each new student: ~15 submissions/year
- Each submission: ~2 KB (code) + 1 KB (review)
- Database grows ~200 KB per new student per year

---

## Backup & Maintenance

### Regular Backups

```bash
# Backup all collections
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/codebasics"

# Restore from backup
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/codebasics" dump/
```

### Data Cleanup

```bash
# Remove old submissions (> 1 year)
db.submissions.deleteMany({
  submittedAt: {
    $lt: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
  }
})

# Remove test data
db.submissions.deleteMany({ "aiReview": { $exists: false }, status: "pending" })
```

---

**Last Updated**: May 27, 2026
