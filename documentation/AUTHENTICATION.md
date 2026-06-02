# Authentication Guide - CodeBasics Backend

## 🔐 Overview

CodeBasics Backend uses **Google OAuth 2.0** for authentication with **JWT tokens** for API access. This guide explains the complete authentication flow and how to implement it on the frontend.

---

## Authentication Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                  1. User Clicks "Login with Google"           │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  2. Redirected to Google OAuth Consent Screen                │
│     GET /auth/google                                         │
│     → Google OAuth dialog                                    │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  3. User Authorizes & Google Redirects Back                 │
│     GET /auth/google/callback?code=...&state=...            │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  4. Backend Exchanges Code for Google User Info             │
│     - Verify code with Google                               │
│     - Extract user: name, email, photo, googleId           │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  5. Check if User Exists in Database                        │
│     - If yes: Update photo if changed                       │
│     - If no: Create new user with role='student'            │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  6. Generate JWT Token                                       │
│     - Sign with JWT_SECRET                                  │
│     - Include: user ID, role                                │
│     - Expires in: 7 days                                    │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  7. Redirect to Frontend with Token                         │
│     Redirect: /auth/callback?token=eyJ...                   │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  8. Frontend Extracts & Stores Token                        │
│     - Read token from URL parameter                         │
│     - Save to localStorage/sessionStorage                   │
│     - Clear token from URL for security                     │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  9. Frontend Calls API with Token                           │
│     GET /auth/me                                             │
│     Header: Authorization: Bearer <token>                   │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  10. Backend Verifies Token & Returns User                  │
│     - Verify JWT signature with JWT_SECRET                 │
│     - Extract user ID and role                             │
│     - Fetch user from database                             │
│     - Return user profile                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## JWT Token Structure

The JWT token contains three parts: **Header.Payload.Signature**

### Example Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNjIxNjE3NjAwLCJleHAiOjE2MjIyMjI0MDB9.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Decoded Payload
```json
{
  "id": "507f1f77bcf86cd799439011",
  "role": "student",
  "iat": 1621617600,      // Issued at
  "exp": 1622222400       // Expires at (7 days later)
}
```

---

## Backend Implementation

### Token Generation

**File**: `src/controllers/authController.ts`

```typescript
import jwt from 'jsonwebtoken'

export function handleGoogleCallback(req: Request, res: Response): void {
    const user = req.user as IUser
    
    // Generate JWT token
    const token = jwt.sign(
        { id: user._id.toString(), role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    )

    // Pass token in redirect URL
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`)
}
```

### Token Verification

**File**: `src/middleware/auth.ts`

```typescript
export function verifyToken(req: AuthRequest, res: Response, next: NextFunction): void {
    // 1. Try cookie first (for same-domain requests)
    let token = req.cookies?.token

    // 2. Fallback to Authorization header (for cross-domain, mobile, API clients)
    if (!token) {
        const authHeader = req.headers.authorization
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1]
        }
    }

    // Check if token exists
    if (!token) {
        res.status(401).json({ error: 'No token provided' })
        return
    }

    try {
        // Verify and decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { 
            id: string
            role: string 
        }

        // Attach user info to request
        req.userId = decoded.id
        req.userRole = decoded.role

        next()
    } catch {
        res.status(401).json({ error: 'Invalid token' })
    }
}
```

---

## Frontend Implementation

### Step 1: Extract Token from URL

**File**: `src/pages/AuthCallback/AuthCallback.tsx`

```typescript
import { useSearchParams } from 'react-router-dom'

export default function AuthCallback() {
    const [searchParams] = useSearchParams()

    useEffect(() => {
        // Extract token from URL parameter
        const token = searchParams.get('token')
        
        if (token) {
            // Store token in localStorage (or sessionStorage for more security)
            localStorage.setItem('authToken', token)
            
            // Clean up URL to hide token from history
            window.history.replaceState({}, document.title, '/auth/callback')
        }
    }, [])
}
```

### Step 2: Add Token to API Requests

**File**: `src/services/api.ts`

```typescript
import axios from 'axios'

const api = axios.create({
    baseURL: 'https://api.example.com',
    withCredentials: true
})

// Add Authorization header to all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Handle 401 errors (token expired)
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Token expired, redirect to login
            localStorage.removeItem('authToken')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api
```

### Step 3: Use API in Components

```typescript
import api from '../services/api'

export function useAuth() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // This request automatically includes the Authorization header
        api.get('/auth/me')
            .then(res => setUser(res.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, [])

    return { user, loading }
}
```

---

## Environment Variables

### Backend (.env)

```env
# Authentication
JWT_SECRET=your-super-secret-key-change-in-production
ALLOWED_EMAIL_DOMAIN=example.com

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
```

### Frontend (.env)

```env
VITE_API_URL=https://api.example.com
VITE_CLIENT_URL=https://app.example.com
```

---

## Security Best Practices

### ✅ DO

- **Store tokens in localStorage/sessionStorage**, not cookies (for cross-domain)
- **Use HTTPS only** in production
- **Set JWT expiration** (7 days recommended)
- **Validate token signature** on backend
- **Clean up URL** after extracting token
- **Use httpOnly cookies** for same-domain deployments
- **Refresh token** before expiration
- **Validate email domain** on backend

### ❌ DON'T

- ❌ Store tokens in plain localStorage without HTTPS
- ❌ Pass tokens as URL parameters (use fragment `#token=`)
- ❌ Log tokens to console in production
- ❌ Use same JWT_SECRET in dev and prod
- ❌ Extend token expiration beyond 7 days
- ❌ Expose JWT_SECRET in frontend code

---

## Token Refresh Strategy

For long-lived sessions, implement token refresh:

### Backend

```typescript
// Refresh token endpoint
router.post('/auth/refresh', (req, res) => {
    const oldToken = req.headers.authorization?.split(' ')[1]
    
    if (!oldToken) {
        return res.status(401).json({ error: 'No token provided' })
    }
    
    try {
        const decoded = jwt.decode(oldToken) as any
        
        const newToken = jwt.sign(
            { id: decoded.id, role: decoded.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        )
        
        res.json({ token: newToken })
    } catch {
        res.status(401).json({ error: 'Invalid token' })
    }
})
```

### Frontend

```typescript
// Refresh token 1 day before expiration
const TOKEN_REFRESH_INTERVAL = 6 * 24 * 60 * 60 * 1000 // 6 days

useEffect(() => {
    const refreshToken = async () => {
        try {
            const response = await api.post('/auth/refresh')
            localStorage.setItem('authToken', response.data.token)
        } catch (error) {
            localStorage.removeItem('authToken')
            navigate('/login')
        }
    }
    
    const timer = setInterval(refreshToken, TOKEN_REFRESH_INTERVAL)
    return () => clearInterval(timer)
}, [])
```

---

## Logout Flow

### Backend

```typescript
// Clear authentication
router.post('/auth/logout', (req, res) => {
    res.clearCookie('token')
    res.json({ message: 'Logged out' })
})
```

### Frontend

```typescript
function logout() {
    // Clear token from storage
    localStorage.removeItem('authToken')
    
    // Call logout endpoint (optional)
    api.post('/auth/logout').catch(() => {})
    
    // Redirect to home
    navigate('/')
}
```

---

## Troubleshooting

### 401 Unauthorized on /auth/me

**Problem**: Token is not being sent

**Solution**:
1. Verify token exists: `localStorage.getItem('authToken')`
2. Check Authorization header: Browser DevTools → Network → /auth/me → Headers
3. Verify token format: `Bearer {token}`
4. Check token expiration: Decode at [jwt.io](https://jwt.io)

### Token appearing in browser history

**Problem**: Token passed as URL parameter (`?token=...`)

**Solution**: Use `window.history.replaceState()` to hide token from history

```typescript
window.history.replaceState({}, document.title, '/auth/callback')
```

### CORS errors with credentials

**Problem**: Token not being sent cross-domain

**Solution**: Ensure CORS is configured:

```typescript
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))
```

### Different JWT_SECRET between dev and prod

**Problem**: Token generated in dev doesn't work in production

**Solution**: Verify JWT_SECRET is set in production environment

```bash
# In Render dashboard, check Environment variables
# JWT_SECRET should be identical in all environments
```

---

## Token Validation Examples

### Using cURL

```bash
TOKEN="your_jwt_token_here"

curl -H "Authorization: Bearer $TOKEN" \
  https://api.example.com/auth/me
```

### Using JavaScript

```javascript
const token = localStorage.getItem('authToken')

fetch('https://api.example.com/auth/me', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
.then(res => res.json())
.then(data => console.log('User:', data))
.catch(err => console.error('Auth failed:', err))
```

### Using Axios

```javascript
import axios from 'axios'

const api = axios.create({
    baseURL: 'https://api.example.com'
})

api.get('/auth/me', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
})
```

---

**Last Updated**: May 27, 2026
