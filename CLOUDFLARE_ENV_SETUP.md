# Cloudflare Pages Environment Variables Setup

## CRITICAL: Missing Environment Variable

Your feedback form is failing because the `SUPABASE_SERVICE_ROLE_KEY` is not set in Cloudflare Pages.

## How to Fix:

### Step 1: Go to Cloudflare Pages Dashboard
1. Go to https://dash.cloudflare.com/
2. Navigate to **Workers & Pages**
3. Click on your **chatwii** project
4. Go to **Settings** tab
5. Scroll to **Environment variables** section

### Step 2: Add the Missing Variable

Click **"Add variable"** and add:

**Variable Name:** `SUPABASE_SERVICE_ROLE_KEY`

**Variable Value:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hYnpqbm9xcnBwYnhtZ3FtdGNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQwMjQxNCwiZXhwIjoyMDc0OTc4NDE0fQ.Ja4h5GEQ-MKPSK6Nvru51FpqiM7vVL2rzhAblUuk_B8
```

**Environment:** Select **Production** (and Preview if you want)

### Step 3: Verify All Required Environment Variables

Make sure you have ALL of these set in Cloudflare Pages:

#### Public Variables (these should already exist):
- ✅ `PUBLIC_SUPABASE_URL` = `https://oabzjnoqrppbxmgqmtco.supabase.co`
- ✅ `PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hYnpqbm9xcnBwYnhtZ3FtdGNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MDI0MTQsImV4cCI6MjA3NDk3ODQxNH0.XVRvAy9dxdPWyZlb5-iV_QXTn0YmoxZWH10N7rchwhc`
- ✅ `PUBLIC_IMAGEKIT_PUBLIC_KEY` = `public_o4AoAY8pBf4VqcJ4+YY7XXL+bco=`
- ✅ `PUBLIC_IMAGEKIT_URL_ENDPOINT` = `https://ik.imagekit.io/ChatWii`
- ✅ `PUBLIC_CAPTCHA_SITE_KEY` = `0x4AAAAAAB4jwUskSLfD6nN0`

#### Private/Secret Variables (server-side only):
- ❌ **MISSING** → `SUPABASE_SERVICE_ROLE_KEY` = (value shown above)
- ✅ `IMAGEKIT_PRIVATE_KEY` = `private_X4n3xAifTYYuI5d0XqPmJNx93OM=`
- ✅ `CAPTCHA_SECRET_KEY` = `0x4AAAAAAB4jwZX_Tc-dwIDeJ4MtJD_rvgY`

### Step 4: Redeploy

After adding the environment variable:
1. The next deployment will automatically pick it up
2. Or you can trigger a redeploy from the Cloudflare dashboard

## Why This Is Needed

The feedback API endpoint needs the **service role key** to:
- Bypass Row Level Security (RLS) policies
- Insert data directly into the `feedback` table
- Perform server-side operations with elevated permissions

The anon key doesn't have sufficient permissions for server-side operations.

## Testing After Fix

1. Go to https://chatwii.com/feedback
2. Enter a test message
3. Click Submit
4. It should work without any 500 errors!
