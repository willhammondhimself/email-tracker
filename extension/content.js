/**
 * Content Script for Gmail Email Tracker
 * Injects tracking pixels into composed emails
 */

// Track whether tracking is enabled for current compose
let trackingEnabled = false;
let currentComposeWindow = null;

console.log('📧 Email Tracker: Content script loaded');

/**
 * Initialize the extension when Gmail is ready
 */
function initialize() {
  console.log('📧 Email Tracker: Initializing...');

  // Use MutationObserver to detect when compose windows open
  const observer = new MutationObserver((mutations) => {
    checkForComposeWindow();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial check
  checkForComposeWindow();
}

/**
 * Check if a compose window is open and add tracking button
 */
function checkForComposeWindow() {
  // Gmail compose window selectors (these may need updates if Gmail changes)
  const composeWindows = document.querySelectorAll('[role="dialog"]');

  composeWindows.forEach((compose) => {
    // Check if we've already added our button to this compose window
    if (compose.querySelector('.email-tracker-toggle')) {
      return;
    }

    // Find the send button area
    const sendButton = compose.querySelector('[role="button"][data-tooltip*="Send"], [aria-label*="Send"]');

    if (sendButton) {
      addTrackingToggle(compose, sendButton);
    }
  });
}

/**
 * Add tracking toggle button to compose window
 */
function addTrackingToggle(composeWindow, sendButton) {
  currentComposeWindow = composeWindow;

  // Create toggle button
  const toggleButton = document.createElement('div');
  toggleButton.className = 'email-tracker-toggle';
  toggleButton.innerHTML = `
    <label style="display: flex; align-items: center; margin-right: 15px; cursor: pointer; font-size: 13px; user-select: none;">
      <input type="checkbox" id="trackingCheckbox" style="margin-right: 5px;">
      <span style="color: #5f6368;">📊 Track this email</span>
    </label>
  `;

  // Find the toolbar area near the send button
  const toolbar = sendButton.closest('[role="toolbar"], .btC');

  try {
    if (toolbar) {
      // Try to insert at the beginning of toolbar
      const firstElement = toolbar.querySelector('div');
      if (firstElement) {
        toolbar.insertBefore(toggleButton, firstElement);
      } else {
        toolbar.appendChild(toggleButton);
      }
      console.log('📧 Tracking toggle added to toolbar');
    } else {
      // Fallback: insert into send button's container
      const container = sendButton.closest('div');
      if (container) {
        container.insertBefore(toggleButton, container.firstChild);
      } else {
        // Last resort: append to compose window
        composeWindow.appendChild(toggleButton);
      }
      console.log('📧 Tracking toggle added to container');
    }
  } catch (error) {
    console.error('📧 Error inserting tracking toggle:', error);
    // Final fallback: try appending to compose window footer
    try {
      const footer = composeWindow.querySelector('[role="toolbar"]');
      if (footer) {
        footer.appendChild(toggleButton);
        console.log('📧 Tracking toggle added to footer (fallback)');
      }
    } catch (e) {
      console.error('📧 Failed all insertion attempts:', e);
    }
  }

  // Add event listener to checkbox
  const checkbox = toggleButton.querySelector('#trackingCheckbox');
  if (checkbox) {
    checkbox.addEventListener('change', (e) => {
      trackingEnabled = e.target.checked;
      console.log('📧 Tracking:', trackingEnabled ? 'ENABLED' : 'DISABLED');
    });
  }

  // Intercept send button clicks
  interceptSendButton(composeWindow, sendButton);
}

/**
 * Intercept the send button to inject tracking pixel
 */
function interceptSendButton(composeWindow, sendButton) {
  // Clone and replace send button to remove Gmail's event listeners
  const newSendButton = sendButton.cloneNode(true);
  sendButton.parentNode.replaceChild(newSendButton, sendButton);

  newSendButton.addEventListener('click', async (e) => {
    if (trackingEnabled) {
      e.preventDefault();
      e.stopPropagation();

      await injectTrackingPixel(composeWindow);

      // Small delay to ensure pixel is injected
      setTimeout(() => {
        // Trigger Gmail's original send by clicking the button again
        const actualSendButton = composeWindow.querySelector('[role="button"][data-tooltip*="Send"], [aria-label*="Send"]');
        if (actualSendButton && actualSendButton !== newSendButton) {
          actualSendButton.click();
        } else {
          // Fallback: simulate keyboard shortcut (Ctrl/Cmd + Enter)
          const event = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            ctrlKey: !navigator.platform.includes('Mac'),
            metaKey: navigator.platform.includes('Mac'),
            bubbles: true
          });
          composeWindow.dispatchEvent(event);
        }
      }, 100);
    }
  }, true);
}

/**
 * Inject tracking pixel into email body
 */
async function injectTrackingPixel(composeWindow) {
  try {
    // Extract email details
    const recipient = getRecipient(composeWindow);
    const subject = getSubject(composeWindow);

    if (!recipient) {
      showNotification(composeWindow, '⚠️ Could not detect recipient', 'error');
      return;
    }

    console.log('📧 Email details:', { recipient, subject });

    // Request tracking pixel from backend
    const response = await fetch(`${CONFIG.BACKEND_URL}${CONFIG.ENDPOINTS.GENERATE_PIXEL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailSubject: subject || '(No subject)',
        recipient: recipient
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate tracking pixel');
    }

    const data = await response.json();
    const pixelUrl = `${CONFIG.BACKEND_URL}${data.pixelUrl}`;

    console.log('📧 Tracking pixel URL:', pixelUrl);

    // Insert pixel into email body
    const emailBody = composeWindow.querySelector('[role="textbox"][aria-label*="Message"]');

    if (emailBody) {
      // Create tracking pixel HTML
      const pixelHtml = `<img src="${pixelUrl}" width="1" height="1" style="display:none;" alt="" />`;

      // Insert at the end of the email
      emailBody.innerHTML += pixelHtml;

      showNotification(composeWindow, '✅ Tracking enabled', 'success');

      // Store tracking info
      chrome.storage.local.get(['trackedEmails'], (result) => {
        const tracked = result.trackedEmails || [];
        tracked.push({
          trackingId: data.trackingId,
          recipient,
          subject,
          sentAt: new Date().toISOString()
        });
        chrome.storage.local.set({ trackedEmails: tracked });
      });
    } else {
      throw new Error('Could not find email body');
    }

  } catch (error) {
    console.error('❌ Error injecting tracking pixel:', error);
    showNotification(composeWindow, '❌ Tracking failed', 'error');
  }
}

/**
 * Extract recipient email from compose window
 */
function getRecipient(composeWindow) {
  // Gmail stores recipients as email chips/bubbles
  // Try multiple strategies to extract recipient emails

  // Strategy 1: Look for recipient chips with email attributes
  const recipientChips = composeWindow.querySelectorAll('[email], [data-hovercard-id*="@"]');
  if (recipientChips.length > 0) {
    const emails = Array.from(recipientChips)
      .map(chip => chip.getAttribute('email') || chip.getAttribute('data-hovercard-id') || chip.textContent)
      .filter(email => email && email.includes('@'))
      .map(email => {
        const match = email.match(/[\w.-]+@[\w.-]+\.\w+/);
        return match ? match[0] : null;
      })
      .filter(Boolean);

    if (emails.length > 0) return emails.join(', ');
  }

  // Strategy 2: Look for contenteditable To field and extract emails
  const toField = composeWindow.querySelector('[aria-label="To"], [aria-label="Recipients"]');
  if (toField) {
    const text = toField.textContent || '';
    const emails = text.match(/[\w.-]+@[\w.-]+\.\w+/g);
    if (emails && emails.length > 0) return emails.join(', ');
  }

  // Strategy 3: Look for input fields
  const inputField = composeWindow.querySelector('input[name="to"]');
  if (inputField && inputField.value) {
    const emails = inputField.value.match(/[\w.-]+@[\w.-]+\.\w+/g);
    if (emails && emails.length > 0) return emails.join(', ');
  }

  return null;
}

/**
 * Extract subject from compose window
 */
function getSubject(composeWindow) {
  const subjectField = composeWindow.querySelector('[name="subjectbox"], [aria-label*="Subject"]');
  return subjectField ? (subjectField.value || subjectField.textContent || '').trim() : '(No subject)';
}

/**
 * Show notification in compose window
 */
function showNotification(composeWindow, message, type = 'success') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: ${type === 'success' ? '#4caf50' : '#f44336'};
    color: white;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 10000;
    font-size: 14px;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Re-check periodically for new compose windows
setInterval(checkForComposeWindow, 2000);
