const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openrouter/free";

function getApiKey() {
  return import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem("openrouter_api_key") || "";
}

async function callLLM(messages) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API key not set. Please enter your OpenRouter API key.");
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": window.location.origin,
      "X-Title": "360Ghar Property Search",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.3,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const rawMsg = err?.error?.message || `OpenRouter API error: ${response.status}`;
    
    if (rawMsg.includes("free-models-per-day") || rawMsg.includes("Rate limit exceeded")) {
      throw new Error(
        "OpenRouter rate limit exceeded for free models. You can add credits (minimum $5) to your OpenRouter dashboard to lift this and unlock 1,000 free requests per day."
      );
    }
    
    throw new Error(rawMsg);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function parseSearchQuery(query) {
  const systemPrompt = `You are a real estate search parser for properties in Gurgaon, India. 
Analyze the user's natural language query and return a structured JSON object.

If the user query is very short, ambiguous, or lacks key criteria (like BHK count, price budget, or location/sector), generate a short, friendly, conversational follow-up question (max 1 sentence) to clarify and help them refine their search (e.g. "Would you like to specify a budget or location?" or "Did you mean Sector 50 or Sector 57?"). If the query is sufficiently detailed, set "followUpQuestion" to null.

Return ONLY valid JSON with this exact schema (use null for unspecified):
{
  "filters": {
    "bhk": number or null,
    "minPrice": number or null,
    "maxPrice": number or null,
    "sector": string or null,
    "locality": string or null,
    "type": string or null,
    "furnishing": string or null,
    "status": string or null,
    "keywords": string[] (empty array if none)
  },
  "followUpQuestion": string or null
}

Price conversion rules:
- "lakhs" or "L" = multiply by 100000 (e.g., 80 lakhs = 8000000)
- "crore" or "Cr" = multiply by 10000000 (e.g., 1.5 crore = 15000000)

Property types: "Apartment", "Villa", "Builder Floor", "Penthouse"
Furnishing: "Fully Furnished", "Semi-Furnished", "Unfurnished"
Status: "Ready to Move", "Under Construction"

Sector examples: "Sector 50", "DLF Phase 5", "Sushant Lok 1", "Sohna Road"

Return ONLY the JSON object, no explanation, no markdown fences.`;

  try {
    const content = await callLLM([
      { role: "system", content: systemPrompt },
      { role: "user", content: query },
    ]);

    const cleaned = content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    let result = parsed;
    if (parsed && !parsed.hasOwnProperty("filters")) {
      const { followUpQuestion, ...filters } = parsed;
      result = {
        filters: {
          bhk: filters.bhk ?? null,
          minPrice: filters.minPrice ?? null,
          maxPrice: filters.maxPrice ?? null,
          sector: filters.sector ?? null,
          locality: filters.locality ?? null,
          type: filters.type ?? null,
          furnishing: filters.furnishing ?? null,
          status: filters.status ?? null,
          keywords: filters.keywords ?? [],
        },
        followUpQuestion: followUpQuestion ?? null,
      };
    }
    return { ...result, isFallback: false };
  } catch (err) {
    console.warn("LLM parsing failed, using offline fallback parser:", err.message);
    const fallback = parseQueryLocally(query);
    return { ...fallback, isFallback: true, fallbackError: err.message };
  }
}

export async function generatePropertySummary(property, originalQuery) {
  const systemPrompt = `You are a real estate advisor for 360Ghar, an AI-powered property platform in Gurgaon.
Given a property and the user's original search query, write a personalized 2-3 line summary explaining why this property is a good match.
Be specific — reference actual property details (price, location, amenities) and how they relate to what the user asked for.
Keep the tone professional and concise. Do not use emojis or exclamation marks.`;

  const userMessage = `User searched for: "${originalQuery}"

Property details:
- Title: ${property.title}
- Type: ${property.type}
- BHK: ${property.bhk}
- Price: ${property.priceLabel}
- Area: ${property.area} sq ft
- Sector: ${property.sector}
- Locality: ${property.locality}
- Builder: ${property.builder}
- Status: ${property.status}
- Furnishing: ${property.furnishing}
- Floor: ${property.floor}
- Facing: ${property.facing}
- Amenities: ${property.amenities.join(", ")}
- Description: ${property.description}`;

  try {
    return await callLLM([
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ]);
  } catch (err) {
    console.warn("LLM summary generation failed, using local template summary:", err.message);
    return `This premium ${property.bhk} BHK ${property.type} in ${property.sector} matches your interest. It offers ${property.area} sq ft of space, priced at ${property.priceLabel}, and features key amenities like ${property.amenities.slice(0, 3).join(", ")}.`;
  }
}

function parseQueryLocally(query) {
  const lower = query.toLowerCase();
  const filters = {
    bhk: null,
    minPrice: null,
    maxPrice: null,
    sector: null,
    locality: null,
    type: null,
    furnishing: null,
    status: null,
    keywords: [],
  };

  const bhkMatch = lower.match(/(\d)\s*bhk/);
  if (bhkMatch) {
    filters.bhk = parseInt(bhkMatch[1], 10);
  }

  const lakhMatch = lower.match(/(?:under|below|less than|max)\s*(\d+(?:\.\d+)?)\s*(?:lakh|l)/);
  if (lakhMatch) {
    filters.maxPrice = parseFloat(lakhMatch[1]) * 100000;
  }
  const crMatch = lower.match(/(?:under|below|less than|max)\s*(\d+(?:\.\d+)?)\s*(?:crore|cr)/);
  if (crMatch) {
    filters.maxPrice = parseFloat(crMatch[1]) * 10000000;
  }

  const minLakhMatch = lower.match(/(?:above|over|more than|min)\s*(\d+(?:\.\d+)?)\s*(?:lakh|l)/);
  if (minLakhMatch) {
    filters.minPrice = parseFloat(minLakhMatch[1]) * 100000;
  }
  const minCrMatch = lower.match(/(?:above|over|more than|min)\s*(\d+(?:\.\d+)?)\s*(?:crore|cr)/);
  if (minCrMatch) {
    filters.minPrice = parseFloat(minCrMatch[1]) * 10000000;
  }

  const sectorMatch = lower.match(/(?:sector|sec)\s*(\d+)/);
  if (sectorMatch) {
    filters.sector = `Sector ${sectorMatch[1]}`;
  } else if (lower.includes("dlf phase")) {
    const phaseMatch = lower.match(/dlf phase\s*(\d+)/);
    filters.sector = phaseMatch ? `DLF Phase ${phaseMatch[1]}` : "DLF Phase 5";
  } else if (lower.includes("sushant lok")) {
    const lokMatch = lower.match(/sushant lok\s*(\d+)/);
    filters.sector = lokMatch ? `Sushant Lok ${lokMatch[1]}` : "Sushant Lok 1";
  }

  if (lower.includes("apartment") || lower.includes("flat")) filters.type = "Apartment";
  else if (lower.includes("villa") || lower.includes("house")) filters.type = "Villa";
  else if (lower.includes("floor")) filters.type = "Builder Floor";
  else if (lower.includes("penthouse")) filters.type = "Penthouse";

  if (lower.includes("fully furnished") || lower.includes("fully-furnished")) filters.furnishing = "Fully Furnished";
  else if (lower.includes("semi furnished") || lower.includes("semi-furnished")) filters.furnishing = "Semi-Furnished";
  else if (lower.includes("unfurnished")) filters.furnishing = "Unfurnished";

  if (lower.includes("ready") || lower.includes("ready to move")) filters.status = "Ready to Move";
  else if (lower.includes("construction") || lower.includes("under construction")) filters.status = "Under Construction";

  const possibleKeywords = ["garden", "pool", "gym", "security", "park", "terrace", "parking", "marble"];
  possibleKeywords.forEach(kw => {
    if (lower.includes(kw)) filters.keywords.push(kw);
  });

  let followUpQuestion = null;
  if (!filters.bhk && !filters.sector && !filters.maxPrice) {
    followUpQuestion = "Would you like to specify a configuration (BHK), budget, or a sector in Gurgaon to narrow down your choices?";
  }

  return { filters, followUpQuestion };
}
