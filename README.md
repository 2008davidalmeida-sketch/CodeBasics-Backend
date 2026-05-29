# CodeBasics Backend - Documentation

## 📚 Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start](#quick-start)
3. [Project Structure](#project-structure)
4. [Tech Stack](#tech-stack)
5. [Environment Setup](#environment-setup)
6. [Getting Help](#getting-help)

---

## Project Overview

**CodeBasics Backend** is a Node.js/Express REST API server for an online coding challenge platform. It provides:

- 🔐 **Google OAuth 2.0 Authentication** - Secure login via Google
- 💻 **Challenge Management** - Create, read, update, delete coding challenges
- 📝 **Code Submission** - Submit and track code solutions
- 👥 **User Management** - Student and teacher roles with different permissions
- 🤖 **AI Code Review** - Automated feedback using Google Gemini API
- 📊 **Progress Tracking** - Monitor student submissions and performance
- ⚡ **Job Queue Processing** - Background processing of submissions with BullMQ
- 🔄 **Caching** - Redis caching for performance optimization
- 📚 **Turma Management** - Organize students into classes

---

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Redis instance (local or cloud)
- Google OAuth credentials (Google Cloud Console)

### Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/2008davidalmeida-sketch/CodeBasics-Backend.git
cd CodeBasics-Backend

# 2. Install dependencies
npm install

# 3. Create .env file with required variables
cp .env.example .env

# 4. Configure environment variables (see Environment Setup section)

# 5. Start development server
npm run dev

# 6. Server runs on http://localhost:5000
```

### Verify Installation

```bash
# Health check endpoint
curl http://localhost:5000/health

# Expected response:
# { "status": "ok" }
```

---

## Project Structure

```
CodeBasics-Backend/
├── src/
│   ├── app.ts                    # Express app configuration
│   ├── server.ts                 # Server entry point
│   ├── config/
│   │   ├── db.ts                 # MongoDB configuration
│   │   ├── passport.ts           # Google OAuth strategy
│   │   ├── prompts.ts            # AI prompt templates
│   │   └── redis.ts              # Redis configuration
│   ├── controllers/
│   │   ├── authController.ts     # Authentication endpoints
│   │   ├── challengeController.ts # Challenge CRUD
│   │   ├── submissionController.ts # Submission handling
│   │   ├── userController.ts     # User management
│   │   └── TurmaController.ts    # Class management
│   ├── middleware/
│   │   ├── auth.ts               # JWT token verification
│   │   ├── rateLimiter.ts        # Rate limiting
│   │   └── validate.ts           # Request validation
│   ├── models/
│   │   ├── User.ts               # User schema
│   │   ├── Challenge.ts          # Challenge schema
│   │   ├── Submission.ts         # Submission schema
│   │   └── Turma.ts              # Class schema
│   ├── routes/
│   │   ├── auth.ts               # Auth routes
│   │   ├── challenges.ts         # Challenge routes
│   │   ├── submissions.ts        # Submission routes
│   │   ├── turmas.ts             # Class routes
│   │   └── users.ts              # User routes
│   ├── services/
│   │   └── (Service implementations)
│   ├── queues/
│   │   └── submissionQueue.ts    # BullMQ job queue
│   ├── workers/
│   │   └── submissionWorker.ts   # Background job processor
│   ├── validations/
│   │   └── submissionValidation.ts # Request validation schemas
│   ├── utils/
│   │   └── (Utility functions)
│   └── dbActions/
│       ├── seed.ts               # Seed database
│       ├── seedSubmissions.ts    # Seed submissions
│       ├── deleteUsers.ts        # Clear users
│       └── deleteSubmissions.ts  # Clear submissions
├── tests/
│   └── (Jest test files)
├── documentation/
│   ├── README.md                 # This file
│   ├── API_DOCUMENTATION.md      # API endpoints
│   ├── DATABASE_SCHEMA.md        # Database models
│   ├── AUTHENTICATION.md         # Auth flow
│   ├── DEVELOPMENT_GUIDE.md      # Development setup
│   ├── DEPLOYMENT_GUIDE.md       # Production deployment
│   ├── SECURITY_REPORT.md        # Security assessment
│   └── SCALABILITY_REPORT.md     # Scalability analysis
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── jest.config.js
```

---

## Tech Stack

### Runtime & Framework
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript

### Database & Cache
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Redis** - In-memory cache & session store
- **BullMQ** - Redis-based job queue

### Authentication
- **Passport.js** - Authentication middleware
- **passport-google-oauth20** - Google OAuth strategy
- **jsonwebtoken** - JWT token management
- **bcrypt** - Password hashing

### AI & Utilities
- **@google/generative-ai** - Gemini API integration
- **axios** - HTTP client
- **dotenv** - Environment variables
- **zod** - Data validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **cookie-parser** - Cookie middleware

### Testing & Development
- **Jest** - Testing framework
- **ts-node** - TypeScript execution
- **nodemon** - Auto-restart during development

---

## Environment Setup

### Required Environment Variables

Create a `.env` file in the root directory with these variables:

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

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Frontend URL (for CORS and redirects)
CLIENT_URL=http://localhost:5173

# AI Model
GEMINI_API_KEY=your-gemini-api-key
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable **Google+ API**
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - Local: `http://localhost:5000/auth/google/callback`
   - Production: `https://your-backend-url.com/auth/google/callback`
6. Copy **Client ID** and **Client Secret** to `.env`

### MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Add IP to whitelist (or allow all for development)
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/`
5. Set as `MONGODB_URI` in `.env`

### Redis Setup

**Local Redis:**
```bash
# macOS with Homebrew
brew install redis
brew services start redis

# Docker
docker run -d -p 6379:6379 redis:latest

# Windows - use Docker Desktop
```

**Redis Cloud (Production):**
1. Go to [Redis Cloud](https://redis.com/try-free)
2. Create free tier database
3. Copy connection URL to `REDIS_URL`

---

## Available Commands

```bash
# Development
npm run dev              # Start with hot-reload

# Production
npm run build            # Compile TypeScript
npm start               # Run compiled JavaScript

# Database
npm run seed            # Seed database with sample data
npm run seed-submissions # Add sample submissions

# Database Cleanup
npm run delete-users    # Remove all users
npm run delete-submissions # Remove all submissions

# Testing
npm test                # Run Jest tests
```

---

## Documentation Files

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API endpoint reference
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - MongoDB collection schemas
- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - Auth flow and token handling
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Local development setup & debugging
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deploy to production (Render)
- **[SECURITY_REPORT.md](./SECURITY_REPORT.md)** - Security assessment & recommendations
- **[SCALABILITY_REPORT.md](./SCALABILITY_REPORT.md)** - Scalability analysis & improvements

---

## Getting Help

### Useful Resources

- **[Express.js Documentation](https://expressjs.com/)** - Web framework
- **[Mongoose Documentation](https://mongoosejs.com/)** - MongoDB ODM
- **[Passport.js Documentation](https://www.passportjs.org/)** - Authentication
- **[Google Generative AI](https://ai.google.dev/)** - Gemini API docs
- **[BullMQ Documentation](https://docs.bullmq.io/)** - Job queue

### Common Issues

**Port already in use:**
```bash
# Kill process on port 5000
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

**MongoDB connection error:**
- Verify connection string in `.env`
- Check MongoDB Atlas firewall (whitelist your IP)
- Ensure database exists

**Redis connection error:**
- Verify Redis is running: `redis-cli ping`
- Check `REDIS_URL` in `.env`
- For Docker: `docker ps` to verify container is running

**Google OAuth failing:**
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Check allowed email domain (`ALLOWED_EMAIL_DOMAIN`)
- Verify callback URL in Google Cloud Console

---

## Project Statistics

- **Language**: TypeScript
- **Lines of Code**: ~3,000+
- **API Endpoints**: 20+
- **Database Collections**: 4 (User, Challenge, Submission, Turma)
- **External APIs**: Google OAuth, Gemini AI

---

## License

ISC License - See LICENSE file for details

---

**Last Updated**: May 27, 2026
