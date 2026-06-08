import { useState, useCallback, useEffect } from "react";
import Header from "./components/layout/Header";
import HeroSection from "./components/search/HeroSection";
import ResultsSection from "./components/property/ResultsSection";
import PropertyDetail from "./components/property/PropertyDetail";
import ComparisonTray from "./components/comparison/ComparisonTray";
import ComparisonModal from "./components/comparison/ComparisonModal";
import ApiKeyModal from "./components/modal/ApiKeyModal";
import { parseSearchQuery } from "./services/llm";
import { filterProperties } from "./services/filterProperties";
import propertiesData from "./data/properties.json";

const MAX_COMPARE = 3;

export default function App() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(null);
  const [results, setResults] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [followUpQuestion, setFollowUpQuestion] = useState(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKey, setApiKey] = useState(
    () => import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem("openrouter_api_key") || ""
  );

  const handleSearch = useCallback(async (query) => {
    const key = import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem("openrouter_api_key");
    if (!key) {
      setShowApiModal(true);
      return;
    }

    setIsSearching(true);
    setSearchError("");
    setSearchQuery(query);

    try {
      const parsedResult = await parseSearchQuery(query);
      setFilters(parsedResult.filters);
      setFollowUpQuestion(parsedResult.followUpQuestion);
      
      if (parsedResult.isFallback) {
        setSearchError(parsedResult.fallbackError);
      } else {
        setSearchError("");
      }

      const filtered = filterProperties(propertiesData, parsedResult.filters);
      setResults(filtered);

      // Sync query to URL for shareable links
      const params = new URLSearchParams(window.location.search);
      params.set("q", query);
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);

      // Scroll down to the results section
      setTimeout(() => {
        const el = document.getElementById("results-section");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setSearchError(err.message || "Search failed. Please try again.");
      setResults(null);
      setFilters(null);
      setFollowUpQuestion(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Pre-fill input if a query was shared in the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryParam = params.get("q");
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, []);

  const handleFollowUpSubmit = useCallback((answer) => {
    if (!answer) return;
    const refinedQuery = `${searchQuery} (${answer})`;
    handleSearch(refinedQuery);
    setFollowUpQuestion(null);
  }, [searchQuery, handleSearch]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy search URL:", err);
      });
  }, []);

  const handleRemoveFilter = useCallback(
    (filterKey) => {
      if (!filters) return;

      const updated = { ...filters };
      if (filterKey.startsWith("keyword-")) {
        const index = parseInt(filterKey.split("-")[1], 10);
        updated.keywords = updated.keywords.filter((_, i) => i !== index);
      } else {
        updated[filterKey] = null;
      }

      setFilters(updated);
      const filtered = filterProperties(propertiesData, updated);
      setResults(filtered);
    },
    [filters]
  );

  const handleCompareToggle = useCallback(
    (property) => {
      setCompareList((prev) => {
        const exists = prev.find((p) => p.id === property.id);
        if (exists) {
          return prev.filter((p) => p.id !== property.id);
        }
        if (prev.length >= MAX_COMPARE) {
          return prev;
        }
        return [...prev, property];
      });
    },
    []
  );

  const handleSaveApiKey = useCallback((key) => {
    localStorage.setItem("openrouter_api_key", key);
    setApiKey(key);
    setShowApiModal(false);
  }, []);

  return (
    <>
      <Header compareCount={compareList.length} onCompareClick={() => setShowComparison(true)} />

      <HeroSection
        onSearch={handleSearch}
        isSearching={isSearching}
        searchQuery={searchQuery}
        followUpQuestion={followUpQuestion}
        onFollowUpSubmit={handleFollowUpSubmit}
        onDismissFollowUp={() => setFollowUpQuestion(null)}
        filters={filters}
        onRemoveFilter={handleRemoveFilter}
        searchError={searchError}
      />

      <ResultsSection
        results={results}
        isSearching={isSearching}
        searchQuery={searchQuery}
        shareCopied={shareCopied}
        onShare={handleShare}
        onPropertyClick={(p) => setSelectedProperty(p)}
        onCompareToggle={handleCompareToggle}
        compareList={compareList}
      />

      {selectedProperty && (
        <PropertyDetail
          property={selectedProperty}
          originalQuery={searchQuery}
          onClose={() => setSelectedProperty(null)}
        />
      )}

      <ComparisonTray
        selectedProperties={compareList}
        onClear={() => setCompareList([])}
        onOpenComparison={() => setShowComparison(true)}
      />

      {showComparison && (
        <ComparisonModal
          properties={compareList}
          onClose={() => setShowComparison(false)}
        />
      )}

      {showApiModal && (
        <ApiKeyModal
          initialKey={apiKey}
          onSave={handleSaveApiKey}
          onClose={() => setShowApiModal(false)}
        />
      )}
    </>
  );
}
