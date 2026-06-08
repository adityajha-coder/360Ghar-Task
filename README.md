# 360Ghar

360Ghar is a React and Vite based property search application for Gurgaon and NCR real estate. It allows users to search with natural language queries, converts those queries into structured filters, and displays matching properties from a local listing dataset.

## Key Features

1. Natural language search for location, budget, BHK count, furnishing, status, and property type.
2. OpenRouter powered query parsing with a local fallback parser for unavailable or rate limited API calls.
3. Property result cards, detailed property view, and property comparison.
4. Shareable search URLs through query parameters.
5. Runtime OpenRouter API key entry through the app modal.

## Setup Instructions

1. Install dependencies.

```bash
npm install
```

2. Add an OpenRouter API key using either option below.

```bash
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

You can also enter the API key directly in the app modal. The runtime key is stored in local storage.

3. Start the development server.

```bash
npm run dev
```

4. Build for production.

```bash
npm run build
```

5. Preview the production build.

```bash
npm run preview
```

## OpenRouter Model Choice

The application currently uses `openrouter/free` in `src/services/llm.js`. I selected this model option because it keeps the project easy to review and run without requiring paid model setup before testing the core workflow.

This choice is appropriate for the assignment because the LLM task is narrow: convert a property search sentence into a controlled JSON object. The prompt provides strict schema rules, and the app includes a deterministic fallback parser when OpenRouter is unavailable or rate limited. In a production deployment, I would move to a named model with stronger JSON reliability, lower latency, and predictable availability.

## Architecture Note

The project is a client side React application built with Vite. `App.jsx` owns the main search state, selected property state, comparison state, URL syncing, and API key modal state. The LLM integration is isolated in `src/services/llm.js`, where user queries are parsed into filters and property summaries are generated.

Filtering is handled separately in `src/services/filterProperties.js` against the local dataset in `src/data/properties.json`. This keeps the LLM responsible for interpreting user intent, while deterministic application code controls the actual property matching. If the LLM call fails, the local parser returns a best effort filter object so the search flow remains usable.

## LLM Prompt Design Notes

1. I structured the query parsing prompt as a system message that defines the assistant as a Gurgaon real estate search parser.
2. The prompt requires one exact JSON schema with fields for BHK, minimum price, maximum price, sector, locality, type, furnishing, status, keywords, and a follow up question.
3. I added explicit conversion rules for lakh and crore so Indian budget phrases are normalized into numeric price values.
4. I constrained property type, furnishing, and status values to match the labels used in the property dataset.
5. I included Gurgaon specific examples such as Sector 50, DLF Phase 5, Sushant Lok 1, and Sohna Road to improve location extraction.
6. A looser prompt that asked for filter extraction in plain language did not work well because it returned inconsistent field names and occasional explanatory text.
7. Allowing markdown responses also reduced reliability because code fences and extra text had to be cleaned before `JSON.parse`.
8. I chose `openrouter/free` because it offers low setup friction for review, while the strict schema prompt and fallback parser reduce the practical risk of inconsistent output.
