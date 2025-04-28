import { MESSAGE_TYPES } from './constants/messageTypes';

function getArticleText() {
  const article = document.querySelector('article');
  if (article) return article.innerText;

  // fallback
  const paragraphs = Array.from(document.querySelectorAll('p'));
  return paragraphs.map((p) => p.innerText).join('\n');
}

// Function to get all text nodes from the page
function getAllTextNodes() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        // Skip script and style tags
        if (node.parentElement.tagName === 'SCRIPT' || 
            node.parentElement.tagName === 'STYLE') {
          return NodeFilter.FILTER_REJECT;
        }
        // Skip empty text nodes
        if (!node.textContent.trim()) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const textNodes = [];
  let node;
  while ((node = walker.nextNode()) !== null) {
    textNodes.push({
      text: node.textContent.trim(),
      node: node
    });
  }
  return textNodes;
}

// Function to split text nodes into batches
function splitIntoBatches(textNodes, batchSize = 20) {
  const batches = [];
  for (let i = 0; i < textNodes.length; i += batchSize) {
    batches.push(textNodes.slice(i, i + batchSize));
  }
  return batches;
}

// Function to update text nodes with translations
function updateTextNodes(translations) {
  translations.forEach(({ originalText, translatedText }) => {
    const textNodes = getAllTextNodes();
    const matchingNode = textNodes.find(node => node.text === originalText);
    if (matchingNode) {
      matchingNode.node.textContent = translatedText;
    }
  });
}

// Listen for messages from the sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === MESSAGE_TYPES.GET_ARTICLE_TEXT) {
    const text = getArticleText();
    sendResponse({ text });
  } else if (message.type === MESSAGE_TYPES.START_TRANSLATION) {
    const textNodes = getAllTextNodes();
    const batches = splitIntoBatches(textNodes);
    
    // Process each batch
    batches.forEach((batch, index) => {
      const textsToTranslate = batch.map(node => node.text);
      
      // Send batch to background script for translation
      chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.TRANSLATE_BATCH,
        batchIndex: index,
        texts: textsToTranslate
      }, (response) => {
        if (response && response.translations) {
          updateTextNodes(response.translations);
        }
      });
    });
  }
});
