/**
 * Simple API Testing Script
 * Run with: node test-api.js
 */

const https = require('https');
const http = require('http');

// CHANGE THIS to your backend URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

console.log(`\n🧪 Testing Email Tracker API: ${BACKEND_URL}\n`);

/**
 * Make HTTP request
 */
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const lib = isHttps ? https : http;
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: data ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      } : {}
    };

    const req = lib.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Run all tests
 */
async function runTests() {
  let trackingId = null;

  // Test 1: Health Check
  console.log('Test 1: Health Check');
  try {
    const result = await makeRequest(`${BACKEND_URL}/health`);
    if (result.status === 200) {
      console.log('✅ PASS - Server is healthy');
      console.log(`   Response: ${JSON.stringify(result.data)}\n`);
    } else {
      console.log(`❌ FAIL - Status: ${result.status}\n`);
    }
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}\n`);
    console.log('⚠️  Make sure backend is running!\n');
    return;
  }

  // Test 2: Generate Tracking Pixel
  console.log('Test 2: Generate Tracking Pixel');
  try {
    const result = await makeRequest(
      `${BACKEND_URL}/api/pixel/generate`,
      'POST',
      {
        emailSubject: 'Test Email - API Test',
        recipient: 'test@example.com'
      }
    );

    if (result.status === 200 && result.data.success) {
      trackingId = result.data.trackingId;
      console.log('✅ PASS - Tracking pixel generated');
      console.log(`   Tracking ID: ${trackingId}`);
      console.log(`   Pixel URL: ${result.data.pixelUrl}\n`);
    } else {
      console.log(`❌ FAIL - Status: ${result.status}`);
      console.log(`   Response: ${JSON.stringify(result.data)}\n`);
    }
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}\n`);
  }

  if (!trackingId) {
    console.log('⚠️  Cannot continue tests without tracking ID\n');
    return;
  }

  // Test 3: Simulate Email Open
  console.log('Test 3: Simulate Email Open (Request Pixel)');
  try {
    const result = await makeRequest(`${BACKEND_URL}/pixel/${trackingId}.png`);
    if (result.status === 200) {
      console.log('✅ PASS - Pixel served successfully');
      console.log(`   Content-Type should be image/png\n`);
    } else {
      console.log(`❌ FAIL - Status: ${result.status}\n`);
    }
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}\n`);
  }

  // Small delay to ensure database write completes
  await new Promise(resolve => setTimeout(resolve, 500));

  // Test 4: Get Tracking Data for Specific Email
  console.log('Test 4: Get Tracking Data for Specific Email');
  try {
    const result = await makeRequest(`${BACKEND_URL}/api/tracking/${trackingId}`);
    if (result.status === 200 && result.data.success) {
      const data = result.data.data;
      console.log('✅ PASS - Tracking data retrieved');
      console.log(`   Subject: ${data.emailSubject}`);
      console.log(`   Recipient: ${data.recipient}`);
      console.log(`   Opens: ${data.opens.length}`);
      if (data.opens.length > 0) {
        console.log(`   First open: ${data.opens[0].timestamp}\n`);
      } else {
        console.log(`   ⚠️  Warning: No opens recorded (may be timing issue)\n`);
      }
    } else {
      console.log(`❌ FAIL - Status: ${result.status}`);
      console.log(`   Response: ${JSON.stringify(result.data)}\n`);
    }
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}\n`);
  }

  // Test 5: Get All Tracking Data
  console.log('Test 5: Get All Tracking Data');
  try {
    const result = await makeRequest(`${BACKEND_URL}/api/tracking/all`);
    if (result.status === 200 && result.data.success) {
      console.log('✅ PASS - All tracking data retrieved');
      console.log(`   Total Emails: ${result.data.stats.totalEmails}`);
      console.log(`   Opened Emails: ${result.data.stats.openedEmails}`);
      console.log(`   Open Rate: ${result.data.stats.openRate}%\n`);
    } else {
      console.log(`❌ FAIL - Status: ${result.status}`);
      console.log(`   Response: ${JSON.stringify(result.data)}\n`);
    }
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}\n`);
  }

  console.log('🎉 Testing complete!\n');
  console.log('Next steps:');
  console.log('1. Load the Chrome extension');
  console.log('2. Configure extension/config.js with your backend URL');
  console.log('3. Send a test email from Gmail\n');
}

// Run tests
runTests().catch(console.error);
