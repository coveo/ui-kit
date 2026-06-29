import {BrowserRouter, NavLink, Route, Routes} from 'react-router';
import {AboutPage} from './pages/AboutPage';
import {AnalyticsHook} from './pages/AnalyticsHook';
import {DependentFacetPage} from './pages/DependentFacetPage';
import {RecommendationPage} from './pages/RecommendationPage';
import {SamlPage} from './pages/SamlPage';
import {SearchPage, type SearchPageProps} from './pages/SearchPage';
import {StandaloneSearchBoxPage} from './pages/StandaloneSearchBoxPage';

const navLinkClassName = ({isActive}: {isActive: boolean}) =>
  isActive ? 'nav-link active' : 'nav-link';

function App(props: SearchPageProps) {
  return (
    <BrowserRouter>
      <main className="App">
        <header className="app-header">
          <img className="app-header__logo" src="/coveo-logo.svg" alt="Coveo" />
          <div className="app-header__text">
            <h1 className="app-header__title">Headless React</h1>
            <p className="app-header__subtitle">BarcaKnowledge sample</p>
          </div>
        </header>
        <nav className="app-nav">
          <NavLink end to="/" className={navLinkClassName}>
            Search
          </NavLink>
          <NavLink to="/recommendation" className={navLinkClassName}>
            Recommendation
          </NavLink>
          <NavLink to="/standalone-search-box" className={navLinkClassName}>
            Standalone Search Box
          </NavLink>
          <NavLink to="/about" className={navLinkClassName}>
            About
          </NavLink>
          <NavLink to="/saml" className={navLinkClassName}>
            Saml
          </NavLink>
          <NavLink to="/dependent-facet" className={navLinkClassName}>
            Dependent facet
          </NavLink>
          <NavLink to="/analyticshooks" className={navLinkClassName}>
            Analytics hook (Google Tag Manager)
          </NavLink>
        </nav>
        <Routes>
          <Route path="/recommendation" element={<RecommendationPage />} />
          <Route
            path="/standalone-search-box"
            element={<StandaloneSearchBoxPage />}
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/saml" element={<SamlPage />} />
          <Route path="/dependent-facet" element={<DependentFacetPage />} />
          <Route path="/analyticshooks" element={<AnalyticsHook />} />
          <Route path="/search-page" element={<SearchPage {...props} />} />
          <Route path="/" element={<SearchPage {...props} />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
