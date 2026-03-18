// AU Spark Transcript Importer - Background Service Worker
// Handles communication between content script and web app

// Store the latest transcript data
let latestTranscript = null;
let crossCheckerTabId = null;

// Save transcript to chrome.storage for cross-context access
function saveTranscriptToStorage(transcript) {
  chrome.storage.local.set({
    'au-spark-transcript': {
      timestamp: Date.now(),
      transcript: transcript,
      source: 'au-spark-extension'
    }
  }, () => {
    console.log('[AU Spark Extension] Transcript saved to chrome.storage');
  });
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[AU Spark Extension] Background received:', message.type);

  if (message.type === 'TRANSCRIPT_SCRAPED') {
    latestTranscript = message.transcript;
    const auSparkTabId = sender.tab?.id;
    
    // Save to storage first
    saveTranscriptToStorage(message.transcript);
    
    // Find Cross Checker tabs and inject the data directly
    injectTranscriptIntoCrossChecker(message.transcript).then((sent) => {
      console.log('[AU Spark Extension] Transcript injected into Cross Checker:', sent);
      
      if (message.closeTab && auSparkTabId) {
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

// Inject transcript data directly into Cross Checker tabs using chrome.scripting
async function injectTranscriptIntoCrossChecker(transcript) {
  let sentToAny = false;
  try {
    const tabs = await chrome.tabs.query({});
    
    for (const tab of tabs) {
      if (tab.url && (
        tab.url.includes('localhost') ||
        tab.url.includes('vercel.app')
      )) {
        try {
          // Use chrome.scripting to inject code that dispatches the event
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (transcriptData) => {
              console.log('[AU Spark Extension] Injecting transcript via executeScript');
              // Dispatch custom event
              const event = new CustomEvent('au-spark-transcript', {
                detail: transcriptData
              });
              window.dispatchEvent(event);
              // Also save to localStorage with the key the site polls for
              localStorage.setItem('sparkTranscriptData', JSON.stringify(transcriptData));
              console.log('[AU Spark Extension] Transcript injected successfully');
            },
            args: [transcript]
          });
          console.log('[AU Spark Extension] Injected transcript into tab:', tab.id, tab.url);
          sentToAny = true;
          crossCheckerTabId = tab.id;
        } catch (e) {
          console.log('[AU Spark Extension] Could not inject into tab', tab.id, ':', e.message);
        }
      }
    }
  } catch (e) {
    console.error('[AU Spark Extension] Error injecting transcript:', e);
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
        tab.url.includes('course-cross-checker')
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
  chrome.tabs.create({ url: 'https://auspark.au.edu/grade' });
});

// Allow external connections from our web app
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log('[AU Spark Extension] External message from:', sender.origin);

  if (message.type === 'PING') {
    sendResponse({ success: true, version: '1.0.0' });
  }

  if (message.type === 'OPEN_AU_SPARK') {
    chrome.tabs.create({ url: 'https://auspark.au.edu/grade' });
    sendResponse({ success: true });
  }

  if (message.type === 'GET_TRANSCRIPT') {
    sendResponse({ transcript: latestTranscript });
  }

  return true;
});

console.log('[AU Spark Extension] Background service worker started');
