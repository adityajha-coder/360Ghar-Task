import { useState } from "react";
import SearchBar from "./SearchBar";
import FilterTags from "./FilterTags";

export default function HeroSection({
  onSearch,
  isSearching,
  searchQuery,
  followUpQuestion,
  onFollowUpSubmit,
  onDismissFollowUp,
  filters,
  onRemoveFilter,
  searchError,
}) {
  const [followUpAnswer, setFollowUpAnswer] = useState("");

  const handleFollowUpSubmit = (e) => {
    e.preventDefault();
    if (!followUpAnswer.trim()) return;

    onFollowUpSubmit(followUpAnswer.trim());
    setFollowUpAnswer("");
  };

  return (
    <section className="search-section">
      <div className="container">
        <h1 className="search-section__title">Find your home in Gurgaon</h1>
        <p className="search-section__subtitle">
          Describe what you are looking for in plain language. Our AI will understand your requirements and find the best matches.
        </p>

        <SearchBar onSearch={onSearch} isSearching={isSearching} initialQuery={searchQuery} />

        {followUpQuestion && (
          <div className="follow-up-bubble fade-in">
            <div className="follow-up-bubble__question">
              <span className="follow-up-bubble__badge">AI Agent</span>
              <p className="follow-up-bubble__text">{followUpQuestion}</p>
            </div>
            <form onSubmit={handleFollowUpSubmit} className="follow-up-bubble__form">
              <input
                type="text"
                placeholder="Clarify your criteria..."
                value={followUpAnswer}
                onChange={(e) => setFollowUpAnswer(e.target.value)}
                className="follow-up-bubble__input"
                required
                autoComplete="off"
              />
              <button type="submit" className="follow-up-bubble__submit">
                Refine
              </button>
              <button type="button" onClick={onDismissFollowUp} className="follow-up-bubble__dismiss">
                Dismiss
              </button>
            </form>
          </div>
        )}

        {filters && <FilterTags filters={filters} onRemoveFilter={onRemoveFilter} />}

        {searchError && <div className="error-banner">{searchError}</div>}
      </div>
    </section>
  );
}
