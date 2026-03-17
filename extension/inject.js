// AU Spark Transcript Importer - Inject Script
// This script runs on the Cross Checker page (localhost) to receive transcript data

(function() {
  'use strict';

  console.log('[AU Spark Extension] Inject script loaded on:', window.location.href);

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[AU Spark Extension] Inject received message:', message.type, message);

    if (message.type === 'TRANSCRIPT_DATA') {
      console.log('[AU Spark Extension] Transcript data received:', message.transcript);
      
      // Dispatch custom event that the React app can listen to
      const event = new CustomEvent('au-spark-transcript', {
        detail: message.transcript
      });
      window.dispatchEvent(event);
      console.log('[AU Spark Extension] CustomEvent dispatched: au-spark-transcript');
      
      // Also store in localStorage as backup (key the site polls for)
      localStorage.setItem('sparkTranscriptData', JSON.stringify(message.transcript));

      console.log('[AU Spark Extension] Transcript data saved to localStorage');
      sendResponse({ success: true });
      return true;
    }

    sendResponse({ success: false, reason: 'Unknown message type' });
    return true;
  });

  // Register this tab with background script
  chrome.runtime.sendMessage({ type: 'REGISTER_CROSS_CHECKER' }, (response) => {
    console.log('[AU Spark Extension] Registered with background:', response);
  });

  // Check if there's pending transcript data in localStorage
  const stored = localStorage.getItem('sparkTranscriptData');
  if (stored) {
    try {
      const data = JSON.parse(stored);
      console.log('[AU Spark Extension] Found transcript in localStorage');
      
      // Dispatch after a short delay to let React mount
      setTimeout(() => {
        const event = new CustomEvent('au-spark-transcript', {
          detail: data
        });
        window.dispatchEvent(event);
        // Clear after dispatching
        localStorage.removeItem('sparkTranscriptData');
      }, 1000);
    } catch (e) {
      console.error('[AU Spark Extension] Error parsing stored transcript:', e);
    }
  }

  // Poll chrome.storage for transcript data (most reliable cross-tab method)
  let storagePollingInterval = setInterval(() => {
    chrome.storage.local.get(['au-spark-transcript'], (result) => {
      if (result['au-spark-transcript']) {
        const data = result['au-spark-transcript'];
        // Check if data is recent (within last 60 seconds)
        if (data.timestamp && Date.now() - data.timestamp < 60000) {
          console.log('[AU Spark Extension] Found transcript in chrome.storage:', data.transcript);
          
          // Dispatch custom event
          const event = new CustomEvent('au-spark-transcript', {
            detail: data.transcript
          });
          window.dispatchEvent(event);
          
          // Also save to localStorage as backup
          localStorage.setItem('sparkTranscriptData', JSON.stringify(data.transcript));
          
          // Clear the storage after processing
          chrome.storage.local.remove(['au-spark-transcript']);
          
          // Stop polling
          clearInterval(storagePollingInterval);
        }
      }
    });
  }, 1000); // Poll every 1 second

  // Stop polling after 2 minutes to avoid memory leak
  setTimeout(() => {
    clearInterval(storagePollingInterval);
  }, 120000);

  // Expose function for the page to check extension status
  window.__auSparkExtension = {
    isInstalled: true,
    version: '1.0.0',
    openAuSpark: () => {
      chrome.runtime.sendMessage({ type: 'OPEN_AU_SPARK' });
    },
    getTranscript: (callback) => {
      chrome.runtime.sendMessage({ type: 'GET_TRANSCRIPT' }, callback);
    }
  };

  // Dispatch event to notify page that extension is ready
  window.dispatchEvent(new CustomEvent('au-spark-extension-ready'));
})();
