// AU Spark Transcript Importer - Popup Script

document.addEventListener('DOMContentLoaded', () => {
  const statusEl = document.getElementById('status');
  const openBtn = document.getElementById('openAuSpark');
  const crossCheckerBtn = document.getElementById('goToCrossChecker');

  // Check for existing transcript
  chrome.runtime.sendMessage({ type: 'GET_TRANSCRIPT' }, (response) => {
    if (response && response.transcript) {
      const t = response.transcript;
      statusEl.textContent = `${t.student.id} - ${t.semesters.length} semesters`;
      statusEl.classList.add('success');
    }
  });

  // Open AU Spark
  openBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://auspark.au.edu' });
    window.close();
  });

  // Go to Cross Checker
  crossCheckerBtn.addEventListener('click', async () => {
    // Try to find existing Cross Checker tab
    const tabs = await chrome.tabs.query({});
    
    for (const tab of tabs) {
      if (tab.url && (tab.url.includes('localhost:3000') || tab.url.includes('testing'))) {
        await chrome.tabs.update(tab.id, { active: true });
        await chrome.windows.update(tab.windowId, { focused: true });
        window.close();
        return;
      }
    }
    
    // No existing tab, open new one
    chrome.tabs.create({ url: 'http://localhost:3000/testing' });
    window.close();
  });
});
