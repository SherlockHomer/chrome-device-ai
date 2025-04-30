import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import 'nes.css/css/nes.min.css';
import './sidepanel.css';
import {
  addToCalendar,
  extractAirDropEvent,
  getSummaryFromPrompt
} from './utils/ai';
import { MESSAGE_TYPES } from './constants/messageTypes';

const Sidepanel = () => {
  const [loading, setLoading] = useState(false);
  const [articleSummary, setArticleSummary] = useState('');
  const [eventText, setEventText] = useState('');
  const articleSummaryRef = useRef(null);
  const eventTextRef = useRef(null);
  const isScrollingRef = useRef(false);
  const scrollTimerRef = useRef(null);

  useEffect(() => {
    const handleScrollStart = () => {
      isScrollingRef.current = true;

      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }

      scrollTimerRef.current = setTimeout(() => {
        isScrollingRef.current = false;
        if (articleSummaryRef.current)
          adjustTextareaHeight(articleSummaryRef.current);
        if (eventTextRef.current) adjustTextareaHeight(eventTextRef.current);
      }, 150);
    };

    window.addEventListener('scroll', handleScrollStart, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScrollStart);
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
      chrome.runtime.sendMessage({ type: MESSAGE_TYPES.SIDEPANEL_CLOSED });
    };
  }, []);

  const adjustTextareaHeight = (textarea) => {
    if (isScrollingRef.current) return;

    if (textarea) {
      const scrollPos = window.scrollY;

      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;

      window.scrollTo(0, scrollPos);
    }
  };

  useEffect(() => {
    if (articleSummaryRef.current) {
      adjustTextareaHeight(articleSummaryRef.current);
    }
  }, [articleSummary]);

  useEffect(() => {
    if (eventTextRef.current) {
      adjustTextareaHeight(eventTextRef.current);
    }
  }, [eventText]);

  const handleSummarize = async () => {
    try {
      if (loading) return;
      setLoading(true);
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      });

      const response = await chrome.tabs.sendMessage(tab.id, {
        type: MESSAGE_TYPES.GET_ARTICLE_TEXT
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

  const handleTranslate = async () => {
    try {
      if (loading) return;
      setLoading(true);
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      });

      await chrome.tabs.sendMessage(tab.id, {
        type: MESSAGE_TYPES.START_TRANSLATION
      });
    } catch (error) {
      console.error('Error starting translation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHide = () => {
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
          className="nes-btn is-warning"
          onClick={handleTranslate}
          disabled={loading}
        >
          Translate Page
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
