export default function Header({ compareCount, onCompareClick }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToResults = (e) => {
    e.preventDefault();
    const el = document.getElementById("results-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="header">
      <div className="container header__inner">
        <div className="header__brand" onClick={scrollToTop} style={{ cursor: "pointer" }}>
          <img src="/fevicon.webp" alt="360 Ghar" className="header__logo-img" />
          <span className="header__logo">360 Ghar</span>
          <span className="header__tagline">AI Property Search</span>
        </div>

        <nav className="header__nav">
          <a href="#results-section" className="header__link" onClick={scrollToResults}>
            Browse
          </a>
          {compareCount > 0 && (
            <button className="header__link header__link--compare" onClick={onCompareClick}>
              Compare ({compareCount})
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
