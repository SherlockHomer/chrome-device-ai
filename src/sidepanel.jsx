import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import 'nes.css/css/nes.min.css';
import './sidepanel.css';
import {
  addToCalendar,
  extractAirDropEvent,
  getSummaryFromPrompt
} from './utils/ai';

const Sidepanel = () => {
  const [loading, setLoading] = useState(false);
  const [articleSummary, setArticleSummary] = useState('');
  const [eventText, setEventText] = useState('');
  const articleSummaryRef = useRef(null);
  const eventTextRef = useRef(null);

  const adjustTextareaHeight = (textarea) => {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight(articleSummaryRef.current);
  }, [articleSummary]);

  useEffect(() => {
    adjustTextareaHeight(eventTextRef.current);
  }, [eventText]);

  const handleSummarize = async () => {
    try {
      if (loading) return;
      setLoading(true);
      // Get the current active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      });

      // Send message to content script to get article text
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: 'GET_ARTICLE_TEXT'
      });

      if (response && response.text) {
        setEventText('');
        setArticleSummary('');
        const { session, stream } = await getSummaryFromPrompt(response.text);
        let accumulatedText = '';
        for await (const chunk of stream) {
          accumulatedText += chunk;
          setArticleSummary(accumulatedText);
        }
        session && session.destroy();
      }
    } catch (error) {
      console.error('Error getting article text:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCalendar = async () => {
    try {
      if (loading) return;
      setLoading(true);
      const { session, stream } = await extractAirDropEvent(articleSummary);
      let event = '';
      for await (const chunk of stream) {
        event += chunk;
        setEventText(event);
      }
      session && session.destroy();

      addToCalendar(event);
    } catch (error) {
      console.error('add Calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHide = () => {
    // TODO: Implement hide functionality
    console.log('Hide clicked');
  };

  return (
    <>
      <h4 className="nes-text">Welcome to Chrome Device AI</h4>
      <div className="button-container">
        <button
          type="button"
          className="nes-btn is-primary"
          onClick={handleSummarize}
          disabled={loading}
        >
          Summarize the article
        </button>
        <button
          type="button"
          className="nes-btn is-success"
          onClick={handleAddToCalendar}
          disabled={loading || !articleSummary}
        >
          Add airdrop time to calendar
        </button>
        <button
          type="button"
          className="nes-btn is-error"
          onClick={handleHide}
          disabled={loading}
        >
          Hide no matter
        </button>
        {loading && <p className="nes-text is-disabled">Responding...</p>}
      </div>
      {eventText && (
        <div className="nes-container is-rounded is-dark">
          <p className="nes-text">Event:</p>
          <textarea
            ref={eventTextRef}
            className="nes-text auto-resize-textarea"
            value={eventText}
            readOnly
          />
        </div>
      )}
      {articleSummary && (
        <div className="nes-container is-rounded is-dark">
          <p className="nes-text">Article Text:</p>
          <textarea
            ref={articleSummaryRef}
            className="nes-text auto-resize-textarea"
            value={articleSummary}
            readOnly
          />
        </div>
      )}
    </>
  );
};

export default Sidepanel;

const root = createRoot(document.getElementById('root'));
root.render(<Sidepanel />);
