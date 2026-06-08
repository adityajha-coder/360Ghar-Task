export default function ComparisonTray({
  selectedProperties,
  onClear,
  onOpenComparison,
}) {
  if (selectedProperties.length === 0) return null;

  return (
    <div className="comparison-tray" id="comparison-tray">
      <div className="comparison-tray__inner">
        <p className="comparison-tray__info">
          <span className="comparison-tray__count">
            {selectedProperties.length}
          </span>{" "}
          {selectedProperties.length === 1 ? "property" : "properties"} selected for comparison
        </p>
        <div className="comparison-tray__actions">
          <button className="comparison-tray__btn comparison-tray__btn--secondary" onClick={onClear}>
            Clear
          </button>
          <button
            className="comparison-tray__btn comparison-tray__btn--primary"
            onClick={onOpenComparison}
            disabled={selectedProperties.length < 2}
          >
            Compare
          </button>
        </div>
      </div>
    </div>
  );
}
