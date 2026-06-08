export function filterProperties(properties, filters) {
  if (!filters) return properties.map((p) => ({ ...p, matchReason: null }));

  return properties
    .map((property) => {
      const reasons = [];
      let score = 0;

      if (filters.bhk != null) {
        if (property.bhk === filters.bhk) {
          reasons.push(`${filters.bhk}BHK`);
          score += 3;
        } else {
          return null;
        }
      }

      if (filters.maxPrice != null) {
        if (property.price <= filters.maxPrice) {
          reasons.push(`Under ${formatPrice(filters.maxPrice)}`);
          score += 3;
        } else {
          return null;
        }
      }

      if (filters.minPrice != null) {
        if (property.price >= filters.minPrice) {
          reasons.push(`Above ${formatPrice(filters.minPrice)}`);
          score += 2;
        } else {
          return null;
        }
      }

      if (filters.sector) {
        const sectorLower = filters.sector.toLowerCase();
        const propertySector = property.sector.toLowerCase();
        const propertyLocality = property.locality.toLowerCase();
        if (
          propertySector.includes(sectorLower) ||
          sectorLower.includes(propertySector) ||
          propertyLocality.includes(sectorLower) ||
          sectorLower.includes(propertyLocality)
        ) {
          reasons.push(property.sector);
          score += 3;
        } else {
          return null;
        }
      }

      if (filters.locality) {
        const localityLower = filters.locality.toLowerCase();
        const propertyLocality = property.locality.toLowerCase();
        const propertySector = property.sector.toLowerCase();
        if (
          propertyLocality.includes(localityLower) ||
          localityLower.includes(propertyLocality) ||
          propertySector.includes(localityLower)
        ) {
          reasons.push(property.locality);
          score += 2;
        }
      }

      if (filters.type) {
        const typeLower = filters.type.toLowerCase();
        if (property.type.toLowerCase() === typeLower) {
          reasons.push(property.type);
          score += 2;
        } else {
          return null;
        }
      }

      if (filters.furnishing) {
        const furnLower = filters.furnishing.toLowerCase();
        if (property.furnishing.toLowerCase().includes(furnLower)) {
          reasons.push(property.furnishing);
          score += 1;
        }
      }

      if (filters.status) {
        const statusLower = filters.status.toLowerCase();
        if (property.status.toLowerCase().includes(statusLower)) {
          reasons.push(property.status);
          score += 1;
        }
      }

      if (filters.keywords && filters.keywords.length > 0) {
        const propText = `${property.description} ${property.amenities.join(" ")} ${property.title}`.toLowerCase();
        filters.keywords.forEach((kw) => {
          if (propText.includes(kw.toLowerCase())) {
            reasons.push(capitalize(kw));
            score += 1;
          }
        });
      }

      return {
        ...property,
        matchReason: reasons.length > 0 ? reasons.join("  /  ") : "General Match",
        matchScore: score,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.matchScore - a.matchScore);
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

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
