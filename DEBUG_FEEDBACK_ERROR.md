# Quick Debug: Get the Exact Error

## Easiest Method - Browser Console (DO THIS NOW):

1. **Open the feedback page**: https://chatwii.com/feedback

2. **Open Developer Tools**:
   - Press `F12` OR
   - Right-click → "Inspect" → Go to "Console" tab

3. **Clear the console** (click the 🚫 icon)

4. **Submit feedback** (put anything in the message field and click Submit)

5. **Look for the error in console**. You'll see something like:

```
POST https://chatwii.com/api/feedback 500 (Internal Server Error)
```

6. **Click on that error line** to expand it

7. **Look for the Response** - it will show JSON like:

```json
{
  "success": false,
  "error": "Failed to submit feedback",
  "debug": {
    "code": "XXXXX",
    "message": "The exact error message here"
  }
}
```

8. **COPY THAT ENTIRE JSON** and send it to me!

---

## Alternative: Network Tab Method

1. Open Developer Tools (`F12`)
2. Go to **Network** tab
3. Clear it (click 🚫)
4. Submit feedback
5. Click on the `feedback` request
6. Go to **Response** tab
7. Copy the JSON response

---

## What I'm Looking For:

The response will tell me EXACTLY what's wrong:

### If it's a missing env var:
```json
{
  "error": "...",
  "debug": {
    "message": "Invalid API key" or "Missing credentials"
  }
}
```

### If it's a database error:
```json
{
  "debug": {
    "code": "42P01",
    "message": "relation \"public.feedback\" does not exist"
  }
}
```

### If it's a permission error:
```json
{
  "debug": {
    "code": "42501",
    "message": "permission denied for table feedback"
  }
}
```

**Just copy-paste the entire error JSON here and I'll know exactly how to fix it!**
