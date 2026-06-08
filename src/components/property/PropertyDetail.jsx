import { useState, useEffect } from "react";
import { generatePropertySummary } from "../../services/llm";

export default function PropertyDetail({ property, originalQuery, onClose }) {
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!property || !originalQuery) return;

    let cancelled = false;
    setAiSummary("");
    setAiError("");
    setAiLoading(true);

    generatePropertySummary(property, originalQuery)
      .then((summary) => {
        if (!cancelled) {
          setAiSummary(summary);
          setAiLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setAiError(err.message || "Failed to generate summary");
          setAiLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [property?.id, originalQuery]);

  if (!property) return null;

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 200);
  };

  const pricePerSqft = Math.round(property.price / property.area).toLocaleString(
    "en-IN"
  );

  const specs = [
    { label: "Type", value: property.type },
    { label: "Configuration", value: `${property.bhk} BHK` },
    { label: "Area", value: `${property.area} sq ft` },
    { label: "Floor", value: property.floor },
    { label: "Facing", value: property.facing },
    { label: "Furnishing", value: property.furnishing },
    { label: "Status", value: property.status },
    { label: "Builder", value: property.builder },
  ];

  return (
    <div className="detail-overlay" id="property-detail-overlay">
      <div className="detail-backdrop" onClick={handleClose} />
      <div className={`detail-panel ${closing ? "detail-panel--closing" : ""}`}>
        <div className="detail__close">
          <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
            Property Details
          </span>
          <button
            id="detail-close-btn"
            className="detail__close-btn"
            onClick={handleClose}
          >
            Close
          </button>
        </div>

        <div className="detail__image-wrap">
          {property.image ? (
            <img
              src={property.image}
              alt={property.title}
              className="detail__image"
            />
          ) : (
            <div
              className="detail__image"
              style={{
                backgroundColor: "var(--color-bg-alt)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "rgba(22, 33, 34, 0.4)",
              }}
            >
              360 View — {property.title}
            </div>
          )}
          <span className="detail__360-label">360 View</span>
        </div>

        <div className="detail__content">
          <h2 className="detail__title">{property.title}</h2>
          <p className="detail__location">
            {property.locality}, {property.sector}, {property.city}
          </p>

          <div className="detail__price-row">
            <span className="detail__price">{property.priceLabel}</span>
            <span className="detail__price-per-sqft">{pricePerSqft} / sq ft</span>
          </div>

          {originalQuery && (
            <div className="detail__ai-summary" id="ai-summary-section">
              <p className="detail__ai-summary-label">AI Match Analysis</p>
              {aiLoading && (
                <div className="detail__ai-loading">
                  <span>Analyzing match</span>
                  <span className="detail__ai-dot" />
                  <span className="detail__ai-dot" />
                  <span className="detail__ai-dot" />
                </div>
              )}
              {aiError && (
                <p className="detail__ai-summary-text" style={{ color: "var(--color-error)" }}>
                  {aiError}
                </p>
              )}
              {aiSummary && (
                <p className="detail__ai-summary-text">{aiSummary}</p>
              )}
            </div>
          )}

          <div className="detail__specs">
            {specs.map((spec) => (
              <div key={spec.label} className="detail__spec">
                <span className="detail__spec-label">{spec.label}</span>
                <span className="detail__spec-value">{spec.value}</span>
              </div>
            ))}
          </div>

          <p className="detail__section-title">About</p>
          <p className="detail__description">{property.description}</p>

          <p className="detail__section-title">Amenities</p>
          <div className="detail__amenities">
            {property.amenities.map((amenity) => (
              <span key={amenity} className="detail__amenity">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
