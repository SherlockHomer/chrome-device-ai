import { MESSAGE_TYPES } from './constants/messageTypes';

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Create a singleton translator instance
let translatorInstance = null;

async function getTranslator() {
  if (!translatorInstance) {
    translatorInstance = await ai.translator.create({
      sourceLanguage: 'en',
      targetLanguage: 'zh'
    });
  }
  return translatorInstance;
}

async function destroyTranslator() {
  if (translatorInstance) {
    try {
      await translatorInstance.destroy();
      translatorInstance = null;
    } catch (error) {
      console.error('Error destroying translator:', error);
    }
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === MESSAGE_TYPES.TRANSLATE_BATCH) {
    handleTranslation(message.texts, message.batchIndex)
      .then((translations) => {
        sendResponse({ translations });
      })
      .catch((error) => {
        console.error('Translation error:', error);
        sendResponse({ error: error.message });
      });
    return true; // Keep the message channel open for async response
  } else if (message.type === MESSAGE_TYPES.SIDEPANEL_CLOSED) {
    destroyTranslator();
  }
});

async function handleTranslation(texts, batchIndex) {
  try {
    const translator = await getTranslator();
    const translations = await Promise.all(
      texts.map(async (text) => {
        try {
          const result = await translator.translate(text);
          return {
            originalText: text,
            translatedText: result
          };
        } catch (error) {
          console.error(error);
          return {
            originalText: text,
            translatedText: 'translate error'
          };
        }
      })
    );
    return translations;
  } catch (error) {
    console.error(`Error translating batch ${batchIndex}:`, error);
    throw error;
  }
}
