export default function ComparisonModal({ properties, onClose }) {
  if (!properties || properties.length < 2) return null;

  const rows = [
    { label: "Price", key: "priceLabel" },
    { label: "Type", key: "type" },
    { label: "Configuration", fn: (p) => `${p.bhk} BHK` },
    { label: "Area", fn: (p) => `${p.area} sq ft` },
    { label: "Price / sq ft", fn: (p) => `${Math.round(p.price / p.area).toLocaleString("en-IN")}` },
    { label: "Sector", key: "sector" },
    { label: "Locality", key: "locality" },
    { label: "Floor", key: "floor" },
    { label: "Facing", key: "facing" },
    { label: "Furnishing", key: "furnishing" },
    { label: "Status", key: "status" },
    { label: "Builder", key: "builder" },
    { label: "Amenities", fn: (p) => p.amenities.join(", ") },
  ];

  return (
    <div className="comparison-overlay" id="comparison-modal">
      <div className="comparison-backdrop" onClick={onClose} />
      <div className="comparison-panel">
        <div className="comparison__header">
          <h2 className="comparison__title">Property Comparison</h2>
          <button
            id="comparison-close-btn"
            className="comparison__close-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <table className="comparison-table">
          <thead>
            <tr>
              <th></th>
              {properties.map((p) => (
                <td key={p.id} className="comparison-table__prop-name">
                  {p.title}
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th>{row.label}</th>
                {properties.map((p) => (
                  <td key={p.id}>
                    {row.fn ? row.fn(p) : p[row.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
