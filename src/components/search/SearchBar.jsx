import { useState, useEffect } from "react";

export default function SearchBar({ onSearch, isSearching, initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState("");

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed && !isSearching) {
      onSearch(trimmed);
    }
  };

  const handleVoiceClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser. Please use Chrome, Safari, or Edge.");
      return;
    }

    setMicError("");

    if (isListening) {
      try {
        window._recognition?.stop();
      } catch (err) {
        console.error("Error stopping recognition:", err);
      }
      setIsListening(false);
      return;
    }

    if (window._recognition) {
      try {
        window._recognition.abort();
      } catch (err) {
        console.error("Error aborting previous instance:", err);
      }
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setIsListening(true);
      setQuery("");
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setIsListening(false);
      if (e.error === "not-allowed") {
        setMicError("Microphone access denied. Please enable mic permissions in your browser.");
      } else if (e.error === "no-speech") {
        setMicError("No speech detected. Please try speaking again.");
      } else {
        setMicError(`Voice search error: ${e.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const transcript = finalTranscript || interimTranscript;
      setQuery(transcript);

      if (finalTranscript.trim()) {
        onSearch(finalTranscript.trim());
      }
    };

    window._recognition = recognition;
    
    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setMicError("Could not start voice listener.");
      setIsListening(false);
    }
  };

  return (
    <div className="search-bar">
      <form className="search-bar__form" onSubmit={handleSubmit}>
        <input
          id="search-input"
          className="search-bar__input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isListening ? "Listening... speak now..." : "Describe your ideal home in Gurgaon..."}
          disabled={isSearching}
          autoComplete="off"
        />
        
        <button
          type="button"
          onClick={handleVoiceClick}
          className={`search-bar__mic-btn ${isListening ? "search-bar__mic-btn--listening" : ""}`}
          title={isListening ? "Listening... Click to stop" : "Voice Search"}
          disabled={isSearching}
        >
          {isListening ? "Listening" : "Speak"}
        </button>

        <button
          id="search-submit"
          className="search-bar__submit"
          type="submit"
          disabled={isSearching || !query.trim()}
        >
          Search
        </button>
      </form>

      {micError && (
        <div className="search-bar__mic-error fade-in">
          {micError}
        </div>
      )}

      {isSearching && (
        <div className="search-bar__loading">
          <span>Parsing your query</span>
          <span className="search-bar__dot" />
          <span className="search-bar__dot" />
          <span className="search-bar__dot" />
        </div>
      )}
    </div>
  );
}
