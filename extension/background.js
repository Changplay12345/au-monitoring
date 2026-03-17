// AU Spark Transcript Importer - Background Service Worker
// Handles communication between content script and web app

// Store the latest transcript data
let latestTranscript = null;
let crossCheckerTabId = null;

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[AU Spark Extension] Background received:', message.type);

  if (message.type === 'TRANSCRIPT_SCRAPED') {
    latestTranscript = message.transcript;
    
    // Try to send to Cross Checker tab
    if (crossCheckerTabId) {
      chrome.tabs.sendMessage(crossCheckerTabId, {
        type: 'TRANSCRIPT_DATA',
        transcript: message.transcript
      }).catch(() => {
        // Tab might be closed, clear the ID
        crossCheckerTabId = null;
      });
    }

    // Also try to find any Cross Checker tabs and notify them
    notifyCrossCheckerTabs(message.transcript);
    
    sendResponse({ success: true });
  }

  if (message.type === 'FOCUS_CROSS_CHECKER') {
    focusCrossCheckerTab();
    sendResponse({ success: true });
  }

  if (message.type === 'GET_TRANSCRIPT') {
    sendResponse({ transcript: latestTranscript });
  }

  if (message.type === 'REGISTER_CROSS_CHECKER') {
    crossCheckerTabId = sender.tab?.id;
    console.log('[AU Spark Extension] Cross Checker tab registered:', crossCheckerTabId);
    sendResponse({ success: true });
  }

  return true;
});

// Find and notify Cross Checker tabs
async function notifyCrossCheckerTabs(transcript) {
  try {
    const tabs = await chrome.tabs.query({});
    
    for (const tab of tabs) {
      if (tab.url && (
        tab.url.includes('localhost') ||
        tab.url.includes('vercel.app') ||
        tab.url.includes('testing')
      )) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'TRANSCRIPT_DATA',
            transcript: transcript
          });
          console.log('[AU Spark Extension] Sent transcript to tab:', tab.id);
        } catch (e) {
          // Tab doesn't have our content script, ignore
        }
      }
    }
  } catch (e) {
    console.error('[AU Spark Extension] Error notifying tabs:', e);
  }
}

// Focus the Cross Checker tab
async function focusCrossCheckerTab() {
  try {
    const tabs = await chrome.tabs.query({});
    
    for (const tab of tabs) {
      if (tab.url && (
        tab.url.includes('localhost:3000') ||
        tab.url.includes('testing')
      )) {
        await chrome.tabs.update(tab.id, { active: true });
        await chrome.windows.update(tab.windowId, { focused: true });
        return;
      }
    }
  } catch (e) {
    console.error('[AU Spark Extension] Error focusing tab:', e);
  }
}

// Handle extension icon click - open AU Spark
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: 'http://auspark.au.edu' });
});

// Allow external connections from our web app
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log('[AU Spark Extension] External message from:', sender.origin);

  if (message.type === 'PING') {
    sendResponse({ success: true, version: '1.0.0' });
  }

  if (message.type === 'OPEN_AU_SPARK') {
    chrome.tabs.create({ url: 'http://auspark.au.edu' });
    sendResponse({ success: true });
  }

  if (message.type === 'GET_TRANSCRIPT') {
    sendResponse({ transcript: latestTranscript });
  }

  return true;
});

console.log('[AU Spark Extension] Background service worker started');
