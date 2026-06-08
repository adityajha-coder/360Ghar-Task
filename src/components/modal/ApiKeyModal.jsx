import { useState } from "react";

export default function ApiKeyModal({ onSave, onClose, initialKey }) {
  const [key, setKey] = useState(initialKey || "");

  const handleSave = () => {
    const trimmed = key.trim();
    if (trimmed) onSave(trimmed);
  };

  return (
    <div className="api-modal-overlay" id="api-key-modal">
      <div className="api-modal-backdrop" onClick={onClose} />
      <div className="api-modal">
        <h2 className="api-modal__title">API Configuration</h2>
        <p className="api-modal__desc">
          Enter your OpenRouter API key to enable AI-powered search. You can get a free key at{" "}
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="api-modal__link"
          >
            openrouter.ai/keys
          </a>{" "}
          — no credit card required.
        </p>

        <div className="api-modal__input-wrap">
          <input
            id="api-key-input"
            className="api-modal__input"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-or-v1-..."
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        </div>

        <div className="api-modal__actions">
          <button className="api-modal__btn api-modal__btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="api-modal__btn api-modal__btn--primary"
            onClick={handleSave}
            disabled={!key.trim()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
