/**
 * Popup Dashboard Script for Email Tracker
 */

let currentData = null;

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('📧 Popup loaded');

  // Check backend connection
  checkConnection();

  // Load tracking data
  loadTrackingData();

  // Set up event listeners
  document.getElementById('refreshBtn').addEventListener('click', () => {
    loadTrackingData();
  });

  document.getElementById('settingsBtn').addEventListener('click', () => {
    // TODO: Open settings page or modal
    alert('Settings coming soon! For now, edit config.js to change backend URL.');
  });
});

/**
 * Check connection to backend
 */
async function checkConnection() {
  const statusElement = document.getElementById('connectionStatus');
  const indicator = statusElement.querySelector('.status-indicator');
  const text = statusElement.querySelector('.status-text');

  try {
    const response = await fetch(`${CONFIG.BACKEND_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (response.ok) {
      indicator.className = 'status-indicator status-connected';
      text.textContent = 'Connected to backend';
    } else {
      throw new Error('Backend returned error');
    }
  } catch (error) {
    console.error('❌ Connection error:', error);
    indicator.className = 'status-indicator status-disconnected';
    text.textContent = 'Backend not reachable';
  }
}

/**
 * Load all tracking data from backend
 */
async function loadTrackingData() {
  const emailsList = document.getElementById('emailsList');
  const emptyState = document.getElementById('emptyState');

  // Show loading state
  emailsList.innerHTML = '<div class="loading">Loading...</div>';
  emptyState.style.display = 'none';

  try {
    const response = await fetch(`${CONFIG.BACKEND_URL}${CONFIG.ENDPOINTS.GET_ALL}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    currentData = result;

    // Update stats
    updateStats(result.stats);

    // Display emails
    if (result.emails && result.emails.length > 0) {
      displayEmails(result.emails);
      emptyState.style.display = 'none';
    } else {
      emailsList.innerHTML = '';
      emptyState.style.display = 'block';
    }

  } catch (error) {
    console.error('❌ Error loading tracking data:', error);
    emailsList.innerHTML = `
      <div class="error-message">
        <p>❌ Failed to load data</p>
        <p class="error-details">${error.message}</p>
        <p class="error-hint">Make sure your backend is running and the URL in config.js is correct.</p>
      </div>
    `;
  }
}

/**
 * Update statistics display
 */
function updateStats(stats) {
  if (!stats) {
    return;
  }

  document.getElementById('totalEmails').textContent = stats.totalEmails || 0;
  document.getElementById('openedEmails').textContent = stats.openedEmails || 0;
  document.getElementById('openRate').textContent = `${stats.openRate || 0}%`;
}

/**
 * Display list of tracked emails
 */
function displayEmails(emails) {
  const emailsList = document.getElementById('emailsList');

  const emailsHtml = emails.map(email => {
    const openCount = email.opens ? email.opens.length : 0;
    const isOpened = openCount > 0;
    const firstOpen = isOpened ? new Date(email.opens[0].timestamp) : null;
    const lastOpen = isOpened ? new Date(email.opens[email.opens.length - 1].timestamp) : null;

    return `
      <div class="email-item ${isOpened ? 'opened' : 'unopened'}">
        <div class="email-header">
          <span class="email-status">${isOpened ? '✅' : '📭'}</span>
          <div class="email-info">
            <div class="email-subject">${escapeHtml(email.emailSubject)}</div>
            <div class="email-recipient">${escapeHtml(email.recipient)}</div>
          </div>
        </div>
        <div class="email-stats">
          <div class="stat-item">
            <span class="stat-label">Sent:</span>
            <span class="stat-value">${formatDate(new Date(email.sentAt))}</span>
          </div>
          ${isOpened ? `
            <div class="stat-item">
              <span class="stat-label">Opens:</span>
              <span class="stat-value">${openCount}x</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">First opened:</span>
              <span class="stat-value">${formatDate(firstOpen)}</span>
            </div>
            ${openCount > 1 ? `
              <div class="stat-item">
                <span class="stat-label">Last opened:</span>
                <span class="stat-value">${formatDate(lastOpen)}</span>
              </div>
            ` : ''}
          ` : `
            <div class="stat-item unopened-text">
              <span class="stat-value">Not opened yet</span>
            </div>
          `}
        </div>
        ${isOpened && email.opens && email.opens.length > 0 ? `
          <button class="details-btn" onclick="toggleDetails('${email.trackingId}')">
            View Details
          </button>
          <div id="details-${email.trackingId}" class="open-details" style="display: none;">
            ${email.opens.map((open, index) => `
              <div class="open-event">
                <strong>Open #${index + 1}:</strong>
                ${formatDateTime(new Date(open.timestamp))}
                <br>
                <small>${escapeHtml(open.userAgent)}</small>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  emailsList.innerHTML = emailsHtml;
}

/**
 * Toggle details visibility for an email
 */
window.toggleDetails = function(trackingId) {
  const detailsElement = document.getElementById(`details-${trackingId}`);
  if (detailsElement) {
    detailsElement.style.display = detailsElement.style.display === 'none' ? 'block' : 'none';
  }
};

/**
 * Format date for display (relative time)
 */
function formatDate(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

/**
 * Format date and time for details
 */
function formatDateTime(date) {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
