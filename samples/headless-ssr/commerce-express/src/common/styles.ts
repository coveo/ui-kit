/**
 * Inline stylesheet for the Headless Commerce SSR (Express) sample.
 *
 * All visual styling lives here and is keyed off the semantic class names the
 * components render, so component/business logic stays free of styling concerns.
 *
 * Brand tokens are derived from the Coveo logo and website
 * (https://www.coveo.com/en/company/brand):
 *   - Coveo Navy  #333357  → primary surfaces, buttons, active states
 *   - Coveo Coral #F05245  → the signature accent (prices, links, active filters)
 */
export function getSharedStyles(): string {
  return `<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

    :root {
      /* Brand */
      --brand: #333357;
      --brand-strong: #29293f;
      --accent: #f05245;
      --accent-strong: #d83f34;
      --on-brand: #ffffff;

      /* Neutrals */
      --surface: #f6f7fb;
      --panel: #ffffff;
      --tile: #f1f2f8;
      --border: #e6e7ef;
      --border-strong: #d7d9e6;

      /* Text */
      --text: #2b2c3a;
      --muted: #5f6377;
      --faint: #9498aa;

      /* Tints */
      --brand-soft: rgba(51, 51, 87, 0.06);
      --accent-soft: rgba(240, 82, 69, 0.1);

      /* Shape */
      --radius: 12px;
      --radius-sm: 8px;
      --radius-pill: 999px;

      /* Elevation */
      --shadow-sm: 0 1px 2px rgba(20, 22, 43, 0.05);
      --shadow: 0 4px 20px rgba(20, 22, 43, 0.06);
      --shadow-md: 0 10px 30px rgba(20, 22, 43, 0.1);

      --gap: 16px;

      --font-body: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      --font-head: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }

    body {
      font-family: var(--font-body);
      color: var(--text);
      background: var(--surface);
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    h1, h2, h3, h4 {
      font-family: var(--font-head);
      margin: 0 0 0.5em;
      line-height: 1.25;
      letter-spacing: -0.01em;
      color: var(--brand);
    }

    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }

    button { font: inherit; cursor: pointer; }
    button:disabled { cursor: not-allowed; opacity: 0.45; }

    :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

    input[type='checkbox'], input[type='radio'] {
      accent-color: var(--brand);
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    ::selection { background: var(--accent-soft); }

    /* ---------- Layout & header ---------- */
    .Layout { min-height: 100vh; display: flex; flex-direction: column; }

    .Header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--gap);
      padding: 16px 32px;
      background: var(--panel);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .HeaderBrand { display: flex; align-items: center; gap: 12px; }
    .HeaderLogo { height: 30px; width: auto; }

    .AppTitle {
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      color: var(--muted);
      padding-left: 12px;
      border-left: 1px solid var(--border);
    }

    .Tabs { display: flex; flex-wrap: wrap; gap: 4px; }

    .Tab {
      padding: 8px 16px;
      border-radius: var(--radius-pill);
      color: var(--muted);
      border: 1px solid transparent;
      font-size: 0.9rem;
      font-weight: 500;
      transition: background 0.15s ease, color 0.15s ease;
    }

    .Tab:hover { background: var(--brand-soft); color: var(--brand); text-decoration: none; }
    .TabActive, .TabActive:hover { background: var(--brand); color: var(--on-brand); }

    .Page {
      flex: 1;
      width: 100%;
      max-width: 1240px;
      margin: 0 auto;
      padding: 32px 24px 48px;
    }

    .Page h1 { font-size: 1.5rem; font-weight: 800; }
    .Page h2 { font-size: 1.3rem; font-weight: 700; }

    /* ---------- Results grid ---------- */
    .PageLayout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 32px;
      align-items: start;
    }

    @media (max-width: 900px) {
      .PageLayout { grid-template-columns: 1fr; }
    }

    .Sidebar { min-width: 0; }
    .Results { min-width: 0; }

    .Toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--gap);
      padding-bottom: 16px;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--border);
    }

    .Summary { color: var(--muted); font-size: 0.9rem; }
    .Summary p { margin: 0; }
    .Summary b { color: var(--text); font-weight: 600; }

    .Sort { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--muted); }

    .Sort select {
      padding: 9px 34px 9px 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background-color: var(--panel);
      color: var(--text);
      font-weight: 500;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235f6377' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 10px center;
    }

    .Sort select:hover { border-color: var(--border-strong); }

    /* ---------- Search box ---------- */
    .SearchBox {
      position: relative;
      display: flex;
      gap: 10px;
      max-width: 760px;
      margin: 0 auto 32px;
    }

    .SearchBoxField {
      position: relative;
      flex: 1;
      display: flex;
      align-items: center;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: var(--radius-pill);
      box-shadow: var(--shadow-sm);
      padding-left: 46px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%239498aa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='7'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: 16px center;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .SearchBoxField:focus-within { border-color: var(--brand); box-shadow: 0 0 0 4px var(--brand-soft); }

    .SearchBoxInput {
      width: 100%;
      border: none;
      background: transparent;
      padding: 13px 16px 13px 0;
      font-size: 1rem;
      color: var(--text);
    }

    .SearchBoxInput:focus { outline: none; }
    .SearchBoxInput::-webkit-search-cancel-button { -webkit-appearance: none; appearance: none; }

    .SearchBoxSubmit {
      padding: 0 24px;
      border: none;
      border-radius: var(--radius-pill);
      background: var(--brand);
      color: var(--on-brand);
      font-weight: 600;
      transition: background 0.15s ease, transform 0.05s ease;
    }

    .SearchBoxSubmit:hover { background: var(--brand-strong); }
    .SearchBoxSubmit:active { transform: translateY(1px); }

    /* ---------- Facets ---------- */
    .Facets {
      display: flex;
      flex-direction: column;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow-sm);
      padding: 14px 20px;
    }

    .RegularFacet, .NumericFacet, .CategoryFacet, .DateFacet {
      border: none;
      border-bottom: 1px solid var(--border);
      margin: 0;
      padding: 20px 0 8px;
      min-inline-size: 0;
    }

    .Facets > *:last-child { border-bottom: none; }

    .FacetHeader {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      width: 100%;
      padding: 0;
      margin-bottom: 12px;
    }

    .FacetDisplayName {
      font-family: var(--font-body);
      font-weight: 600;
      font-size: 0.78rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text);
    }

    .FacetClear {
      border: none;
      background: transparent;
      border-radius: var(--radius-sm);
      padding: 2px 4px;
      color: var(--accent);
      font-size: 0.78rem;
      font-weight: 600;
    }

    .FacetClear:hover:not(:disabled) { text-decoration: underline; }
    .FacetClear:disabled { visibility: hidden; }

    .FacetValues {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .FacetValue {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 5px 6px;
      margin: 0 -6px;
      border-radius: var(--radius-sm);
    }

    .FacetValue:hover { background: var(--brand-soft); }

    .FacetValueLabel {
      flex: 1;
      display: flex;
      justify-content: space-between;
      gap: 8px;
      font-size: 0.9rem;
      cursor: pointer;
      min-width: 0;
    }

    .FacetValueName { color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .FacetValueCount { color: var(--faint); font-size: 0.82rem; font-variant-numeric: tabular-nums; flex-shrink: 0; }

    /* ---------- Product grid & cards ---------- */
    .ProductList {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
    }

    .ProductCard {
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 14px;
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }

    .ProductCard:hover { transform: translateY(-3px); box-shadow: var(--shadow); border-color: var(--border-strong); }

    .ProductLink {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      width: 100%;
      border: none;
      background: transparent;
      text-align: left;
      color: var(--text);
      padding: 0;
    }

    .ProductImage { width: 100%; height: 220px; object-fit: contain; background: var(--panel); border-radius: var(--radius-sm); }
    .ProductImagePlaceholder { display: block; height: 220px; background: var(--tile); border-radius: var(--radius-sm); }

    .ProductName {
      font-family: var(--font-head);
      font-size: 0.98rem;
      font-weight: 600;
      line-height: 1.35;
      color: var(--text);
      transition: color 0.12s ease;
    }

    .ProductLink:hover .ProductName { color: var(--accent); }

    .ProductPrice { font-family: var(--font-head); font-weight: 700; font-size: 1.05rem; color: var(--brand); }

    .ProductDescription {
      margin: 0;
      color: var(--muted);
      font-size: 0.9rem;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* ---------- Pagination ---------- */
    .Pagination {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
    }

    .SelectPage {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 40px;
      height: 40px;
      padding: 0 8px;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: var(--panel);
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text);
      cursor: pointer;
      transition: background 0.12s ease, border-color 0.12s ease;
    }

    .SelectPage:hover { background: var(--brand-soft); border-color: var(--border-strong); }
    .SelectPage[aria-current='true'] { background: var(--brand); color: var(--on-brand); border-color: var(--brand); }

    .PreviousPage, .NextPage {
      min-width: 40px;
      height: 40px;
      padding: 0 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: var(--panel);
      color: var(--text);
      transition: background 0.12s ease, border-color 0.12s ease;
    }

    .PreviousPage:hover:not(:disabled), .NextPage:hover:not(:disabled) { background: var(--brand-soft); border-color: var(--border-strong); }

    /* ---------- States ---------- */
    .NoProducts, .ErrorMessage {
      text-align: center;
      padding: 60px 40px;
      color: var(--muted);
      font-size: 1.05rem;
    }
  </style>`;
}
