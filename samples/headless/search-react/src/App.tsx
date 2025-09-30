import type React from 'react';
import {BrowserRouter, NavLink, Route, Routes} from 'react-router';
import {AboutPage} from './pages/AboutPage';
import {AnalyticsHook} from './pages/AnalyticsHook';
import {CommerceApp} from './pages/commerce/CommerceApp';
import {ProductListingPage} from './pages/commerce/ProductListingPage';
import {RecommendationsPage} from './pages/commerce/RecommendationsPage';
import {SearchPage as CommerceSearchPage} from './pages/commerce/SearchPage';
import {DependentFacetPage} from './pages/DependentFacetPage';
import {RecommendationPage} from './pages/RecommendationPage';
import {SamlPage} from './pages/SamlPage';
import {SearchPage, type SearchPageProps} from './pages/SearchPage';
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
              to="/commerce"
              style={({isActive}) => (isActive ? activeNavLink : {})}
            >
              Commerce
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
          <Route path="/commerce" element={<CommerceApp />}>
            <Route path="search" element={<CommerceSearchPage />} />
            <Route path="product-listing" element={<ProductListingPage />} />
            <Route path="recommendations" element={<RecommendationsPage />} />
          </Route>
          <Route path="/search-page" element={<SearchPage {...props} />} />
          <Route path="/" element={<SearchPage {...props} />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
