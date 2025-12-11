# Critical Fixes Checklist
## Immediate Action Items (Week 1)

### 🔴 CRITICAL SECURITY FIXES

- [ ] **Fix Race Condition in Trip Assignment**
  - File: `src/app/api/trips/assign/route.ts`
  - Wrap availability checks in transaction with row locking
  - Prevent double-booking of drivers/vehicles

- [ ] **Add Input Sanitization**
  - Install: `zod`, `dompurify`, `@types/dompurify`
  - Create validation schemas for all inputs
  - Sanitize HTML in stored data (purpose, locations, descriptions)

- [ ] **Fix JWT Secret Validation**
  - File: `src/lib/auth.ts:5`
  - Validate JWT_SECRET is at least 32 characters
  - Throw error if missing or weak

- [ ] **Prevent Self-Approval of Trips**
  - File: `src/app/api/trips/approve/route.ts`
  - Add check: `if (trip.requesterId === session.sub) throw error`

- [ ] **Add RBAC Middleware**
  - Create: `src/middleware/rbac.ts`
  - Replace scattered role checks with middleware

- [ ] **Add Security Headers**
  - File: `next.config.ts`
  - Add X-Frame-Options, CSP, etc.

### 🔴 CRITICAL DATA CONSISTENCY FIXES

- [ ] **Add Transactions to Multi-Step Operations**
  - `src/app/api/trips/assign/route.ts` - Wrap trip update + notification + email
  - `src/app/api/trips/approve/route.ts` - Wrap status update + notification
  - `src/app/api/tada/create/route.ts` - Wrap TADA creation + notifications
  - `src/app/api/maintenance/approve/route.ts` - Wrap status update + notifications

- [ ] **Fix Status Transition Logic**
  - File: `src/app/api/trips/approve/route.ts:61-62`
  - Remove inconsistent "Approved" status, use "ManagerApproved" always
  - Create state machine constants file

- [ ] **Add Database Indexes**
  - File: `prisma/schema.prisma`
  - Add indexes: `Trip.status`, `Trip.requesterId`, `Trip.createdAt`
  - Add indexes: `Notification.userId`, `Notification.read`

- [ ] **Add Unique Constraints**
  - File: `prisma/schema.prisma`
  - `EntitledVehicle.vehicleNumber` should be unique
  - `TadaRequest.tripId` should be unique (one TADA per trip)

### 🔴 CRITICAL ERROR HANDLING FIXES

- [ ] **Create Global Error Handler**
  - Create: `src/middleware/error-handler.ts`
  - Standardize error responses
  - Log errors with context

- [ ] **Replace Console.log with Structured Logging**
  - Install: `winston` or `pino`
  - Create: `src/lib/logger.ts`
  - Replace all `console.log/error` calls

- [ ] **Fix Generic Error Messages**
  - Return specific error messages to users
  - Log detailed errors server-side
  - Include error IDs for support

### 🟡 HIGH PRIORITY FIXES

- [ ] **Add Pagination to All List Endpoints**
  - `GET /api/trips/my`
  - `GET /api/trips/pending`
  - `GET /api/trips/approved`
  - `GET /api/notifications`

- [ ] **Add Rate Limiting**
  - Install: `@upstash/ratelimit` or similar
  - Add to login endpoint (5 attempts per 15 min)
  - Add to admin endpoints

- [ ] **Fix Status Value Inconsistencies**
  - Create constants file: `src/lib/constants.ts`
  - Define all status enums
  - Replace magic strings

- [ ] **Add Validation for Business Rules**
  - Prevent trips in the past
  - Validate TADA amount > 0
  - Validate end time > start time (in schema if possible)

- [ ] **Add Active Status Validation**
  - Check driver/vehicle are active before assignment
  - Check user is active before operations

---

## Quick Wins (Can be done in 1-2 days)

1. **Add Database Indexes** (30 min)
   - Run migration after adding to schema

2. **Fix JWT Secret Validation** (15 min)
   - Add validation in `src/lib/auth.ts`

3. **Prevent Self-Approval** (10 min)
   - Add one-line check in approve route

4. **Add Security Headers** (20 min)
   - Update `next.config.ts`

5. **Create Constants File** (1 hour)
   - Extract all magic strings to constants

6. **Add Input Length Limits** (1 hour)
   - Add max length validation to all string inputs

---

## Testing Checklist

After implementing fixes, test:

- [ ] Two users cannot book same driver/vehicle at same time
- [ ] Manager cannot approve own trip
- [ ] Invalid status transitions are rejected
- [ ] XSS attempts are sanitized
- [ ] Rate limiting works on login
- [ ] Pagination works on all list endpoints
- [ ] Transactions rollback on failure
- [ ] Errors are logged with context
- [ ] Security headers are present in responses

---

## Files to Create/Modify

### New Files:
- `src/middleware/rbac.ts`
- `src/middleware/error-handler.ts`
- `src/middleware/validate.ts`
- `src/lib/logger.ts`
- `src/lib/constants.ts`
- `src/validators/trip.validator.ts`
- `src/validators/tada.validator.ts`
- `src/validators/user.validator.ts`

### Files to Modify:
- `src/lib/auth.ts` - JWT secret validation
- `src/app/api/trips/assign/route.ts` - Add transaction, fix race condition
- `src/app/api/trips/approve/route.ts` - Add transaction, prevent self-approval
- `src/app/api/tada/create/route.ts` - Add transaction
- `src/app/api/maintenance/approve/route.ts` - Add transaction
- `prisma/schema.prisma` - Add indexes, unique constraints
- `next.config.ts` - Add security headers
- All route files - Add validation, improve error handling

---

**Estimated Time for Critical Fixes: 2-3 weeks**




