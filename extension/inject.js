// AU Spark Transcript Importer - Inject Script
// This script runs on the Cross Checker page (localhost) to receive transcript data

(function() {
  'use strict';

  console.log('[AU Spark Extension] Inject script loaded on Cross Checker page');

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[AU Spark Extension] Received message:', message.type);

    if (message.type === 'TRANSCRIPT_DATA') {
      // Dispatch custom event that the React app can listen to
      const event = new CustomEvent('au-spark-transcript', {
        detail: message.transcript
      });
      window.dispatchEvent(event);
      
      // Also store in localStorage as backup
      localStorage.setItem('au-spark-transcript', JSON.stringify({
        timestamp: Date.now(),
        transcript: message.transcript,
        source: 'au-spark-extension'
      }));

      console.log('[AU Spark Extension] Transcript data dispatched to page');
      sendResponse({ success: true });
    }

    return true;
  });

  // Register this tab with background script
  chrome.runtime.sendMessage({ type: 'REGISTER_CROSS_CHECKER' });

  // Check if there's pending transcript data in localStorage
  const stored = localStorage.getItem('au-spark-transcript');
  if (stored) {
    try {
      const data = JSON.parse(stored);
      // Only use if less than 5 minutes old
      if (Date.now() - data.timestamp < 5 * 60 * 1000) {
        console.log('[AU Spark Extension] Found recent transcript in localStorage');
        
        // Dispatch after a short delay to let React mount
        setTimeout(() => {
          const event = new CustomEvent('au-spark-transcript', {
            detail: data.transcript
          });
          window.dispatchEvent(event);
        }, 1000);
      }
    } catch (e) {
      console.error('[AU Spark Extension] Error parsing stored transcript:', e);
    }
  }

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
