# Enhanced Debug Logs for Dashboard Loading Issue

## Issue Description
When navigating from report page back to dashboard using "Back to Dashboard" button, the reports fail to load and timeout occurs.

## Logs Added

### 1. Supabase Client Creation (`src/lib/supabase/client.ts`)
- Added call stack logging to track where client is being created from
- Shows which component/function triggered client creation

### 2. SupabaseProvider Component (`src/contexts/SupabaseContext.tsx`)
- Added logs for component rendering
- Added logs for useMemo callback execution
- Helps track if provider is re-rendering unnecessarily

### 3. UserContext (`src/contexts/UserContext.tsx`)
- Added client health check before calling `getSession()`
- Added query building logs for profile fetch
- Helps identify if Supabase client methods are available

### 4. Dashboard Page (`src/app/dashboard/page.tsx`)
- Added client health check before fetching reports
- Added query building logs (separate from execution)
- Shows when query is built vs when it's executed
- Helps identify if query building or execution is hanging

### 5. Report Page Back Button (`src/app/report/page.tsx`)
- Added detailed logs for navigation
- Shows current URL and target URL
- Logs before and after `window.location.href` assignment

## Expected Log Flow (Normal Case)

When navigating from Report → Dashboard:

1. **Report Page**:
   ```
   🔙 Report: Back button clicked
   🔙 Report: Current URL: https://xxx/report?id=xxx
   🔙 Report: Target URL: https://xxx/dashboard
   🔙 Report: Navigating back to dashboard (hard refresh)
   🔙 Report: About to set window.location.href...
   ```

2. **Page Reload Starts**:
   ```
   🏗️ SupabaseProvider: Component rendering...
   🏗️ SupabaseProvider: useMemo callback executing (creating client)...
   🏗️ Supabase: Creating new client instance OR Using existing client instance
   🏗️ Supabase: Called from: [stack trace]
   ✅ SupabaseProvider: Client created and memoized
   🏗️ SupabaseProvider: Providing context to children
   ```

3. **UserContext Initialization**:
   ```
   🔍 UserContext: Initializing...
   📡 UserContext: Fetching user...
   ⏱️ UserContext: Calling supabase.auth.getSession()...
   ⏱️ UserContext: Supabase client check: {hasSupabase: true, hasAuth: true, hasGetSession: true}
   📬 UserContext: Session fetch completed in XXms
   👤 UserContext: User found, fetching profile for: [user-id]
   📊 UserContext: Building profile query...
   📊 UserContext: Executing profile query...
   📬 UserContext: Profile fetch completed in XXms
   ✅ UserContext: Loading complete
   ```

4. **Dashboard Loading Reports**:
   ```
   🔍 Dashboard useEffect triggered: {authLoading: false, hasUser: true, userId: xxx}
   👤 Dashboard: User found, starting to fetch reports for user: xxx
   📡 Dashboard: Starting to fetch reports for user: xxx
   📡 Dashboard: Supabase client check: {hasSupabase: true, hasFrom: true}
   📊 Dashboard: About to execute query...
   📊 Dashboard: Building query chain...
   📊 Dashboard: Query built, now executing...
   ✅ Dashboard: Query execution returned
   📬 Dashboard: Query completed in XXms
   ✅ Dashboard: Fetched X reports
   ✅ Dashboard: Fetch complete, clearing timeout
   ```

## What to Look For in Logs

### Issue 1: Query Never Returns
If you see:
```
📊 Dashboard: Query built, now executing...
⚠️ Reports loading timeout (after 10s)
```
**Without** seeing "Query execution returned", this means the Supabase query is hanging.

### Issue 2: Client Methods Not Available
If you see:
```
📡 Dashboard: Supabase client check: {hasSupabase: true, hasFrom: false}
```
This means the Supabase client is not properly initialized.

### Issue 3: Multiple Client Creations
If you see multiple:
```
🏗️ Supabase: Creating new client instance
```
When you should see:
```
🔄 Supabase: Using existing client instance
```
This means the singleton is not working.

### Issue 4: Provider Re-rendering
If you see many:
```
🏗️ SupabaseProvider: Component rendering...
```
This means the provider is re-rendering too often.

## Next Steps

1. **Deploy these changes** to Vercel
2. **Test the issue** by:
   - Navigate from home → dashboard (should work)
   - Click on a report (should work)
   - Click "Back to Dashboard" (currently broken)
3. **Check the browser console** and compare with the expected flow above
4. **Identify where the logs stop** - that's where the issue is
5. **Share the complete log output** with the exact point where it hangs

## Hypothesis

Based on the original logs showing timeout, I suspect one of these:

1. **Network Issue**: Supabase query hangs due to network/CORS on hard refresh
2. **Client State Issue**: Hard refresh causes client to be in a bad state
3. **Race Condition**: Something about the hard refresh timing causes a race condition

The enhanced logs will help us pinpoint exactly which one it is.

