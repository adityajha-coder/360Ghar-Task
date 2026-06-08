export default function FilterTags({ filters, onRemoveFilter }) {
  if (!filters) return null;

  const tags = [];

  if (filters.bhk != null) {
    tags.push({ key: "bhk", label: `${filters.bhk} BHK` });
  }
  if (filters.maxPrice != null) {
    tags.push({ key: "maxPrice", label: `Max ${formatPrice(filters.maxPrice)}` });
  }
  if (filters.minPrice != null) {
    tags.push({ key: "minPrice", label: `Min ${formatPrice(filters.minPrice)}` });
  }
  if (filters.sector) {
    tags.push({ key: "sector", label: filters.sector });
  }
  if (filters.locality) {
    tags.push({ key: "locality", label: filters.locality });
  }
  if (filters.type) {
    tags.push({ key: "type", label: filters.type });
  }
  if (filters.furnishing) {
    tags.push({ key: "furnishing", label: filters.furnishing });
  }
  if (filters.status) {
    tags.push({ key: "status", label: filters.status });
  }
  if (filters.keywords && filters.keywords.length > 0) {
    filters.keywords.forEach((kw, i) => {
      tags.push({ key: `keyword-${i}`, label: kw });
    });
  }

  if (tags.length === 0) return null;

  return (
    <div className="filter-tags">
      <span className="filter-tags__label">Filters</span>
      {tags.map((tag) => (
        <span key={tag.key} className="filter-tag">
          {tag.label}
          <button
            className="filter-tag__remove"
            onClick={() => onRemoveFilter(tag.key)}
            aria-label={`Remove ${tag.label}`}
          >
            x
          </button>
        </span>
      ))}
    </div>
  );
}

function formatPrice(price) {
  if (price >= 10000000) {
    return `${(price / 10000000).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  }
  if (price >= 100000) {
    return `${(price / 100000).toFixed(0)} Lakh`;
  }
  return price.toLocaleString("en-IN");
}
