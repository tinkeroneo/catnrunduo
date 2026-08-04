(function initCatUiText(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CatUiText = api;
})(typeof window !== 'undefined' ? window : globalThis, function createCatUiText() {
  function formatScoreSummary({ level, maxLevel, mice, miceTotal, score, lives }) {
    return `Level ${level}/${maxLevel}  ·  Mäuse ${mice}/${miceTotal}  ·  Punkte ${score}  ·  Leben ${lives}`;
  }

  function formatRunContext({ variant, assist, focus, boost, boss }) {
    const adaptations = [assist ? 'Assistenz' : '', focus ? 'Fokus' : ''].filter(Boolean);
    const variantLabel = adaptations.length ? `${variant} (${adaptations.join(', ')})` : variant;
    return `Variante ${variantLabel}  ·  Boost ${boost}  ·  Boss ${boss}`;
  }

  return { formatScoreSummary, formatRunContext };
});
