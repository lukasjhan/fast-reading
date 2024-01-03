import React, { useState, useEffect } from 'react';

const FastReadingApp = () => {
  const [text, setText] = useState('');
  const [wpm, setWpm] = useState(600);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const words = text.split(/\s+/);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  return (
    <div className="wrapper">
      <div className="title">Fast Reading v1.0</div>
      <div className="reading-wrapper">
        <div className={isReading && isFullscreen ? 'fullscreen' : 'reading'}>
          {isReading ? <p>{words[currentWordIndex]}</p> : null}
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
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your text here"
        disabled={isReading}
      />
    </div>
  );
};

export default FastReadingApp;
