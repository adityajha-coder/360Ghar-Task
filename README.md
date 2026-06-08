# 360Ghar

360Ghar is a React and Vite property search interface for Gurgaon and NCR real estate. Users can enter natural language queries such as budget, BHK, furnishing, sector, or property type, and the app converts that query into structured filters before matching results from a local property dataset.

## Setup

1. Install dependencies with `npm install`.
2. Start the development server with `npm run dev`.
3. Build for production with `npm run build`.
4. Preview the production build with `npm run preview`.
5. Add an OpenRouter API key either through `VITE_OPENROUTER_API_KEY` in a local `.env` file or by entering the key in the app modal at runtime.

## OpenRouter Model Choice

The current implementation uses `openrouter/free` in `src/services/llm.js`. I chose it because it keeps evaluation friction low for a demo assignment, works through a single OpenRouter endpoint, and allows the app to stay usable without introducing paid infrastructure requirements on day one. The tradeoff is lower reliability and stricter rate limits, which is why the app also includes a deterministic local fallback parser.

## Architecture Note

The application follows a simple client side flow. `App.jsx` coordinates search state, URL syncing, property detail views, and comparison state. `src/services/llm.js` handles query parsing and property summary generation through OpenRouter, while `src/services/filterProperties.js` applies normalized filters to the local JSON inventory. This keeps the UI responsive and makes the search experience degrade gracefully when the LLM is unavailable.

## Prompt Design Notes

For query parsing, I used a system prompt that forces a fixed JSON schema with explicit fields for BHK, budget, sector, locality, type, furnishing, status, keywords, and a possible follow up question. I also included domain constraints such as Gurgaon specific locations, allowed property categories, and price conversion rules for lakh and crore so the model can normalize Indian real estate language reliably.  


I chose `openrouter/free` because this project benefits more from low integration overhead than from maximum model quality. For this assignment, the combination of a low cost OpenRouter model plus a local regex fallback was a practical balance between usability, resilience, and implementation speed.
