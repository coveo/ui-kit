import {BrowserRouter, NavLink, Routes, Route} from 'react-router-dom';
import {AboutPage} from './pages/AboutPage';
import {AnalyticsHook} from './pages/AnalyticsHook';
import {DependentFacetPage} from './pages/DependentFacetPage';
import {ProductRecommendationsPage} from './pages/ProductRecommendationsPage';
import {RecommendationPage} from './pages/RecommendationPage';
import {SamlPage} from './pages/SamlPage';
import {SearchPage, SearchPageProps} from './pages/SearchPage';
import {StandaloneSearchBoxPage} from './pages/StandaloneSearchBoxPage';

function App(props: SearchPageProps) {
  const activeNavLink: React.CSSProperties = {color: 'red'};

  return (
    <BrowserRouter>
      <main className="App">
        <nav>
          <button>
            <NavLink
              end
              to="/"
              style={({isActive}) => (isActive ? activeNavLink : {})}
            >
              Search
            </NavLink>
          </button>
          <button>
            <NavLink
              to="/recommendation"
              style={({isActive}) => (isActive ? activeNavLink : {})}
            >
              Recommendation
            </NavLink>
          </button>
          <button>
            <NavLink
              to="/standalone-search-box"
              style={({isActive}) => (isActive ? activeNavLink : {})}
            >
              Standalone Search Box
            </NavLink>
          </button>
          <button>
            <NavLink
              to="/about"
              style={({isActive}) => (isActive ? activeNavLink : {})}
            >
              About
            </NavLink>
          </button>
          <button>
            <NavLink
              to="/saml"
              style={({isActive}) => (isActive ? activeNavLink : {})}
            >
              Saml
            </NavLink>
          </button>
          <button>
            <NavLink
              to="/dependent-facet"
              style={({isActive}) => (isActive ? activeNavLink : {})}
            >
              Dependent facet
            </NavLink>
          </button>
          <button>
            <NavLink
              to="/analyticshooks"
              style={({isActive}) => (isActive ? activeNavLink : {})}
            >
              Analytics hook (Google Tag Manager)
            </NavLink>
          </button>
          <button>
            <NavLink
              to="/product-recommendations"
              style={({isActive}) => (isActive ? activeNavLink : {})}
            >
              Product Recommendations
            </NavLink>
          </button>
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
          <Route
            path="/product-recommendations"
            element={<ProductRecommendationsPage />}
          />
          <Route path="/search-page" element={<SearchPage {...props} />} />
          <Route path="/" element={<SearchPage {...props} />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
