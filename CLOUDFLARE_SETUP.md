# Cloudflare Pages Deployment Setup

This guide explains how to deploy ChatWii to Cloudflare Pages with all required environment variables and secrets.

## Prerequisites

- Cloudflare account
- GitHub repository connected to Cloudflare Pages
- Wrangler CLI installed: `npm install -g wrangler`

## Environment Variables Setup

Your Cloudflare Pages deployment requires both **public variables** (in `wrangler.toml`) and **secret variables** (encrypted).

### Public Variables (Already in wrangler.toml)

These are already configured in `wrangler.toml`:
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `PUBLIC_IMAGEKIT_PUBLIC_KEY`
- `PUBLIC_IMAGEKIT_URL_ENDPOINT`
- `PUBLIC_CAPTCHA_SITE_KEY`

### Secret Variables (Need to be added via Cloudflare Dashboard or CLI)

These secrets contain sensitive data and should **NEVER** be committed to Git:

1. **IMAGEKIT_PRIVATE_KEY** - ImageKit private API key
2. **SUPABASE_SERVICE_ROLE_KEY** - Supabase service role key
3. **CAPTCHA_SECRET_KEY** - Cloudflare Turnstile secret key

## Option 1: Add Secrets via Cloudflare Dashboard

1. Go to **Cloudflare Dashboard** → **Pages** → **Your Project (chatwii)**
2. Click on **Settings** → **Environment Variables**
3. Under **Production** (and **Preview** if needed), add these variables:

   ```
   IMAGEKIT_PRIVATE_KEY=private_X4n3xAifTYYuI5d0XqPmJNx93OM=
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hYnpqbm9xcnBwYnhtZ3FtdGNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQwMjQxNCwiZXhwIjoyMDc0OTc4NDE0fQ.Ja4h5GEQ-MKPSK6Nvru51FpqiM7vVL2rzhAblUuk_B8
   CAPTCHA_SECRET_KEY=0x4AAAAAAB4jwZX_Tc-dwIDeJ4MtJD_rvgY
   ```

4. Click **Save**
5. **Redeploy** your application for changes to take effect

## Option 2: Add Secrets via Wrangler CLI

```bash
# Navigate to your project
cd chatwii

# Add ImageKit private key
npx wrangler pages secret put IMAGEKIT_PRIVATE_KEY --project-name=chatwii
# When prompted, paste: private_X4n3xAifTYYuI5d0XqPmJNx93OM=

# Add Supabase service role key
npx wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY --project-name=chatwii
# When prompted, paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hYnpqbm9xcnBwYnhtZ3FtdGNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQwMjQxNCwiZXhwIjoyMDc0OTc4NDE0fQ.Ja4h5GEQ-MKPSK6Nvru51FpqiM7vVL2rzhAblUuk_B8

# Add Turnstile secret key
npx wrangler pages secret put CAPTCHA_SECRET_KEY --project-name=chatwii
# When prompted, paste: 0x4AAAAAAB4jwZX_Tc-dwIDeJ4MtJD_rvgY
```

## Verifying Secrets are Set

List all secrets for your Pages project:

```bash
npx wrangler pages secret list --project-name=chatwii
```

You should see:
```
IMAGEKIT_PRIVATE_KEY
SUPABASE_SERVICE_ROLE_KEY
CAPTCHA_SECRET_KEY
```

## Deploy to Cloudflare Pages

### Automatic Deployment (via Git)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Configure ImageKit for Cloudflare Pages"
   git push origin main
   ```

2. Cloudflare Pages will automatically build and deploy

### Manual Deployment

```bash
npm run build
npx wrangler pages deploy build --project-name=chatwii
```

## Testing ImageKit Image Upload

After deployment:

1. Visit: https://chatwii.pages.dev
2. Sign in to the chat
3. Select a user
4. Click the image upload icon
5. Upload an image (max 5MB)
6. Verify the image appears in the chat

## Troubleshooting

### "Server configuration error" when uploading images

**Cause**: `IMAGEKIT_PRIVATE_KEY` not set in Cloudflare

**Solution**: Add the secret via Dashboard or Wrangler CLI (see above)

### Images upload but auth endpoint fails

**Cause**: Mismatch between public and private keys

**Solution**: Verify that `PUBLIC_IMAGEKIT_PUBLIC_KEY` (in `wrangler.toml`) matches the public key from your ImageKit dashboard

### Environment variables not available

**Cause**: Secrets not propagated or deployment not rebuilt

**Solution**:
1. Verify secrets are set: `npx wrangler pages secret list`
2. Trigger a new deployment in Cloudflare Dashboard

## Production Checklist

- [ ] All secrets added to Cloudflare Pages
- [ ] `wrangler.toml` public variables configured
- [ ] Deployment successful
- [ ] Image upload tested and working
- [ ] CAPTCHA tested and working
- [ ] Supabase authentication working

## Security Notes

- **NEVER** commit `.env` or `.env.local` files to Git
- Secrets are encrypted at rest in Cloudflare
- Public variables in `wrangler.toml` are safe to commit (they're public by design)
- Rotate keys if accidentally exposed

## Your Deployment URL

Primary: https://chatwii.pages.dev

Custom Domain: (Configure in Cloudflare Pages → Custom Domains)
