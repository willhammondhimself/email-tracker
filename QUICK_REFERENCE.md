# ⚡ Quick Reference Card

## 🚀 Quick Start Commands

### First Time Setup

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env and add your MongoDB connection string

# 3. Test locally
npm start

# 4. Test API
node test-api.js

# 5. Deploy to Railway
railway login
railway init
railway variables set MONGODB_URI="your-connection-string"
railway up
railway domain
```

### Load Extension

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `extension` folder
5. Update `extension/config.js` with your backend URL

## 📍 Important URLs

- **Local Backend**: http://localhost:3000
- **Railway**: https://your-app.railway.app
- **Vercel**: https://your-app.vercel.app
- **Extensions**: chrome://extensions/
- **Gmail**: https://mail.google.com

## 🔧 Common Tasks

### Update Backend URL
```javascript
// extension/config.js
BACKEND_URL: 'https://your-backend.com'
```

### Test Backend Health
```bash
curl https://your-backend.com/health
```

### View All Tracked Emails
```bash
curl https://your-backend.com/api/tracking/all
```

### Check Extension Logs
1. Right-click extension icon
2. Click "Inspect popup"
3. Go to Console tab

### Check Gmail Integration Logs
1. Press F12 in Gmail
2. Go to Console tab
3. Look for "📧 Email Tracker" messages

### Reload Extension After Changes
1. Go to `chrome://extensions/`
2. Click refresh icon on your extension

## 📊 Dashboard Shortcuts

| Action | How To |
|--------|--------|
| Refresh data | Click 🔄 button |
| View details | Click "View Details" on email |
| Open Gmail | Click "Open Gmail" in footer |
| Check connection | Look at status indicator |

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend not reachable | 1. Check backend URL in config.js<br>2. Verify backend is running<br>3. Check CORS settings |
| Checkbox not showing | 1. Refresh Gmail<br>2. Check console for errors<br>3. Reload extension |
| Tracking not working | 1. Check backend logs<br>2. Verify MongoDB connection<br>3. Test pixel endpoint |
| Dashboard empty | 1. Send test email with tracking enabled<br>2. Click refresh<br>3. Check API endpoint |

## 🔑 Environment Variables

```bash
# Backend (.env file)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/emailtracker
PORT=3000
NODE_ENV=production
```

## 📡 API Endpoints

```bash
# Health check
GET /health

# Generate tracking pixel
POST /api/pixel/generate
Body: { "emailSubject": "...", "recipient": "..." }

# Get tracking pixel (logs open)
GET /pixel/:trackingId.png

# Get specific email tracking
GET /api/tracking/:trackingId

# Get all tracked emails
GET /api/tracking/all

# Delete tracking record
DELETE /api/tracking/:trackingId
```

## 🎨 Customization Points

### Colors (extension/popup.css)
```css
/* Main gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Change to your colors */
background: linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%);
```

### Tracking Button Text (extension/content.js)
```javascript
// Find this line:
<span style="color: #5f6368;">📊 Track this email</span>

// Change to:
<span style="color: #5f6368;">🎯 Your Custom Text</span>
```

## 📦 File Locations

| What | Where |
|------|-------|
| Backend URL config | `extension/config.js` |
| MongoDB connection | `backend/.env` |
| Extension settings | `extension/manifest.json` |
| Tracking schema | `backend/models/Tracking.js` |
| API routes | `backend/routes/pixel.js` |
| Dashboard UI | `extension/popup.html` |
| Dashboard logic | `extension/popup.js` |
| Dashboard styles | `extension/popup.css` |
| Gmail integration | `extension/content.js` |

## 🧪 Testing Checklist

- [ ] Backend health endpoint responds
- [ ] Can generate tracking pixel
- [ ] Pixel endpoint serves PNG
- [ ] Checkbox appears in Gmail compose
- [ ] Can send email with tracking
- [ ] Dashboard shows sent email
- [ ] Open email triggers update
- [ ] Dashboard shows open status
- [ ] View details shows timestamp
- [ ] Stats update correctly

## 💡 Tips

- **Testing**: Use your own email address as recipient
- **Debugging**: Check both browser console and backend logs
- **Icons**: Replace placeholders in `extension/icons/`
- **Performance**: MongoDB Atlas free tier is sufficient for personal use
- **Privacy**: Only you have access to your tracking data
- **Updates**: Just reload extension after code changes

## 🔗 Useful Commands

```bash
# View backend logs (Railway)
railway logs

# View backend logs (Vercel)
vercel logs

# Restart backend (Railway)
railway restart

# Test specific endpoint
curl -X POST https://your-backend.com/api/pixel/generate \
  -H "Content-Type: application/json" \
  -d '{"emailSubject":"Test","recipient":"test@example.com"}'

# Monitor MongoDB
# Go to: https://cloud.mongodb.com → Browse Collections
```

## 📞 Support Resources

- **Setup Guide**: `SETUP_GUIDE.md`
- **Full Docs**: `README.md`
- **Project Summary**: `PROJECT_SUMMARY.md`
- **Backend Test**: `backend/test-api.js`

---

**Need help?** Check the troubleshooting sections in README.md
