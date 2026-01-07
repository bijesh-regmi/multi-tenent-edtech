# Security Vulnerability Fixes - TODO

> ⚠️ **IMPORTANT**: This document contains security fixes that must be implemented manually.
> **Created**: 2026-01-07
> **Priority**: CRITICAL - Address these issues before production deployment

---

## 🔴 CRITICAL VULNERABILITIES

### 1. Mass Assignment / Privilege Escalation

**Vulnerability Description:**
The endpoint accepts ANY extra fields in the request body, allowing attackers to inject privileged fields like `userRole`, `isAdmin`, `refreshToken`, etc.

**Root Cause Location:**
- **File**: `src/controllers/global/auth.controller.js`
- **Lines**: 29-33

```javascript
// VULNERABLE CODE:
const newUser = await User.create({
    username,
    password,
    email,
});
```

**The Problem:**
While the code destructures only `email`, `username`, and `password`, if any other fields from `req.body` leak through (e.g., via spread operator in future changes, or if someone modifies this code), they would be written to the database. Additionally, Sequelize by default accepts all fields matching the model schema.

**Fix Required:**

- [ ] **Task 1.1**: Create an input whitelist/sanitization middleware
  - Location: Create new file `src/middlewares/inputSanitizer.js`
  - Purpose: Explicitly define allowed fields per route and strip everything else
  
- [ ] **Task 1.2**: Modify the signup controller to explicitly use only whitelisted fields
  - Location: `src/controllers/global/auth.controller.js`
  - Ensure `User.create()` only receives explicitly validated fields
  - Never spread `req.body` directly into database operations

- [ ] **Task 1.3**: Add model-level protection in Sequelize
  - Location: `src/models/user.model.js`
  - Add `fields` option to limit which fields can be set during create/update
  - Example: Use `User.create(data, { fields: ['username', 'password', 'email'] })`

- [ ] **Task 1.4**: Mark sensitive fields as non-mass-assignable
  - Location: `src/models/user.model.js`
  - For `userRole`, `refreshToken`, and any other sensitive fields, ensure they cannot be set via user input

---

### 2. No Rate Limiting

**Vulnerability Description:**
No throttling or rate limiting detected. Attackers can send unlimited requests rapidly, enabling brute force attacks, account enumeration, and DoS attacks.

**Root Cause Location:**
- **File**: `src/app.js`
- No rate limiting middleware is configured

**The Problem:**
The Express app has no rate limiting middleware configured. This allows:
- Brute force password attacks
- Account enumeration via signup/login endpoints
- Denial of Service (DoS) attacks

**Fix Required:**

- [ ] **Task 2.1**: Install rate limiting package
  - Run: `npm install express-rate-limit`

- [ ] **Task 2.2**: Create rate limiting middleware
  - Location: Create new file `src/middlewares/rateLimiter.js`
  - Configure different limits for:
    - General API requests (e.g., 100 requests per 15 minutes)
    - Authentication endpoints (e.g., 5 requests per minute for login/signup)
    - Password reset (e.g., 3 requests per hour)

- [ ] **Task 2.3**: Apply rate limiter to app.js
  - Location: `src/app.js`
  - Apply general rate limiter globally
  - Apply stricter auth rate limiter to `/api/v1/user` routes

- [ ] **Task 2.4**: Add IP-based and user-based rate limiting
  - Consider using Redis for distributed rate limiting in production
  - Track failed login attempts per account

---

## 🟡 MEDIUM VULNERABILITIES

### 3. Weak Input Sanitization

**Vulnerability Description:**
- Accepts null bytes in username (`nullbyte\u0000test`)
- Accepts Unicode/emoji characters (`unicode🔥test`)
- Could cause issues with logging, downstream systems, or database queries

**Root Cause Location:**
- **File**: `src/models/user.model.js` (Lines 15-23)
- **File**: `src/controllers/global/auth.controller.js` (Lines 11-18)

```javascript
// Current validation is minimal:
username: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    validate: {
        len: [2, 16],  // Only checks length, not content
    },
},
```

**The Problem:**
- Username validation only checks length (2-16 characters)
- No regex pattern to enforce allowed characters
- No sanitization of null bytes or control characters
- No validation against Unicode injection

**Fix Required:**

- [ ] **Task 3.1**: Add regex validation to username field in model
  - Location: `src/models/user.model.js`
  - Add a custom validator that:
    - Only allows alphanumeric characters, underscores, and hyphens
    - Rejects null bytes (`\u0000`) and other control characters
    - Rejects or sanitizes potentially dangerous Unicode

- [ ] **Task 3.2**: Create input sanitization utility
  - Location: Create new file `src/utils/inputSanitizer.js`
  - Functions to:
    - Strip null bytes from strings
    - Normalize Unicode (NFC normalization)
    - Remove control characters
    - Validate against injection patterns

- [ ] **Task 3.3**: Apply sanitization in controller before database operations
  - Location: `src/controllers/global/auth.controller.js`
  - Sanitize `username`, `email`, and other user inputs before validation

- [ ] **Task 3.4**: Add email validation enhancement
  - Location: `src/models/user.model.js`
  - Current `isEmail` validator may not catch all edge cases
  - Consider using a more robust email validation library or regex

---

### 4. Error Information Leakage

**Vulnerability Description:**
- Validation errors expose full database instance data in response
- Reveals internal structure, field names, and UUIDs
- Aids attackers in understanding the system

**Root Cause Location:**
- **File**: `src/middlewares/globalErrorHandler.js`
- **File**: `src/utils/ApiError.js`

```javascript
// globalErrorHandler.js exposes raw errors:
res.status(500).json({
    success: false,
    message: err.message || "Something went wrong...",
    error: err.errors ?? null,  // <-- This exposes internal error details!
});
```

**The Problem:**
- Sequelize validation errors contain full model instance data
- Error responses include UUIDs, field names, and internal structure
- Stack traces may be exposed in production
- `err.errors` is passed directly to client without sanitization

**Fix Required:**

- [ ] **Task 4.1**: Create error sanitization utility
  - Location: Create new file `src/utils/errorSanitizer.js`
  - Function to extract only safe, user-facing error messages
  - Strip internal details, UUIDs, stack traces

- [ ] **Task 4.2**: Update globalErrorHandler to sanitize errors
  - Location: `src/middlewares/globalErrorHandler.js`
  - In production:
    - Never expose `err.errors` directly
    - Never expose stack traces
    - Log full errors server-side, return generic messages to client
  - Add environment check (`NODE_ENV`)

- [ ] **Task 4.3**: Handle Sequelize validation errors specifically
  - Location: `src/middlewares/globalErrorHandler.js`
  - Check if error is `SequelizeValidationError` or `SequelizeUniqueConstraintError`
  - Extract only field names and validation messages, not full instance data

- [ ] **Task 4.4**: Create production vs development error modes
  - Add `NODE_ENV` to `.env` file
  - In development: show full errors for debugging
  - In production: show sanitized, user-friendly messages only

---

### 5. Inconsistent Error Format

**Vulnerability Description:**
- Success responses: JSON
- Some errors: HTML
- Other errors: JSON with full stack traces
- Causes client parsing issues and information leakage

**Root Cause Location:**
- **File**: `src/middlewares/globalErrorHandler.js`
- **File**: `src/app.js` (missing 404 handler)

**The Problem:**
- No catch-all 404 handler (Express default may return HTML)
- Unhandled promise rejections may not go through error handler
- Sequelize/database errors may have different formats
- No standardized error response structure enforced

**Fix Required:**

- [ ] **Task 5.1**: Add 404 (Not Found) handler
  - Location: `src/app.js`
  - Add after all routes, before `globalErrorHandler`
  - Must return JSON format consistent with other errors

- [ ] **Task 5.2**: Ensure all errors pass through globalErrorHandler
  - Location: `src/app.js`
  - Verify middleware order is correct
  - Add catch for unhandled promise rejections

- [ ] **Task 5.3**: Standardize error response structure
  - Location: `src/utils/ApiError.js` and `src/middlewares/globalErrorHandler.js`
  - Define a single error response schema:
    ```json
    {
      "success": false,
      "message": "User-friendly error message",
      "errors": [], // Optional: array of field-specific errors
      "code": "ERROR_CODE" // Optional: machine-readable error code
    }
    ```

- [ ] **Task 5.4**: Handle different error types consistently
  - Location: `src/middlewares/globalErrorHandler.js`
  - Add specific handlers for:
    - `SequelizeValidationError`
    - `SequelizeUniqueConstraintError`
    - `JsonWebTokenError`
    - `SyntaxError` (JSON parsing errors)
    - Generic `Error`

- [ ] **Task 5.5**: Set Content-Type header explicitly
  - Location: `src/middlewares/globalErrorHandler.js`
  - Always set `res.setHeader('Content-Type', 'application/json')` before sending response

---

## 📋 Additional Security Recommendations

### 6. Authentication Middleware is Empty

**Location**: `src/middlewares/auth.middleware.js`

```javascript
// Currently empty - no authentication!
const authenticate = async (req, res, next) => {};
export default authenticate;
```

- [ ] **Task 6.1**: Implement JWT authentication middleware
- [ ] **Task 6.2**: Add token validation and user attachment to request
- [ ] **Task 6.3**: Create role-based access control (RBAC) middleware

### 7. Missing Security Headers

**Location**: `src/app.js`

- [ ] **Task 7.1**: Install and configure Helmet.js for security headers
  - Run: `npm install helmet`
  - Add to app.js: `app.use(helmet())`

- [ ] **Task 7.2**: Configure CORS properly
  - Run: `npm install cors`
  - Whitelist only allowed origins

### 8. Missing Request Validation Middleware

- [ ] **Task 8.1**: Consider using validation library
  - Options: `express-validator`, `joi`, or `zod`
  - Create schema-based validation for all endpoints

---

## 🔧 Implementation Priority Order

1. **IMMEDIATE** (Do First):
   - Task 1.1-1.4 (Mass Assignment)
   - Task 2.1-2.3 (Rate Limiting)
   - Task 4.1-4.4 (Error Leakage)

2. **HIGH** (Do This Week):
   - Task 3.1-3.4 (Input Sanitization)
   - Task 5.1-5.5 (Error Format)
   - Task 6.1-6.3 (Authentication)

3. **MEDIUM** (Do Before Production):
   - Task 7.1-7.2 (Security Headers)
   - Task 8.1 (Request Validation)
   - Task 2.4 (Advanced Rate Limiting)

---

## 📚 References

- [OWASP Mass Assignment Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html)
- [Express Rate Limit](https://www.npmjs.com/package/express-rate-limit)
- [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [Sequelize Security Best Practices](https://sequelize.org/docs/v6/other-topics/securing-sequelize/)
- [Helmet.js](https://helmetjs.github.io/)

---

> ✅ **Completion Checklist**: Mark tasks as complete by changing `[ ]` to `[x]` as you implement each fix.
