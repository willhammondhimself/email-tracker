/**
 * Background Service Worker for Email Tracker
 * Handles API communication and manages extension state
 */

// Import config for backend URL
importScripts('config.js');

console.log('📧 Email Tracker: Background service worker loaded');

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📧 Message received:', message);

  if (message.action === 'generatePixel') {
    generatePixel(message.data)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true; // Keep channel open for async response
  }

  if (message.action === 'getTrackingData') {
    getTrackingData(message.trackingId)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }

  if (message.action === 'getAllTrackingData') {
    getAllTrackingData()
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
});

/**
 * Generate tracking pixel via backend API
 */
async function generatePixel(data) {
  try {
    const response = await fetch(`${CONFIG.BACKEND_URL}${CONFIG.ENDPOINTS.GENERATE_PIXEL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Error generating pixel:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get tracking data for specific email
 */
async function getTrackingData(trackingId) {
  try {
    const response = await fetch(`${CONFIG.BACKEND_URL}${CONFIG.ENDPOINTS.GET_TRACKING}/${trackingId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    console.error('❌ Error fetching tracking data:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all tracking data
 */
async function getAllTrackingData() {
  try {
    const response = await fetch(`${CONFIG.BACKEND_URL}${CONFIG.ENDPOINTS.GET_ALL}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Error fetching all tracking data:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle extension installation
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('📧 Email Tracker installed!');

    // Initialize storage
    chrome.storage.local.set({
      trackedEmails: [],
      settings: {
        backendUrl: CONFIG.BACKEND_URL
      }
    });

    // Open setup page (optional)
    // chrome.tabs.create({ url: 'setup.html' });
  }
});
