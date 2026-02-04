# Hardcoded Values Removal - Migration Guide

## Overview

This update removes all hardcoded accommodation, pricing, and event data from the codebase and replaces them with environment variables or API-driven values. This makes the application configurable per environment and event without code changes.

---

## Changes Made

### 1. Hostel Availability Count

**Before:**
```tsx
// Sidebar.tsx
hostelSpacesLeft = 850
```

**After:**
```tsx
hostelSpacesLeft?: number  // No default
// Renders "Limited" if not provided
```

**Migration:**
- The orchestrator should fetch this from the accommodation availability API and pass it down:
  ```tsx
  const availabilityData = await getAccommodations({ eventId, type: 'HOSTEL' });
  const hostelSpaces = availabilityData.metadata?.totalAvailable;
  ```
- If not fetched, UI will display "Limited Hostel Spaces left" instead of a number

---

### 2. Dependent Registration Price

**Before:**
```tsx
// DependentsModal.tsx, DependentsPaymentModal.tsx
const totalAmount = selectedCount * 7000;
```

**After:**
```tsx
const DEPENDENT_PRICE = Number(process.env.NEXT_PUBLIC_DEPENDENT_PRICE) || 7000;
const totalAmount = selectedCount * DEPENDENT_PRICE;
```

**Migration:**
Add to `.env.local`:
```bash
NEXT_PUBLIC_DEPENDENT_PRICE=7000
```

**Default:** ₦7,000 (if env var not set)

---

### 3. Event Start Date (Countdown Timer)

**Before:**
```tsx
// Dashboard.tsx, Sidebar.tsx
const eventDate = new Date('2026-04-30T00:00:00').getTime();
```

**After:**
```tsx
const eventDate = new Date(
  process.env.NEXT_PUBLIC_EVENT_START_DATE || '2026-04-30T00:00:00'
).getTime();
```

**Migration:**
Add to `.env.local`:
```bash
NEXT_PUBLIC_EVENT_START_DATE=2026-04-30T00:00:00
```

**Default:** April 30, 2026 at midnight (if env var not set)

---

### 4. Event Details Banner (Dashboard)

**Before:**
```tsx
// Dashboard.tsx
<p>Apr 30th - May 3rd, 2026 · Dansol High School, Agidingbi, Lagos State</p>
```

**After:**
```tsx
<p>
  {process.env.NEXT_PUBLIC_EVENT_DETAILS || 
   'Apr 30th - May 3rd, 2026 · Dansol High School, Agidingbi, Lagos State'}
</p>
```

**Migration:**
Add to `.env.local`:
```bash
NEXT_PUBLIC_EVENT_DETAILS="Apr 30th - May 3rd, 2026 · Dansol High School, Agidingbi, Lagos State"
```

**Default:** Current WOTH 2026 text (if env var not set)

---

### 5. Event Address (Registration Location)

**Before:**
```tsx
// EventRegistration.tsx
<p>123 Conference Center Drive, Downtown District, City 12345</p>
```

**After:**
```tsx
<p>
  {process.env.NEXT_PUBLIC_EVENT_ADDRESS || 
   'Dansol High School, Agidingbi, Lagos State'}
</p>
```

**Migration:**
Add to `.env.local`:
```bash
NEXT_PUBLIC_EVENT_ADDRESS="Dansol High School, Agidingbi, Lagos State"
```

**Default:** Dansol High School address (if env var not set)

---

## Quick Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit values as needed:**
   ```bash
   # .env.local
   NEXT_PUBLIC_EVENT_START_DATE=2027-05-01T00:00:00
   NEXT_PUBLIC_EVENT_DETAILS="May 1-4, 2027 · New Venue, Lagos"
   NEXT_PUBLIC_EVENT_ADDRESS="New Venue, Lagos State"
   NEXT_PUBLIC_DEPENDENT_PRICE=8000
   ```

3. **Restart the dev server:**
   ```bash
   npm run dev
   ```

---

## Production Deployment

### Vercel / Netlify
Add environment variables in your project settings dashboard.

### Docker
Pass via `docker run -e` or docker-compose `environment:` block.

### Traditional Hosting
Set in your server's environment or `.env.production` file.

---

## Backward Compatibility

All changes include sensible defaults, so **the application works without any `.env.local` configuration**. It will use the original hardcoded values as defaults.

To customize for a new event, simply set the environment variables — no code changes required.

---

## Future Improvements

Consider these enhancements for full dynamic configuration:

1. **Fetch event details from API:**
   - Add `venue`, `address`, `startDate`, `endDate` to the backend Event schema
   - Pull from `selectedEvent` object instead of env vars

2. **Fetch pricing from API:**
   - Add a `/pricing/dependents` endpoint
   - Display real-time pricing

3. **Real-time availability:**
   - Fetch hostel count from `/accommodation/availability` on page load
   - Update countdown to use event's actual `startDate` field

---

## Support

If you encounter issues after this update, verify:
1. ✅ `.env.local` exists (or production env vars are set)
2. ✅ Dev server was restarted after adding env vars
3. ✅ `NEXT_PUBLIC_` prefix is used (required for client-side variables)
4. ✅ Values are in the correct format (dates in ISO 8601, prices as numbers)
