export default function PropertyCard({
  property,
  onClick,
  onCompareToggle,
  isComparing,
  animationDelay,
}) {
  const handleCompareClick = (e) => {
    e.stopPropagation();
    onCompareToggle(property);
  };

  return (
    <article
      id={`property-card-${property.id}`}
      className="property-card"
      onClick={() => onClick(property)}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="property-card__image-wrap">
        {property.image ? (
          <img
            src={property.image}
            alt={property.title}
            className="property-card__image"
          />
        ) : (
          <div
            className="property-card__image"
            style={{
              backgroundColor: "var(--color-bg-alt)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "rgba(22, 33, 34, 0.45)",
            }}
          >
            {property.type} — {property.sector}
          </div>
        )}
        <span className="property-card__360">360 View</span>
        {property.matchReason && (
          <span className="property-card__badge">{property.matchReason}</span>
        )}
      </div>

      <div className="property-card__body">
        <h3 className="property-card__title">{property.title}</h3>
        <p className="property-card__location">
          {property.locality}, {property.city}
        </p>

        <div className="property-card__meta">
          <div className="property-card__meta-item">
            <span className="property-card__meta-label">Config</span>
            <span className="property-card__meta-value">{property.bhk} BHK</span>
          </div>
          <div className="property-card__meta-item">
            <span className="property-card__meta-label">Area</span>
            <span className="property-card__meta-value">{property.area} sq ft</span>
          </div>
          <div className="property-card__meta-item">
            <span className="property-card__meta-label">Floor</span>
            <span className="property-card__meta-value">{property.floor}</span>
          </div>
        </div>

        <div className="property-card__footer">
          <span className="property-card__price">{property.priceLabel}</span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span className="property-card__status">{property.status}</span>
            <button
              className={`property-card__compare-btn ${
                isComparing ? "property-card__compare-btn--active" : ""
              }`}
              onClick={handleCompareClick}
            >
              {isComparing ? "Added" : "Compare"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
