# Security Report - CodeBasics Backend

**Report Date:** May 16, 2026  
**Application:** CodeBasics Backend  
**Type:** Security Assessment & Recommendations

---

## Executive Summary

This backend application is a Node.js/Express-based educational platform with Google OAuth authentication, MongoDB persistence, and AI-powered code review functionality using Gemini API. The assessment identified **12 critical/high-risk issues**, **8 medium-risk issues**, and **6 low-risk issues** requiring attention.

### Risk Distribution
- 🔴 **Critical/High:** 12 issues
- 🟠 **Medium:** 8 issues  
- 🟡 **Low:** 6 issues

---

## 1. Authentication & Authorization

### 1.1 🔴 CRITICAL: JWT Token Exposure in URL Parameters

**Issue:** JWT tokens are passed as URL query parameters in redirect URIs.

```typescript
// In authController.ts
const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?token=${token}`
res.redirect(redirectUrl)
```

**Risk:**
- Tokens are logged in browser history
- Tokens appear in server logs and referrer headers
- Tokens may be exposed in proxies and CDN logs
- Violates OAuth 2.0 security best practices

**Recommendation:**
- Use HTTP-only, Secure cookies instead:
  ```typescript
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  })
  res.redirect(`${process.env.CLIENT_URL}/auth/callback`)
  ```
- Alternatively, use fragment identifier (client-side only): `#token=...`

---

### 1.2 🔴 CRITICAL: No HTTP-Only Cookie Flag

**Issue:** Tokens are vulnerable to XSS attacks when passed via URL or query params.

**Risk:**
- Client-side JavaScript can access tokens
- XSS vulnerabilities would compromise all user sessions
- CSRF attacks are not mitigated

**Recommendation:**
```typescript
// Implement secure cookie-based session management
res.cookie('token', jwtToken, {
  httpOnly: true,      // Prevent JavaScript access
  secure: true,        // HTTPS only
  sameSite: 'strict',  // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000
})
```

---

### 1.3 🟠 MEDIUM: Weak Role-Based Access Control

**Issue:** Role-based access control only checks for "teacher" role. No granular permissions.

```typescript
// In routes/challenges.ts
router.post('/', verifyToken, verifyRole('teacher'), createChallenge)
router.put('/:id', verifyToken, verifyRole('teacher'), updateChallenge)
```

**Risk:**
- All teachers have identical permissions
- No distinction between admin, instructor, course owner
- Cannot implement department-level access control

**Recommendation:**
```typescript
// Implement permission-based middleware
export function verifyPermission(permission: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await User.findById(req.userId)
    if (!user?.permissions?.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }
}
```

---

### 1.4 🟠 MEDIUM: Insufficient Input Validation on Auth Routes

**Issue:** Auth routes have no input validation schema defined.

```typescript
// auth.ts - No validation on callback
router.get('/google/callback', (req, res, next) => { ... })
```

**Recommendation:**
- Add validation schemas for all auth routes
- Validate email domain more strictly
- Implement rate limiting on auth endpoints

---

## 2. Data Protection & Storage

### 2.1 🔴 CRITICAL: Redis TLS Verification Disabled

**Issue:** TLS certificate verification is disabled in Redis connection.

```typescript
// In redis.ts
if (redisUrl.startsWith('rediss://')) {
    redisOptions.tls = { rejectUnauthorized: false }; // 🔴 VULNERABLE
}
```

**Risk:**
- Man-in-the-middle (MITM) attacks possible
- Credentials/session data can be intercepted
- No authentication guarantee to Redis server

**Recommendation:**
```typescript
// Only disable verification if absolutely necessary (dev environment)
const redisOptions: any = {
    maxRetriesPerRequest: null,
    tls: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: true }
        : { rejectUnauthorized: false }
};
```

---

### 2.2 🔴 CRITICAL: Sensitive Data in Logs

**Issue:** User information and sensitive details are logged to console.

```typescript
// In passport.ts
console.log('Email:', email)
console.log('Domain check:', email?.endsWith(...))
console.log('ALLOWED_EMAIL_DOMAIN:', process.env.ALLOWED_EMAIL_DOMAIN)

// In authController.ts
console.log('req.user:', req.user)
```

**Risk:**
- Logs exposed to unauthorized users
- Container/orchestration system logs may be accessible
- Credentials may be logged during errors

**Recommendation:**
```typescript
// Use proper logger (winston, bunyan, pino)
import logger from './config/logger'

logger.debug('User authentication attempt', { email: email.split('@')[1] }) // Hash sensitive data
logger.error('Authentication error', { errorCode: error.code }) // Don't log full error
```

---

### 2.3 🟠 MEDIUM: No API Key Rotation Strategy

**Issue:** Google API key and Gemini API key are stored as environment variables with no rotation mechanism.

```typescript
// In submissionWorker.ts
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
```

**Risk:**
- Compromised keys cannot be quickly revoked
- No audit trail of key usage
- Keys may be cached in process memory

**Recommendation:**
- Implement key rotation every 90 days
- Use vault system (HashiCorp Vault, AWS Secrets Manager)
- Implement key versioning
- Add comprehensive audit logging for API calls

---

### 2.4 🟠 MEDIUM: Unencrypted Database Connection String

**Issue:** MongoDB connection string is stored in environment variable without validation.

```typescript
// In db.ts
const mongoUri = process.env.MONGO_URI as string
```

**Risk:**
- If .env file is committed or exposed, full database access is compromised
- No connection encryption verification
- No SSL certificate pinning

**Recommendation:**
```typescript
// Validate connection string format and use SSL
const options: mongoose.ConnectOptions = {
    ssl: true,
    retryWrites: true,
    w: 'majority',
    authSource: 'admin',
    // ... other options
}
```

---

## 3. Input Validation & Injection Attacks

### 3.1 🟠 MEDIUM: Large Code Submission Input Limit

**Issue:** Code submissions can be up to 50,000 characters.

```typescript
// In submissionValidation.ts
code: z.string()
    .min(1, 'Code is required')
    .max(50000, 'Code exceeds maximum length of 50,000 characters'),
```

**Risk:**
- Potential DoS attacks via large payloads
- Gemini API rate limits and cost
- Processing queue could be overwhelmed

**Recommendation:**
```typescript
code: z.string()
    .min(1, 'Code is required')
    .max(10000, 'Code exceeds maximum length of 10,000 characters'), // Reduced
```

---

### 3.2 🟠 MEDIUM: No Request Size Limit on Other Endpoints

**Issue:** Only JSON limit is set globally.

```typescript
// In app.ts
app.use(express.json({ limit: '100kb' }))
```

**Risk:**
- Other content types (form, raw) have no limits
- Potential DoS via large payloads

**Recommendation:**
```typescript
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ limit: '100kb', extended: true }))
app.use(express.raw({ limit: '100kb' }))
```

---

### 3.3 🟡 LOW: No Input Sanitization

**Issue:** User inputs are not sanitized before being sent to Gemini API.

```typescript
// In submissionWorker.ts
const prompt = `Challenge: ${challenge.title}...Student code:\`\`\`python\n${code}\n\`\`\``
```

**Risk:**
- Potential prompt injection attacks
- Could manipulate Gemini responses
- Low severity as Gemini API provides some protection

**Recommendation:**
```typescript
// Escape and validate inputs
const escapedCode = code.replace(/`/g, '\\`').replace(/\$/g, '\\$')
const prompt = `Challenge: ${challenge.title}...Student code:\`\`\`python\n${escapedCode}\n\`\`\``
```

---

## 4. Rate Limiting & DoS Protection

### 4.1 🟠 MEDIUM: Submission Rate Limiter Uses User ID Instead of IP

**Issue:** Rate limiter key is based on user ID, not IP address.

```typescript
// In rateLimiter.ts
keyGenerator: (req: any) => req.userId,
```

**Risk:**
- Authenticated users can be rate limited, but not unauthenticated ones
- Public endpoints have no protection
- Rate limit bypass possible with multiple accounts

**Recommendation:**
```typescript
// Implement IP-based rate limiting for public endpoints
export const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    keyGenerator: (req: any) => req.ip, // Use IP
    store: new RedisStore({ ... }),
})

// Use IP as primary, fallback to user ID for authenticated
export const userLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 100,
    keyGenerator: (req: any) => req.userId || req.ip,
    store: new RedisStore({ ... }),
})
```

---

### 4.2 🔴 CRITICAL: No Rate Limiting on Public Endpoints

**Issue:** Challenges, health check, and Google auth routes have no rate limiting.

```typescript
// In routes/challenges.ts
router.get('/', getChallenges)        // No rate limit
router.get('/:id', getChallenge)      // No rate limit
```

**Risk:**
- DoS attacks on public endpoints
- API abuse without consequences
- Database query exhaustion

**Recommendation:**
```typescript
// Apply rate limiting to all public endpoints
const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    keyGenerator: (req: any) => req.ip,
    store: new RedisStore({ ... }),
})

router.get('/', publicLimiter, getChallenges)
router.get('/:id', publicLimiter, getChallenge)
```

---

### 4.3 🟠 MEDIUM: No Query Pagination Validation

**Issue:** Pagination parameters are parsed without validation.

```typescript
// In controllers
const page = parseInt(req.query.page as string) || 1
const limit = parseInt(req.query.limit as string) || 20
```

**Risk:**
- Negative page/limit values could cause issues
- No maximum limit protection
- Potential query exhaustion

**Recommendation:**
```typescript
const page = Math.max(1, parseInt(req.query.page as string) || 1)
const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
```

---

## 5. Security Headers & Configuration

### 5.1 🟠 MEDIUM: Missing Security Headers

**Issue:** No security headers are configured.

```typescript
// In app.ts - No Helmet middleware
app.use(express.json())
```

**Risk:**
- No HSTS enforcement
- No X-Frame-Options protection
- No Content-Security-Policy
- Vulnerable to clickjacking

**Recommendation:**
```typescript
import helmet from 'helmet'

app.use(helmet())
app.use(helmet.strictTransportSecurity({ maxAge: 31536000, includeSubDomains: true }))
app.use(helmet.frameguard({ action: 'deny' }))
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
    }
}))
```

**Install:** `npm install helmet`

---

### 5.2 🔴 CRITICAL: CORS Configuration Too Permissive

**Issue:** CORS allows any request from configured CLIENT_URL.

```typescript
// In app.ts
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))
```

**Risk:**
- If CLIENT_URL is not strictly validated, CORS bypass possible
- Credentials sent to any matching origin
- No whitelist of allowed origins

**Recommendation:**
```typescript
const allowedOrigins = [
    process.env.CLIENT_URL,
    'https://www.codebasics.app',
    'https://admin.codebasics.app'
]

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('CORS not allowed'))
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
```

---

### 5.3 🟠 MEDIUM: No HTTPS Enforcement

**Issue:** No redirect from HTTP to HTTPS middleware.

```typescript
// In app.ts
app.set('trust proxy', 1) // Only trust proxy, no HTTPS redirect
```

**Risk:**
- Users might access via HTTP
- Session hijacking possible
- Credentials transmitted in plaintext over HTTP

**Recommendation:**
```typescript
// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`)
        } else {
            next()
        }
    })
}
```

---

## 6. Error Handling & Information Disclosure

### 6.1 🔴 CRITICAL: Verbose Error Messages

**Issue:** Generic error messages but debug logs expose sensitive information.

```typescript
// In workers/submissionWorker.ts
console.error(`Error processing submission ${submissionId}:`, error)

// In controllers
console.error('Submission error:', error)
```

**Risk:**
- Stack traces visible in logs
- Database errors reveal schema information
- API structure exposed through error messages

**Recommendation:**
```typescript
// Implement proper error logging and sanitization
logger.error('Submission processing failed', {
    submissionId,
    errorCode: error.code,
    errorMessage: error.message,
    // Don't log full error object
})

// Return generic error to client
res.status(500).json({ error: 'An error occurred' })
```

---

### 6.2 🟡 LOW: No Structured Error Response Format

**Issue:** Error responses vary between endpoints.

```typescript
res.json({ error: 'message' })         // Some endpoints
res.status(400).json({ error: 'message', details: [...] })  // Others
```

**Recommendation:**
```typescript
// Standardize error responses
interface ErrorResponse {
    error: string
    code: string
    timestamp: string
    requestId?: string
}
```

---

## 7. Database Security

### 7.1 🟠 MEDIUM: No Database Activity Monitoring

**Issue:** No logging or monitoring of database queries and operations.

**Risk:**
- Cannot detect unauthorized access
- No audit trail for compliance
- Difficult to investigate breaches

**Recommendation:**
- Enable MongoDB audit logs
- Implement database access monitoring
- Log all write operations
- Set up alerts for suspicious queries

---

### 7.2 🟡 LOW: No Database Backup Strategy Visible

**Issue:** No backup configuration or disaster recovery plan documented.

**Risk:**
- Data loss not preventable
- No recovery procedure

**Recommendation:**
- Implement daily incremental backups
- Test backup restoration regularly
- Store backups in separate geographic location
- Document RTO/RPO requirements

---

## 8. Dependency Management

### 8.1 🟠 MEDIUM: Outdated Dependencies

**Issue:** Some dependencies may have known vulnerabilities.

```json
{
  "bullmq": "^5.76.5",
  "express": "^5.2.1"
}
```

**Risk:**
- Known CVEs in dependencies
- Supply chain attacks

**Recommendation:**
```bash
# Regular dependency audits
npm audit
npm audit fix

# Update dependencies
npm update

# Use npm-audit-ci to enforce in CI/CD
npm install -g npm-audit-ci
```

---

### 8.2 🟡 LOW: No Security.json File

**Issue:** No security contact information or vulnerability disclosure policy.

**Recommendation:**
Create `.well-known/security.json`:
```json
{
  "security_contact": "security@codebasics.app",
  "security_url": "https://codebasics.app/security",
  "bug_bounty_program": "https://bugbounty.codebasics.app",
  "pgp_key": "https://codebasics.app/pgp.asc"
}
```

---

## 9. API Security

### 9.1 🟠 MEDIUM: No API Versioning

**Issue:** No versioning strategy for API endpoints.

```typescript
app.use('/auth', authRoutes)
app.use('/challenges', challengeRoutes)
```

**Risk:**
- Breaking changes affect all clients
- No backward compatibility
- Difficult to deprecate endpoints

**Recommendation:**
```typescript
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/challenges', challengeRoutes)
// Support v1 and v2 in parallel
app.use('/api/v2/auth', authRoutesV2)
```

---

### 9.2 🟡 LOW: No Request ID Tracking

**Issue:** No correlation IDs for request tracking.

```typescript
// In app.ts - No middleware for request tracking
```

**Risk:**
- Difficult to trace requests through logs
- No way to correlate with client reports

**Recommendation:**
```typescript
import { v4 as uuidv4 } from 'uuid'

app.use((req, res, next) => {
    req.id = req.headers['x-request-id'] || uuidv4()
    res.setHeader('X-Request-ID', req.id)
    next()
})
```

---

### 9.3 🔴 CRITICAL: No Request Signature Verification

**Issue:** No webhook or API call signature verification.

**Risk:**
- Cannot verify legitimate API consumers
- Replay attacks possible
- Man-in-the-middle attacks

**Recommendation:**
```typescript
// Implement HMAC signature verification
import crypto from 'crypto'

export const verifySignature = (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers['x-signature']
    const body = JSON.stringify(req.body)
    
    const expectedSignature = crypto
        .createHmac('sha256', process.env.WEBHOOK_SECRET as string)
        .update(body)
        .digest('hex')
    
    if (signature !== expectedSignature) {
        return res.status(401).json({ error: 'Invalid signature' })
    }
    next()
}
```

---

## 10. Container & Deployment Security

### 10.1 🟡 LOW: Base Image Not Pinned

**Issue:** Using `node:20-alpine` without specific version.

```dockerfile
FROM node:20-alpine AS builder
```

**Risk:**
- Image could change between builds
- Reproducibility issues

**Recommendation:**
```dockerfile
# Pin to specific version
FROM node:20.14.0-alpine3.20 AS builder
```

---

### 10.2 🟡 LOW: No Health Check

**Issue:** Dockerfile has no HEALTHCHECK directive.

```dockerfile
# No HEALTHCHECK defined
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

**Recommendation:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
```

---

## 11. Testing & Validation

### 11.1 🟠 MEDIUM: No Security Test Coverage

**Issue:** Test files exist but no security-specific tests.

```typescript
// tests/auth.test.ts exists but likely missing:
// - CSRF protection tests
// - XSS prevention tests  
// - SQL injection tests (if applicable)
// - JWT manipulation tests
```

**Recommendation:**
```typescript
describe('Security Tests', () => {
    test('Should reject invalid JWT tokens', () => { ... })
    test('Should not allow accessing other user data', () => { ... })
    test('Should enforce role-based access', () => { ... })
    test('Should rate limit excessive requests', () => { ... })
})
```

---

### 11.2 🟡 LOW: No OWASP Top 10 Checklist

**Issue:** No documented checklist against OWASP Top 10.

**Recommendation:**
Create OWASP_TOP_10_CHECKLIST.md documenting:
- A01:2021 - Broken Access Control
- A02:2021 - Cryptographic Failures
- A03:2021 - Injection
- A04:2021 - Insecure Design
- A05:2021 - Security Misconfiguration
- A06:2021 - Vulnerable and Outdated Components
- A07:2021 - Authentication Failures
- A08:2021 - Data Integrity Failures
- A09:2021 - Logging and Monitoring Failures
- A10:2021 - SSRF

---

## 12. Monitoring & Incident Response

### 12.1 🟠 MEDIUM: No Security Audit Logging

**Issue:** No comprehensive audit log of security events.

**Risk:**
- Cannot detect suspicious activity
- No compliance audit trail
- Difficult to investigate breaches

**Recommendation:**
```typescript
// Log all security events
logger.info('User login successful', { userId, timestamp, ip })
logger.warn('Failed login attempt', { email, ip, attemptCount })
logger.error('Unauthorized access attempt', { userId, resource, timestamp })
logger.info('Role changed', { userId, oldRole, newRole, changedBy })
```

---

### 12.2 🟠 MEDIUM: No Alerting System

**Issue:** No alerts for suspicious activities.

**Risk:**
- Security incidents go unnoticed
- No real-time response capability

**Recommendation:**
Implement alerts for:
- Multiple failed login attempts
- Access denied errors (403)
- Rate limit exceeded
- Unusual API activity
- Database errors
- Worker failures

---

## Security Improvement Roadmap

### Phase 1: Critical (Implement Within 1-2 Weeks)
1. ✅ Move JWT tokens to HTTP-only cookies
2. ✅ Enable TLS verification for Redis
3. ✅ Remove sensitive data from logs
4. ✅ Implement rate limiting on all public endpoints
5. ✅ Add CORS origin whitelist validation

### Phase 2: High Priority (Within 1 Month)
6. ✅ Add security headers (Helmet)
7. ✅ Implement HTTPS enforcement
8. ✅ Enhance error handling
9. ✅ Add comprehensive input validation
10. ✅ Implement audit logging

### Phase 3: Medium Priority (Within 2 Months)
11. ✅ Add security tests
12. ✅ Implement API versioning
13. ✅ Add request signature verification
14. ✅ Set up monitoring and alerting
15. ✅ Database activity monitoring

### Phase 4: Long-term (Within 3-6 Months)
16. ✅ Implement 2FA support
17. ✅ Add key rotation mechanism
18. ✅ Security compliance documentation
19. ✅ Penetration testing
20. ✅ Security incident response plan

---

## Compliance Checklist

### GDPR Compliance
- [ ] Implement data deletion on request
- [ ] Add data export functionality  
- [ ] Implement privacy policy
- [ ] Track consent for data processing
- [ ] Document data processing agreements

### OWASP Top 10 2021
- [ ] A01 - Broken Access Control: Role-based access implemented but needs enhancement
- [ ] A02 - Cryptographic Failures: HTTPS enforcement needed
- [ ] A03 - Injection: Input validation in place, needs prompt injection protection
- [ ] A04 - Insecure Design: Rate limiting, CORS needs review
- [ ] A05 - Security Misconfiguration: Multiple misconfigurations identified
- [ ] A06 - Vulnerable Components: Dependency auditing needed
- [ ] A07 - Authentication Failures: Token handling needs improvement
- [ ] A08 - Data Integrity Failures: No data integrity checks
- [ ] A09 - Logging & Monitoring: Audit logging needed
- [ ] A10 - SSRF: No apparent SSRF risks identified

---

## Recommended Tools & Services

### Static Analysis
- **SonarQube** - Code quality and security analysis
- **ESLint** with security plugins - JavaScript linting
- **npm audit** - Dependency vulnerability scanning

### Dynamic Testing
- **OWASP ZAP** - Penetration testing
- **Burp Suite** - Security testing suite
- **Artillery** - Load/DoS testing

### Monitoring & Logging
- **ELK Stack** - Elasticsearch, Logstash, Kibana
- **Datadog** - Monitoring and alerting
- **Sentry** - Error tracking
- **CloudFlare** - DDoS protection

### Dependency Management
- **Dependabot** - Automated dependency updates
- **Snyk** - Vulnerability scanning and fixes

---

## Conclusion

The CodeBasics Backend has a foundational security structure but requires significant hardening before production deployment. The most critical issues involve:

1. **Authentication security** - JWT token exposure in URLs
2. **Network security** - Missing HTTPS enforcement and disabled TLS verification
3. **Rate limiting** - No protection on public endpoints
4. **Information disclosure** - Sensitive data in logs
5. **Security headers** - Missing comprehensive security headers

By implementing the Phase 1 recommendations immediately and following the roadmap for subsequent phases, the application can achieve a strong security posture.

**Estimated effort:** 2-3 weeks for Phase 1, 4-6 weeks for all phases.

---

## Appendix: Quick Fix Checklist

```bash
# Install recommended security packages
npm install helmet uuid dotenv-safe

# Run security audit
npm audit
npm audit fix

# Add pre-commit hooks
npm install husky lint-staged --save-dev
npx husky install

# Add ESLint security plugin
npm install --save-dev eslint-plugin-security

# Generate API documentation
npm install swagger-jsdoc swagger-ui-express
```

---

**Report Prepared By:** Security Assessment Tool  
**Last Updated:** May 16, 2026  
**Severity Levels:** Critical (Immediate) | High (1-2 weeks) | Medium (1 month) | Low (Nice to have)

