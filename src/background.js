chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_ARTICLE_TEXT') {
    // Handle the article text request
    console.log('Received article text:', message.text);
    // You can store the text or process it further here
    sendResponse({ success: true });
  }
  return true; // Keep the message channel open for async response
});
