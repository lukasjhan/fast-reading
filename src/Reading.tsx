import React, { useState, useEffect, useRef } from 'react';

const FastReadingApp = () => {
  const [text, setText] = useState('');
  const [wpm, setWpm] = useState(550);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const words = text.split(/\s+/);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timer;
    if (isReading && currentWordIndex < words.length) {
      const wordDuration = 60000 / wpm; // Convert WPM to millisecond interval
      interval = setInterval(() => {
        setCurrentWordIndex((index) => {
          if (index + 1 >= words.length) {
            setIsReading(false); // Stop reading if it's the last word
            return index;
          }
          return index + 1;
        });
      }, wordDuration);
    }

    return () => clearInterval(interval);
  }, [isReading, currentWordIndex, words.length, wpm]);

  useEffect(() => {
    const handleKeyPress = (event: any) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        if (textAreaRef.current) {
          saveDataToUrl(textAreaRef.current.value);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const encodedData = queryParams.get('data');

    if (encodedData) {
      try {
        const decodedData = decodeURIComponent(atob(encodedData));
        if (textAreaRef.current) {
          textAreaRef.current.value = decodedData;
        }
      } catch (error) {
        console.error('Invalid Base64 data in URL:', error);
      }
    }
  }, []);

  const handleStart = () => {
    setIsReading(true);
    setCurrentWordIndex(0);
  };

  const handleStop = () => {
    setIsReading(false);
    setCurrentWordIndex(0);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const emphasizeRandomLetter = (word: string) => {
    if (word.length === 0)
      return { beforePart: '', emphasizedLetter: '', afterPart: '' };

    const endsWithPeriod = word.endsWith('.');
    const effectiveLength = endsWithPeriod ? word.length - 1 : word.length;

    const center = Math.floor(effectiveLength / 2);
    const range = Math.floor(effectiveLength / 4);

    const startIndex = Math.max(center - range, 0);
    const endIndex = Math.min(center + range, word.length - 1);

    const randomIndex =
      Math.floor(Math.random() * (endIndex - startIndex + 1)) + startIndex;
    const emphasizedLetter = word[randomIndex];
    const beforePart = word.substring(0, randomIndex);
    const afterPart = word.substring(randomIndex + 1);

    return { beforePart, emphasizedLetter, afterPart };
  };

  const wordCount = text.split(/\s+/).filter((word) => word).length;
  const time = (wordCount / wpm) * 60;

  const saveDataToUrl = (text: string) => {
    const base64Encoded = btoa(encodeURIComponent(text));
    const newUrl = `${window.location.pathname}?data=${base64Encoded}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    navigator.clipboard.writeText(newUrl).then(
      function () {
        console.log('Async: Copying to clipboard was successful!');
      },
      function (err) {
        console.error('Async: Could not copy text: ', err);
      }
    );
  };

  return (
    <div className="wrapper">
      <div className="title">Fast Reading v1.0</div>
      <div className="reading-wrapper">
        <div className={isReading && isFullscreen ? 'fullscreen' : 'reading'}>
          {isReading && (
            <div className="word-container">
              {(() => {
                const { beforePart, emphasizedLetter, afterPart } =
                  emphasizeRandomLetter(words[currentWordIndex]);
                return (
                  <>
                    <span className="before-part">{beforePart}</span>
                    <span className="emphasized">{emphasizedLetter}</span>
                    <span className="after-part">{afterPart}</span>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
      <div className="wpm">
        <label>
          WPM:
          <input
            type="number"
            value={wpm}
            onChange={(e) => setWpm(Number(e.target.value))}
            disabled={isReading}
          />
        </label>
        <div>
          {!isReading && (
            <button onClick={handleStart} disabled={isReading}>
              Start
            </button>
          )}
          {isReading && (
            <button onClick={handleStop} disabled={!isReading}>
              Stop
            </button>
          )}
          <button onClick={toggleFullscreen}>
            {isFullscreen ? 'Disable Fullscreen' : 'Enable Fullscreen'}
          </button>
        </div>
      </div>
      <textarea
        ref={textAreaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your text here"
        disabled={isReading}
      />
      <div>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
          }}
        >
          <span>
            <b>Word Count:</b> {wordCount}
          </span>
          <span>
            <b>ETR:</b> {time.toFixed(2)} sec
          </span>
        </div>
      </div>
    </div>
  );
};

export default FastReadingApp;
