# Offline User Cleanup - Database Migration Instructions

## 🎯 What This Fixes

**Problem:** Users who disconnect ungracefully (crash, network loss, force close) remain marked as `is_online = true` forever in the database, even though they're no longer connected.

**Solution:** Automatically mark users as offline if their `last_seen` timestamp is older than 2 minutes.

---

## 📋 What Was Changed

### 1. **New Migration File**
- **File:** `supabase/migrations/011_cleanup_offline_users.sql`
- **What it does:** Creates a database function `cleanup_offline_users()` that marks stale users as offline

### 2. **Updated Cron Configuration**
- **File:** `supabase/setup-pg-cron.sql`
- **What it does:** Schedules the cleanup function to run every minute via pg_cron

### 3. **Updated TypeScript Types**
- **File:** `src/lib/types/database.types.ts`
- **What it does:** Adds type definition for the new `cleanup_offline_users` function

---

## 🚀 How to Apply (Database Setup)

### Step 1: Run the Migration

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/011_cleanup_offline_users.sql`
4. Click **Run**

You should see: `Success. No rows returned`

### Step 2: Set Up the Cron Job

1. In the same **SQL Editor**
2. Run this command to schedule the cleanup:

```sql
SELECT cron.schedule(
  'cleanup-offline-users',
  '* * * * *',                      -- Run every minute
  'SELECT cleanup_offline_users();'
);
```

3. Verify it was created:

```sql
SELECT * FROM cron.job WHERE jobname = 'cleanup-offline-users';
```

You should see a row with `jobname: cleanup-offline-users` and `schedule: * * * * *`

### Step 3: Test It Works

1. Run the function manually to test:

```sql
SELECT cleanup_offline_users();
```

2. Check if any users were marked offline:

```sql
SELECT id, nickname, is_online, last_seen
FROM users
WHERE last_seen < NOW() - INTERVAL '2 minutes'
ORDER BY last_seen DESC
LIMIT 10;
```

---

## ⚙️ How It Works

### Timeline:
1. **User joins chat** → `is_online = true`, `last_seen` updated
2. **Every 30 seconds** → Heartbeat updates `last_seen`
3. **User disconnects gracefully** → `is_online = false`, `last_seen` updated
4. **User crashes/loses network** → `is_online` stays `true` ❌
5. **Every minute (pg_cron)** → `cleanup_offline_users()` runs
6. **If `last_seen` > 2 minutes** → User marked as `is_online = false` ✅

### Why 2 Minutes?
- Heartbeat runs every **30 seconds**
- 2 minutes = **4 missed heartbeats**
- This is conservative and prevents false positives
- Handles network hiccups and temporary disconnects

---

## ✅ What This Doesn't Break

### Existing Functionality Preserved:
✅ **Normal login/logout** - Still works perfectly
✅ **Presence tracking** - Realtime Presence still primary source of truth
✅ **Heartbeat system** - Continues updating `last_seen` every 30 seconds
✅ **User experience** - No visible changes to users
✅ **Performance** - Lightweight UPDATE query runs every minute

### Safety Guarantees:
- Only updates users where `is_online = true` (no redundant updates)
- Only updates users with stale `last_seen` (2+ minutes)
- Does NOT delete users or any data
- Does NOT affect Realtime Presence (separate system)
- Does NOT interfere with manual online/offline status changes

---

## 🔍 Monitoring & Verification

### Check Cron Job Execution:
```sql
-- See recent cron job runs
SELECT *
FROM cron.job_run_details
WHERE jobname = 'cleanup-offline-users'
ORDER BY start_time DESC
LIMIT 10;
```

### Check for Stale Online Users:
```sql
-- Find users who are marked online but haven't been seen in 2+ minutes
SELECT id, nickname, is_online, last_seen,
       EXTRACT(EPOCH FROM (NOW() - last_seen))/60 AS minutes_ago
FROM users
WHERE is_online = true
  AND last_seen < NOW() - INTERVAL '2 minutes'
ORDER BY last_seen ASC;
```

This should return **0 rows** if the cleanup is working correctly.

### Check Online User Count:
```sql
-- How many users are currently marked as online?
SELECT COUNT(*) as online_users
FROM users
WHERE is_online = true;
```

---

## 🎉 Benefits

1. **Accurate online counts** - Online user count reflects actual connected users
2. **Nickname availability** - Nicknames become available when users disconnect
3. **Cleaner data** - Database reflects reality
4. **Better analytics** - Accurate online user statistics
5. **No manual intervention** - Fully automatic cleanup

---

## 🛠️ Troubleshooting

### Cron job not running?
```sql
-- Check if pg_cron extension is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- If not, enable it:
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### Function not found?
Run the migration again:
```sql
-- Check if function exists
SELECT proname FROM pg_proc WHERE proname = 'cleanup_offline_users';
```

### Too many users marked offline?
The 2-minute threshold might be too aggressive for your use case. Adjust it:
```sql
CREATE OR REPLACE FUNCTION cleanup_offline_users()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE users
  SET is_online = false
  WHERE is_online = true
    AND last_seen < NOW() - INTERVAL '5 minutes'; -- Changed from 2 to 5 minutes
END;
$$;
```

---

## 📊 Deployment Status

- ✅ Code deployed to Cloudflare Pages
- ✅ Migration file created
- ⏳ **Database migration pending** (requires manual SQL execution)
- ⏳ **Cron job pending** (requires manual SQL execution)

**Deployment URL:** https://54afa7ba.chatwii.pages.dev

---

## 🎯 Next Steps

1. Run the migration SQL in Supabase Dashboard
2. Set up the cron job
3. Verify it's working with the monitoring queries above
4. Enjoy automatic offline user cleanup! 🎉
