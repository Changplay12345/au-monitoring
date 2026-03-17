// AU Spark Transcript Importer - Content Script
// This script runs on AU Spark pages and scrapes transcript data

(function() {
  'use strict';

  // Configuration
  const TRANSCRIPT_PAGE_PATTERNS = [
    /grade/i,
    /transcript/i,
    /result/i,
    /record/i
  ];

  // Check if we're on a transcript/grade page
  function isTranscriptPage() {
    const url = window.location.href.toLowerCase();
    return TRANSCRIPT_PAGE_PATTERNS.some(pattern => pattern.test(url));
  }

  // Parse transcript data from page text (same logic as PDF parser)
  function parseTranscriptText(text) {
    // Extract student ID (first 7-digit number)
    const idMatch = text.match(/\b(\d{7})\b/);
    if (!idMatch) return null;

    // Extract name (uppercase line)
    const nameMatch = text.match(/\n([A-Z][A-Z\s]{3,}[A-Z])\n/);

    // Extract major
    const majorMatch = text.match(/([A-Z][A-Z\s]*ENGINEERING)(?:\s|$)/);

    // Split by semester labels
    const semesterLabels = text.match(/SEMESTER\s+\d\/\d{4}/g) || [];
    const semesterSections = text.split(/SEMESTER\s+\d\/\d{4}/);

    const semesters = [];

    for (let i = 0; i < semesterLabels.length; i++) {
      const section = semesterSections[i + 1] || '';
      // Match course code (2-4 uppercase + 4 digits) followed by credits
      const courseMatches = [...section.matchAll(/([A-Z]{2,4}\d{4})\s+.*?(\d)\s*CR\./g)];

      const courses = courseMatches.map(m => ({
        code: m[1],
        credits: parseInt(m[2]),
      }));

      if (courses.length > 0) {
        semesters.push({ semesterLabel: semesterLabels[i], courses });
      }
    }

    // Calculate total credits
    const totalCredits = semesters.reduce(
      (sum, sem) => sum + sem.courses.reduce((s, c) => s + c.credits, 0),
      0
    );

    return {
      student: {
        name: nameMatch ? nameMatch[1].trim() : 'Unknown',
        id: idMatch[1],
        major: majorMatch ? majorMatch[1].trim() : 'Unknown',
        totalCredits,
      },
      semesters,
    };
  }

  // Scrape the current page
  function scrapeTranscript() {
    const pageText = document.body.innerText;
    console.log('[AU Spark Extension] Page text (first 500 chars):', pageText.substring(0, 500));
    
    const parsed = parseTranscriptText(pageText);
    
    if (parsed && parsed.semesters.length > 0) {
      console.log('[AU Spark Extension] Parsed transcript:', parsed);
      return parsed;
    }
    
    return null;
  }

  // Send data to the web app via background script
  function sendToWebApp(transcript, closeAfter = true) {
    console.log('[AU Spark Extension] Sending transcript to background script...');
    
    // Send message to background script which will relay to Cross Checker tab
    chrome.runtime.sendMessage({
      type: 'TRANSCRIPT_SCRAPED',
      transcript: transcript,
      closeTab: closeAfter
    }, (response) => {
      console.log('[AU Spark Extension] Background script response:', response);
      if (response && response.success && closeAfter) {
        // Close this tab after a short delay
        setTimeout(() => {
          window.close();
        }, 500);
      }
    });

    return true;
  }

  // Create floating import button on AU Spark pages
  function createImportButton() {
    // Remove existing button if any
    const existing = document.getElementById('au-spark-import-btn');
    if (existing) existing.remove();

    const btn = document.createElement('button');
    btn.id = 'au-spark-import-btn';
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
      Import to Cross Checker
    `;
    btn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
      transition: all 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    btn.onmouseover = () => {
      btn.style.transform = 'translateY(-2px)';
      btn.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.5)';
    };
    btn.onmouseout = () => {
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.4)';
    };

    btn.onclick = () => {
      btn.disabled = true;
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; animation: spin 1s linear infinite;">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
        </svg>
        Importing...
      `;

      const transcript = scrapeTranscript();
      
      if (transcript) {
        sendToWebApp(transcript, true); // true = close tab after
        btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Imported! Closing...
        `;
        btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        btn.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
      } else {
        btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          No transcript found
        `;
        btn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        btn.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
        
        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            Import to Cross Checker
          `;
          btn.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
          btn.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.4)';
        }, 3000);
      }
    };

    // Add spin animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(btn);
  }

  // Initialize
  function init() {
    console.log('[AU Spark Extension] Content script loaded on:', window.location.href);
    
    // Always show the import button on AU Spark pages
    // User can click it when they're on the right page
    createImportButton();

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'SCRAPE_NOW') {
        const transcript = scrapeTranscript();
        sendResponse({ success: !!transcript, transcript });
      }
      return true;
    });
  }

  // Wait for page to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
