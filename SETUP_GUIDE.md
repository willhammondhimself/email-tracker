# 🚀 Quick Setup Guide

Follow these steps to get your email tracker running in 15 minutes.

## ✅ Checklist

- [ ] MongoDB Atlas account created
- [ ] Backend deployed to Railway or Vercel
- [ ] Extension configured with backend URL
- [ ] Extension loaded in Chrome
- [ ] Test email sent and tracked

---

## Step 1: MongoDB Atlas (5 minutes)

### 1.1 Create Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google account
3. Choose the **FREE** tier (M0 Sandbox)
4. Select a cloud provider (AWS recommended)
5. Choose a region close to you
6. Click "Create Cluster"

### 1.2 Create Database User
1. Wait for cluster to be created (~3 minutes)
2. Click "Database Access" in left sidebar
3. Click "Add New Database User"
4. Choose "Password" authentication
5. Create username and password (save these!)
6. Set "Database User Privileges" to "Read and write to any database"
7. Click "Add User"

### 1.3 Allow Network Access
1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (or add your IP)
4. Click "Confirm"

### 1.4 Get Connection String
1. Click "Database" in left sidebar
2. Click "Connect" button on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Add `/emailtracker` before the `?` in the URL

**Example:**
```
mongodb+srv://myuser:mypass123@cluster0.abc123.mongodb.net/emailtracker?retryWrites=true&w=majority
```

✅ **Save this connection string - you'll need it next!**

---

## Step 2: Deploy Backend (5 minutes)

### Option A: Railway (Recommended)

#### 2.1 Install Railway CLI
```bash
npm install -g @railway/cli
```

#### 2.2 Deploy
```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Login to Railway (opens browser)
railway login

# Create new project
railway init

# Add MongoDB connection string
railway variables set MONGODB_URI="paste-your-connection-string-here"

# Deploy!
railway up

# Get your URL
railway domain
```

Your backend is now live at: `https://your-app.railway.app`

### Option B: Vercel

#### 2.1 Install Vercel CLI
```bash
npm install -g vercel
```

#### 2.2 Deploy
```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Deploy (follow prompts)
vercel

# Add environment variable
vercel env add MONGODB_URI
# Paste your connection string when prompted
# Choose "Production"

# Redeploy with environment variable
vercel --prod
```

Your backend is now live at: `https://your-app.vercel.app`

✅ **Save your backend URL!**

---

## Step 3: Configure Extension (2 minutes)

### 3.1 Update Backend URL

Open `extension/config.js` and update the `BACKEND_URL`:

```javascript
const CONFIG = {
  BACKEND_URL: 'https://your-app.railway.app', // ← Change this!
  // ...
};
```

### 3.2 Add Icons

Quick option - download these free icons:
- Go to https://www.flaticon.com/free-icon/email_732200
- Download in PNG format
- Rename to `icon16.png`, `icon48.png`, `icon128.png`
- Place in `extension/icons/` folder

Or use any 📧 emoji converter to create simple icons.

---

## Step 4: Load Extension (2 minutes)

### 4.1 Open Chrome Extensions
```
chrome://extensions/
```

### 4.2 Enable Developer Mode
- Toggle "Developer mode" in top-right corner

### 4.3 Load Extension
1. Click "Load unpacked"
2. Navigate to the `extension` folder
3. Click "Select Folder"

✅ Extension should now appear in your Chrome toolbar!

---

## Step 5: Test It! (2 minutes)

### 5.1 Send Test Email

1. Go to https://mail.google.com
2. Click "Compose"
3. Look for "📊 Track this email" checkbox
4. Check the box
5. Add recipient (can be yourself!)
6. Add subject: "Test Email"
7. Click "Send"

### 5.2 Check Dashboard

1. Click the extension icon in Chrome toolbar
2. You should see:
   - ✅ "Connected to backend"
   - Your test email in the list
   - Status: "Not opened yet"

### 5.3 Verify Tracking

1. Open the test email (in recipient's inbox)
2. Refresh the extension dashboard (click 🔄)
3. Status should change to "✅ Opened"
4. Click "View Details" to see timestamp

---

## 🎉 Success!

Your email tracker is now fully operational!

## 🔍 Troubleshooting

### "Backend not reachable"
- Check if backend is running: `curl https://your-backend-url/health`
- Verify `config.js` has correct URL
- Check Railway/Vercel logs for errors

### "Track this email" checkbox not showing
- Refresh Gmail page
- Check if you're on `mail.google.com` (not inbox.google.com)
- Press F12 → Console, look for errors
- Reload extension in `chrome://extensions/`

### Tracking pixel not working
- Check browser console for CORS errors
- Verify MongoDB connection string is correct
- Test backend API: `curl https://your-backend-url/api/tracking/all`
- Check backend logs

### MongoDB connection error
- Verify connection string format
- Check password doesn't contain special characters (or URL-encode them)
- Ensure Network Access allows connections (0.0.0.0/0)
- Verify database user has correct permissions

---

## 📚 Next Steps

- **Customize**: Modify the code to fit your needs
- **Secure**: Add authentication if sharing backend
- **Enhance**: Add features from the "Future Enhancements" list
- **Monitor**: Check MongoDB Atlas for usage stats

---

## 🆘 Still Having Issues?

1. Check all URLs are correct (no typos)
2. Verify environment variables are set
3. Check browser and server console logs
4. Test each component individually
5. Review the main README.md for detailed docs

---

**Estimated Total Time: 15 minutes**

Happy tracking! 📧📊
