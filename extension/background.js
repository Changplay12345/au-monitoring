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
    const auSparkTabId = sender.tab?.id;
    
    // Find and notify Cross Checker tabs, then close AU Spark tab
    notifyCrossCheckerTabs(message.transcript).then((sent) => {
      console.log('[AU Spark Extension] Transcript sent to Cross Checker:', sent);
      
      if (sent && message.closeTab && auSparkTabId) {
        // Focus Cross Checker tab first
        focusCrossCheckerTab().then(() => {
          // Then close AU Spark tab
          setTimeout(() => {
            chrome.tabs.remove(auSparkTabId).catch(e => {
              console.log('[AU Spark Extension] Could not close tab:', e);
            });
          }, 300);
        });
      }
      
      sendResponse({ success: sent });
    });
    
    return true; // Keep channel open for async response
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

// Find and notify Cross Checker tabs - returns true if at least one tab received the data
async function notifyCrossCheckerTabs(transcript) {
  let sentToAny = false;
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
          console.log('[AU Spark Extension] Sent transcript to tab:', tab.id, tab.url);
          sentToAny = true;
          crossCheckerTabId = tab.id; // Remember this tab
        } catch (e) {
          console.log('[AU Spark Extension] Tab', tab.id, 'did not receive message:', e.message);
        }
      }
    }
  } catch (e) {
    console.error('[AU Spark Extension] Error notifying tabs:', e);
  }
  return sentToAny;
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
