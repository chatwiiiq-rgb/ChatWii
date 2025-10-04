# How to Check Cloudflare Pages Logs for Debugging

## Method 1: Real-time Logs via Cloudflare Dashboard

1. Go to https://dash.cloudflare.com/
2. Navigate to **Workers & Pages**
3. Click on your **chatwii** project
4. Click on the **Logs** tab (or **Functions** → **Logs**)
5. Set filter to show real-time logs
6. Now go to https://chatwii.com/feedback and try submitting feedback
7. **Watch the logs appear in real-time** - you'll see our debug messages!

Look for:
```
Feedback API - Environment check: { hasPlatform: true, hasEnv: true, ... }
```

## Method 2: Using Wrangler CLI (Tail Logs)

```bash
cd chatwii
npx wrangler pages deployment tail --project-name=chatwii
```

Then submit feedback and you'll see logs in your terminal.

## What to Look For:

### ✅ If you see this (GOOD):
```json
{
  "hasPlatform": true,
  "hasEnv": true,
  "hasSupabaseUrl": true,
  "hasServiceKey": true
}
```

### ❌ If you see this (BAD):
```json
{
  "hasPlatform": true,
  "hasEnv": true,
  "hasSupabaseUrl": true,
  "hasServiceKey": false  // ← This means the env var isn't set!
}
```

### Database Error Messages:
Look for:
```
Feedback insert error: {
  "code": "...",
  "message": "...",
  "details": "...",
  "hint": "..."
}
```

This will tell us the EXACT error from Supabase!

## Common Issues & Fixes:

### Issue 1: `hasServiceKey: false`
**Fix**: The environment variable `SUPABASE_SERVICE_ROLE_KEY` isn't set in Cloudflare
- Go to Settings → Environment variables
- Make sure it's set for **Production** environment
- **After adding**, trigger a new deployment (even a dummy one)

### Issue 2: Supabase Connection Error
**Fix**: Check if the service role key is correct
- Go to Supabase Dashboard → Settings → API
- Copy the **service_role** key (not the anon key!)
- Update in Cloudflare Pages env vars

### Issue 3: Table/Permission Error
**Fix**: Run the migration in Supabase SQL Editor
- Open `supabase/migrations/apply_feedback_migrations.sql`
- Copy all contents
- Paste in Supabase SQL Editor and run

## After Checking Logs:

Send me the **exact error message** from the logs and I can fix it immediately!
