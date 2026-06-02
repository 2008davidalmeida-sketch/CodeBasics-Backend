# Development Guide - CodeBasics Backend

## 🛠️ Local Development Setup

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org))
- **MongoDB** (local or Atlas account)
- **Redis** (local or cloud)
- **Git** ([download](https://git-scm.com))
- **VS Code** (recommended) with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Thunder Client (for API testing)
  - MongoDB for VS Code

---

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/2008davidalmeida-sketch/CodeBasics-Backend.git
cd CodeBasics-Backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

```bash
# Copy example (if exists)
cp .env.example .env

# Or create new .env with required variables
touch .env
```

### 4. Configure Environment Variables

Add these to `.env`:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codebasics

# Redis
REDIS_URL=redis://localhost:6379

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
ALLOWED_EMAIL_DOMAIN=example.com

# JWT
JWT_SECRET=dev-secret-key-change-in-production

# Frontend
CLIENT_URL=http://localhost:5173

# AI
GEMINI_API_KEY=your-gemini-api-key
```

### 5. Start Services

#### MongoDB Local

```bash
# macOS with Homebrew
brew services start mongodb-community

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Redis Local

```bash
# macOS with Homebrew
brew services start redis

# Docker
docker run -d -p 6379:6379 --name redis redis:latest

# Windows (using WSL)
wsl redis-server
```

#### Start Development Server

```bash
npm run dev
```

Expected output:
```
✓ Server running on http://localhost:5000
✓ Connected to MongoDB
✓ Connected to Redis
```

---

## Project Structure Deep Dive

### Configuration Files

#### `src/config/db.ts`
Mongoose connection setup with connection pooling

```typescript
// Key settings:
// - maxPoolSize: 10 connections
// - autoIndex: true (automatic index creation)
// - serverSelectionTimeoutMS: 5000
```

#### `src/config/passport.ts`
Google OAuth strategy configuration

#### `src/config/redis.ts`
Redis client initialization for caching and queues

#### `src/config/prompts.ts`
AI prompt templates for code review

### Controllers

Each controller handles a specific domain:

```
authController.ts       → Login, logout, user profile
challengeController.ts  → CRUD for challenges
submissionController.ts → Submit code, fetch submissions
userController.ts       → User management, student list
TurmaController.ts      → Class management
```

### Middleware

```
auth.ts        → JWT verification
rateLimiter.ts → Rate limiting with Redis
validate.ts    → Request validation with Zod
```

### Queues & Workers

```
queues/submissionQueue.ts    → BullMQ job queue setup
workers/submissionWorker.ts  → Process submissions with Gemini AI
```

---

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Database Operations

#### Seed Sample Data

```bash
# Add sample users, challenges, turmas
npm run seed

# Add sample submissions
npm run seed-submissions
```

#### Clear Database

```bash
# Remove all users
npm run delete-users

# Remove all submissions
npm run delete-submissions
```

### TypeScript Compilation

```bash
# Check for type errors
npm run build

# Watch mode (auto-compile on changes)
tsc --watch
```

---

## Debugging

### Using VS Code Debugger

1. **Create `.vscode/launch.json`:**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceFolder}/node_modules/ts-node/dist/index.js",
      "args": ["src/server.ts"],
      "env": {
        "NODE_ENV": "development"
      },
      "restart": true,
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

2. **Set breakpoints** by clicking line numbers
3. **Press F5** to start debugging
4. **Use Debug Console** to inspect variables

### Console Logging

```typescript
// Basic logging
console.log('Value:', value)

// With colors (development only)
console.log('\x1b[32m%s\x1b[0m', '✓ Success')  // Green
console.log('\x1b[31m%s\x1b[0m', '✗ Error')    // Red

// Object inspection
console.table(array)
console.log(JSON.stringify(obj, null, 2))
```

### Network Debugging

Use Thunder Client extension in VS Code:

1. Open Thunder Client
2. Create request to `http://localhost:5000/endpoint`
3. View response, headers, status code

### MongoDB Debugging

```javascript
// Check collections in MongoDB Compass or mongosh
use codebasics

// View documents
db.users.find().limit(5)
db.submissions.findOne({ status: 'pending' })

// Check indexes
db.users.getIndexes()

// Monitor queries
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().limit(5).sort({ ts: -1 }).pretty()
```

### Redis Debugging

```bash
# Connect to Redis CLI
redis-cli

# View keys
KEYS *
KEYS submission:*

# Inspect queue jobs
LRANGE bull:submissionQueue:active 0 -1

# Clear all data (development only!)
FLUSHDB
```

---

## Common Issues & Solutions

### Port Already in Use

```bash
# Find and kill process on port 5000
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use different port
PORT=5001 npm run dev
```

### MongoDB Connection Fails

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**
1. Start MongoDB: `brew services start mongodb-community`
2. Check connection string in `.env`
3. Verify IP is whitelisted in MongoDB Atlas
4. Check firewall settings

### Redis Connection Fails

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solutions:**
1. Start Redis: `brew services start redis`
2. Check Redis is running: `redis-cli ping` (should return PONG)
3. Verify `REDIS_URL` in `.env`

### Google OAuth Not Working

**Problem:** Redirect loop or "Invalid client"

**Solution:**
1. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
2. Check callback URL in Google Cloud Console:
   - Local: `http://localhost:5000/auth/google/callback`
   - Prod: `https://your-backend.render.com/auth/google/callback`
3. Verify `ALLOWED_EMAIL_DOMAIN` matches your domain

### Type Errors

```bash
# Check all type errors
npm run build

# Type check only (no compilation)
tsc --noEmit
```

### Hot Reload Not Working

```bash
# Kill nodemon
pkill -f nodemon

# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Restart with verbose logging
npm run dev -- --verbose
```

---

## Code Style & Standards

### TypeScript Best Practices

```typescript
// ✅ DO: Use type annotations
const userId: string = req.userId
const submission: ISubmission = await Submission.findById(id)

// ❌ DON'T: Leave types as any
const data: any = JSON.parse(json)

// ✅ DO: Use interfaces for objects
interface CreateChallengeRequest {
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
}

// ✅ DO: Use async/await
async function getUser(id: string) {
  return await User.findById(id)
}

// ❌ DON'T: Use callback hell
User.findById(id, (err, user) => { ... })
```

### Error Handling

```typescript
// ✅ DO: Handle all errors
try {
  const user = await User.findById(id)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  res.json(user)
} catch (err) {
  console.error('Error:', err)
  res.status(500).json({ error: 'Database error' })
}

// ❌ DON'T: Ignore errors
const user = await User.findById(id)
res.json(user)  // Crashes if id doesn't exist
```

### Validation

```typescript
import { z } from 'zod'

// Define schema
const submitCodeSchema = z.object({
  challengeId: z.string().min(1),
  code: z.string().min(1)
})

// Validate request
const parsed = submitCodeSchema.safeParse(req.body)
if (!parsed.success) {
  return res.status(400).json({ error: parsed.error })
}
```

---

## Performance Optimization

### Database Queries

```typescript
// ✅ DO: Use projection to limit fields
db.users.find({}, { name: 1, email: 1 })

// ✅ DO: Use pagination
db.challenges.find().skip(10).limit(10)

// ✅ DO: Create indexes for frequent queries
db.submissions.createIndex({ userId: 1, status: 1 })

// ❌ DON'T: Fetch all documents
db.users.find({})  // If table has millions of docs
```

### Caching with Redis

```typescript
import redis from './config/redis'

// Check cache first
const cached = await redis.get(`user:${userId}`)
if (cached) {
  return JSON.parse(cached)
}

// Cache miss - fetch from DB
const user = await User.findById(userId)
await redis.setex(`user:${userId}`, 3600, JSON.stringify(user))

return user
```

### Background Jobs

```typescript
import { submissionQueue } from './queues/submissionQueue'

// Submit code
const submission = await Submission.create({ ... })

// Queue AI review job (non-blocking)
await submissionQueue.add('review', { submissionId: submission._id })

// Return immediately
res.json({ message: 'Submission queued for review' })
```

---

## Monitoring & Logging

### Winston Logger Setup

```typescript
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

// Usage
logger.info('User login', { userId: '123' })
logger.error('Database error', { error: err.message })
```

### Request Logging

```typescript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})
```

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes, test locally
npm test

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push to GitHub
git push origin feature/new-feature

# Create Pull Request on GitHub

# After review and approval, merge to main
git checkout main
git pull origin main
git merge feature/new-feature
git push origin main
```

### Commit Message Convention

```
feat:     New feature
fix:      Bug fix
docs:     Documentation
style:    Code style (formatting, semicolons, etc)
refactor: Code refactoring
test:     Adding or updating tests
chore:    Build process, dependencies, etc

Example: feat: add AI code review for submissions
```

---

## API Testing with Thunder Client

### Create Test Collection

1. Open Thunder Client
2. Click "Collections"
3. Create new collection: "CodeBasics"
4. Add requests:

```
GET /auth/me
POST /submissions
GET /challenges
GET /users/students
```

### Set Environment Variables

```json
{
  "baseUrl": "http://localhost:5000",
  "token": "your-jwt-token",
  "userId": "507f1f77bcf86cd799439011"
}
```

---

## Useful Resources

- **Express Docs**: https://expressjs.com
- **Mongoose Docs**: https://mongoosejs.com
- **TypeScript Docs**: https://www.typescriptlang.org
- **Jest Testing**: https://jestjs.io
- **BullMQ**: https://docs.bullmq.io
- **Passport.js**: https://www.passportjs.org

---

**Last Updated**: May 27, 2026
