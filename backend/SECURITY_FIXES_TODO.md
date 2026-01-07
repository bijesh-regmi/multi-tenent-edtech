# Security Fixes TODO List

## CRITICAL PRIORITY 🔴

### 1. Fix Mass Assignment Vulnerability (Privilege Escalation)
**File:** `src/controllers/global/auth.controller.js`

**Problem:** The controller accepts ALL fields from req.body, allowing attackers to inject privileged fields like `userRole`, `isAdmin`, etc.

**Steps:**
- [ ] In the `signup` function (line 8), replace destructuring with explicit field extraction
- [ ] Change from: `const { email, username, password } = req.body;`
- [ ] Change to: Extract ONLY these three fields explicitly
- [ ] Add a comment warning about not adding extra fields without sanitization

**Code location:** Line 8 in `auth.controller.js`

**Test:** Try sending extra fields like `userRole: "super-admin"` - should be ignored

---

### 2. Implement Rate Limiting
**Files:** `package.json`, `src/app.js`, `src/routes/global/auth.routes.js`

**Problem:** No rate limiting allows unlimited signup attempts, enabling account enumeration and DoS attacks.

**Steps:**
- [ ] Install rate limiting package: `npm install express-rate-limit`
- [ ] Create new file: `src/middlewares/rateLimiter.js`
- [ ] Create a rate limiter for auth routes (e.g., 5 requests per 15 minutes per IP)
- [ ] Import rate limiter in `auth.routes.js`
- [ ] Apply rate limiter to `/signup` route BEFORE the signup controller

**Recommended config:**
```
windowMs: 15 * 60 * 1000 (15 minutes)
max: 5 (5 requests per window)
message: "Too many signup attempts, please try again later"
```

**Test:** Send 6 requests rapidly - 6th should be rejected with 429 status

---

### 3. Fix Information Leakage in Error Responses
**File:** `src/middlewares/globalErrorHandler.js`

**Problem:** Sequelize validation errors expose full instance data including plaintext passwords, UUIDs, timestamps, and validation rules.

**Steps:**
- [ ] Add check for Sequelize errors (before line 4)
- [ ] Check if error name is `SequelizeValidationError` or `SequelizeUniqueConstraintError`
- [ ] For Sequelize errors, sanitize the response:
  - Extract only the validation message
  - DO NOT include `error.errors` array (contains instance data)
  - Return generic message without internal details
- [ ] For production, add environment check to hide stack traces

**Code structure:**
```
1. Check if SequelizeValidationError → sanitize
2. Check if SequelizeDatabaseError → sanitize
3. Check if ApiError → return as is (already safe)
4. Fallback for unknown errors → sanitize
```

**Test:** Send invalid data - response should NOT contain `instance`, `password`, or `validatorArgs`

---

## HIGH PRIORITY 🟡

### 4. Add Environment-Based Error Handling
**Files:** `src/middlewares/globalErrorHandler.js`, `.env`

**Problem:** Stack traces and detailed errors expose internal structure in production.

**Steps:**
- [ ] Check if `NODE_ENV` environment variable exists in `.env` file (add if missing)
- [ ] In `globalErrorHandler.js`, check `process.env.NODE_ENV`
- [ ] If `NODE_ENV === 'production'`:
  - Remove stack traces from all error responses
  - Remove error details
  - Return only generic messages
- [ ] If `NODE_ENV === 'development'`:
  - Keep detailed errors for debugging
  - Add clear comments about this distinction

**Test:** Set NODE_ENV=production and trigger error - should get generic message only

---

### 5. Standardize Error Response Format
**File:** `src/middlewares/globalErrorHandler.js`

**Problem:** Some errors return HTML, others return JSON with different structures.

**Steps:**
- [ ] Ensure ALL error responses return JSON (never HTML)
- [ ] Standardize format to match ApiResponse structure:
  ```
  {
    success: false,
    message: "error message",
    statusCode: 400,
    error: null (or sanitized error in dev mode)
  }
  ```
- [ ] Add `res.set('Content-Type', 'application/json')` to ensure JSON response

**Test:** Trigger various errors - all should return consistent JSON format

---

### 6. Add Input Sanitization for Special Characters
**File:** `src/models/user.model.js`

**Problem:** Username accepts null bytes, emojis, and special characters that may cause issues.

**Steps:**
- [ ] In the User model, add custom validation for `username` field (after line 21)
- [ ] Add validator function to check for:
  - Alphanumeric characters only (a-z, A-Z, 0-9)
  - Optional: underscore and hyphen
  - No null bytes (\x00)
  - No emojis or special Unicode
- [ ] Add error message: "Username must contain only letters, numbers, underscore, and hyphen"

**Regex suggestion:** `/^[a-zA-Z0-9_-]+$/`

**Test:** Try usernames with emojis, null bytes, special chars - should be rejected

---

### 7. Fix Typo in Error Message
**File:** `src/controllers/global/auth.controller.js`

**Problem:** Line 20 has typo: "User alredy exists"

**Steps:**
- [ ] Change line 20 from: `"User alredy exists."`
- [ ] Change to: `"User already exists."`

**Test:** Try duplicate signup - error message should be spelled correctly

---

## MEDIUM PRIORITY 🟢

### 8. Add Request Body Size Limit
**File:** `src/app.js`

**Problem:** No limit on request body size allows DoS attacks with huge payloads.

**Steps:**
- [ ] In `app.js` line 6, add limit option to express.json()
- [ ] Change to: `app.use(express.json({ limit: '10kb' }))`
- [ ] Also add to line 7 for urlencoded: `app.use(express.urlencoded({ extended: true, limit: '10kb' }))`

**Test:** Send request with >10kb payload - should be rejected

---

### 9. Add Helmet for Security Headers
**Files:** `package.json`, `src/app.js`

**Problem:** Missing security headers make app vulnerable to various attacks.

**Steps:**
- [ ] Install helmet: `npm install helmet`
- [ ] Import helmet in `src/app.js`: `import helmet from 'helmet'`
- [ ] Add BEFORE other middleware (around line 6): `app.use(helmet())`

**Test:** Check response headers - should include X-Content-Type-Options, X-Frame-Options, etc.

---

### 10. Add CORS Configuration
**Files:** `package.json`, `src/app.js`

**Problem:** No CORS configuration could allow any origin to make requests.

**Steps:**
- [ ] Install cors: `npm install cors`
- [ ] Import cors in `src/app.js`: `import cors from 'cors'`
- [ ] Configure cors with whitelist of allowed origins
- [ ] Add after express.json() (around line 7)

**Example config:**
```javascript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}
app.use(cors(corsOptions))
```

**Test:** Make request from unauthorized origin - should be blocked

---

### 11. Add Email Verification (Future Enhancement)
**Files:** Create new email service, update signup controller

**Problem:** No email verification allows spam accounts.

**Steps:**
- [ ] Research email service (nodemailer, SendGrid, etc.)
- [ ] Add `emailVerified` boolean field to User model
- [ ] Add `verificationToken` field to User model
- [ ] Generate token on signup
- [ ] Send verification email
- [ ] Create verification endpoint
- [ ] Prevent login until email verified

**Note:** This is a larger feature - consider as Phase 2

---

## TESTING CHECKLIST

After implementing fixes, test:

- [ ] **Mass Assignment:** Send `{username, email, password, userRole: "super-admin"}` → userRole should be ignored
- [ ] **Rate Limiting:** Send 6 signup requests rapidly → 6th should fail with 429
- [ ] **Info Leak:** Send invalid data → response should NOT contain password, instance, validatorArgs
- [ ] **Sanitization:** Send username with emoji/null-byte → should be rejected
- [ ] **Error Format:** Trigger various errors → all should return JSON (not HTML)
- [ ] **Request Size:** Send >10kb payload → should be rejected
- [ ] **Security Headers:** Check response headers → should include helmet headers
- [ ] **Duplicate User:** Try same username/email → proper error message (no typo)

---

## ORDER OF IMPLEMENTATION

**Phase 1 (Do First):**
1. Fix Mass Assignment (#1) - 10 minutes
2. Fix Information Leakage (#3) - 20 minutes
3. Fix Typo (#7) - 1 minute

**Phase 2 (Do Second):**
4. Add Rate Limiting (#2) - 15 minutes
5. Environment-Based Errors (#4) - 10 minutes
6. Standardize Error Format (#5) - 15 minutes

**Phase 3 (Do Third):**
7. Input Sanitization (#6) - 15 minutes
8. Request Body Size Limit (#8) - 5 minutes
9. Add Helmet (#9) - 10 minutes
10. Add CORS (#10) - 10 minutes

**Phase 4 (Optional/Future):**
11. Email Verification (#11) - 2-3 hours

**Total estimated time for Phases 1-3:** ~2 hours

---

## NOTES

- Always test each fix individually before moving to the next
- Keep a backup of files before making changes
- Consider creating a git branch for these security fixes
- Update API documentation after implementing changes
- Run existing tests (if any) after each change to ensure no breaking changes
