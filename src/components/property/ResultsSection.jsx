import PropertyCard from "./PropertyCard";

export default function ResultsSection({
  results,
  isSearching,
  searchQuery,
  shareCopied,
  onShare,
  onPropertyClick,
  onCompareToggle,
  compareList,
}) {
  const displayResults = results || [];

  return (
    <section className="results-section" id="results-section">
      <div className="container">
        {results !== null && (
          <>
            <div className="results-header">
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span className="results-header__count">
                  {displayResults.length} {displayResults.length === 1 ? "property" : "properties"} found
                </span>
                <button onClick={onShare} className="results-header__share-btn" title="Copy shareable link to clipboard">
                  {shareCopied ? "Copied!" : "Share Search"}
                </button>
              </div>
              {searchQuery && <span className="results-header__query">&ldquo;{searchQuery}&rdquo;</span>}
            </div>

            {displayResults.length > 0 ? (
              <div className="results-grid">
                {displayResults.map((property, i) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onClick={onPropertyClick}
                    onCompareToggle={onCompareToggle}
                    isComparing={compareList.some((p) => p.id === property.id)}
                    animationDelay={i * 60}
                  />
                ))}
              </div>
            ) : (
              <div className="results-empty">
                <p className="results-empty__title">No properties matched</p>
                <p className="results-empty__text">Try broadening your search criteria or using different terms.</p>
              </div>
            )}
          </>
        )}

        {results === null && !isSearching && (
          <div className="results-empty" style={{ paddingTop: "var(--space-4)" }}>
            <p className="results-empty__text" style={{ color: "var(--color-text-muted)" }}>
              Try searching for "2BHK in Sector 50 under 80 lakhs" or "luxury villa near Golf Course Road"
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
