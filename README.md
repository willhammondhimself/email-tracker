# 📧 Gmail Email Tracker - Chrome Extension

A private email tracking system that lets you track when recipients open your emails using invisible tracking pixels. Works with your personal Gmail account.

## 🎯 Features

- ✅ Invisible 1x1 pixel tracking
- 📊 Real-time open tracking with timestamps
- 📈 Dashboard with open rates and statistics
- 🔒 Private - only tracks emails YOU send
- 🚀 Easy deployment with Railway or Vercel
- 💾 MongoDB Atlas free tier compatible

## 📁 Project Structure

```
/email-tracker
├── /backend              # Node.js + Express server
│   ├── server.js         # Main server file
│   ├── package.json      # Dependencies
│   ├── .env.example      # Environment variables template
│   ├── /models           # MongoDB schemas
│   ├── /routes           # API endpoints
│   └── /utils            # Helper functions
├── /extension            # Chrome extension
│   ├── manifest.json     # Extension configuration
│   ├── content.js        # Gmail integration
│   ├── background.js     # Service worker
│   ├── popup.html/js/css # Dashboard UI
│   ├── config.js         # Backend URL configuration
│   └── /icons            # Extension icons
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js 16+ installed
- Chrome browser
- MongoDB Atlas account (free tier)
- Railway or Vercel account (free tier)

### Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and new cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`)
5. Replace `<password>` with your actual password
6. Add `/emailtracker` before the query parameters

**Final format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/emailtracker?retryWrites=true&w=majority
```

### Step 2: Deploy Backend

#### Option A: Deploy to Railway

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Navigate to backend directory:
```bash
cd backend
```

3. Install dependencies:
```bash
npm install
```

4. Login to Railway:
```bash
railway login
```

5. Initialize and deploy:
```bash
railway init
railway up
```

6. Set environment variable:
```bash
railway variables set MONGODB_URI="your-mongodb-connection-string"
```

7. Get your deployment URL:
```bash
railway domain
```
You'll get a URL like: `https://your-app.railway.app`

#### Option B: Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Navigate to backend directory:
```bash
cd backend
```

3. Install dependencies:
```bash
npm install
```

4. Deploy:
```bash
vercel
```

5. Add environment variable in Vercel dashboard:
   - Go to your project → Settings → Environment Variables
   - Add `MONGODB_URI` with your MongoDB connection string

6. Your backend URL will be: `https://your-app.vercel.app`

#### Local Development (Testing)

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Edit `.env` and add your MongoDB URI

5. Start server:
```bash
npm start
```

Server will run on `http://localhost:3000`

### Step 3: Configure Chrome Extension

1. Open `extension/config.js`

2. Update `BACKEND_URL` with your deployed backend URL:
```javascript
const CONFIG = {
  BACKEND_URL: 'https://your-app.railway.app', // or your Vercel URL
  // ...
};
```

3. Add extension icons (see `extension/icons/README.md`)

### Step 4: Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`

2. Enable "Developer mode" (toggle in top-right corner)

3. Click "Load unpacked"

4. Select the `extension` folder from this project

5. The extension should now appear in your Chrome toolbar

## 🧪 Testing

### Test Backend

1. Check health endpoint:
```bash
curl https://your-backend-url/health
```

Should return: `{"status":"OK","timestamp":"..."}`

2. Test pixel generation:
```bash
curl -X POST https://your-backend-url/api/pixel/generate \
  -H "Content-Type: application/json" \
  -d '{"emailSubject":"Test","recipient":"test@example.com"}'
```

### Test Extension

1. Go to [Gmail](https://mail.google.com)

2. Click "Compose" to start a new email

3. You should see a "📊 Track this email" checkbox near the Send button

4. Check the box, add a recipient and subject

5. Send the email (it should contain an invisible tracking pixel)

6. Click the extension icon in Chrome toolbar to view the dashboard

7. You should see your sent email in the list

8. When recipient opens the email, the status will update to "✅ Opened"

## 📊 Using the Dashboard

Click the extension icon to open the dashboard:

- **Stats**: Total sent, opened, and open rate
- **Recent Emails**: List of tracked emails with open status
- **Details**: Click "View Details" to see all open events with timestamps
- **Refresh**: Click 🔄 to refresh data

## 🔧 Configuration

### Changing Backend URL

Edit `extension/config.js`:
```javascript
BACKEND_URL: 'https://your-new-backend-url.com'
```

Then reload the extension in `chrome://extensions/`

### Customizing Tracking

Backend code is well-commented. You can modify:

- **Tracking data**: Edit `backend/models/Tracking.js`
- **API endpoints**: Edit `backend/routes/pixel.js`
- **Pixel generation**: Edit `backend/utils/generatePixel.js`

## 🐛 Troubleshooting

### Extension not showing in Gmail

1. Check if you're on `https://mail.google.com` (not inbox.google.com)
2. Refresh the Gmail page
3. Check console for errors (F12 → Console)
4. Make sure extension is enabled in `chrome://extensions/`

### Tracking not working

1. Open extension popup and check connection status
2. Verify `config.js` has correct backend URL
3. Check backend logs for errors
4. Test backend health endpoint
5. Check browser console for CORS errors

### Backend connection errors

1. Verify MongoDB connection string is correct
2. Check MongoDB Atlas allows connections from all IPs (0.0.0.0/0)
3. Verify backend is deployed and running
4. Check backend logs for errors

### Dashboard not showing emails

1. Click refresh button (🔄)
2. Check browser console for errors
3. Verify backend `/api/tracking/all` endpoint works:
```bash
curl https://your-backend-url/api/tracking/all
```

## 🔒 Privacy & Security

- Only tracks emails YOU send from YOUR Gmail
- Tracking pixels are standard practice (used by Mailchimp, HubSpot, etc.)
- Data stored in your private MongoDB
- No third-party services involved
- You control all the code and data

## 🔄 Updating the Extension

After making changes:

1. Edit the code
2. Go to `chrome://extensions/`
3. Click the refresh icon on your extension card
4. The changes will take effect immediately

## 📝 API Reference

### POST /api/pixel/generate
Create tracking pixel for new email
```json
{
  "emailSubject": "Meeting Tomorrow",
  "recipient": "john@example.com"
}
```

### GET /pixel/:id.png
Serve tracking pixel (logs open event)

### GET /api/tracking/:id
Get tracking data for specific email

### GET /api/tracking/all
Get all tracked emails with statistics

## 🚧 Future Enhancements

- [ ] Multiple recipient support
- [ ] Email client detection
- [ ] Geographic location tracking
- [ ] Export tracking data to CSV
- [ ] Browser extension settings page
- [ ] Email templates
- [ ] Scheduled email tracking reports

## 📄 License

MIT License - Use freely for personal projects

## ⚠️ Disclaimer

This tool is for personal use only. Be aware of privacy laws and regulations in your jurisdiction. Always use email tracking responsibly and ethically.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console logs
3. Check backend server logs
4. Verify all configuration steps

---

Built with ❤️ for private email tracking
