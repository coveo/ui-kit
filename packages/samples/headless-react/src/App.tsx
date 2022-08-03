import {SearchPage, SearchPageProps} from './pages/SearchPage';
import {AboutPage} from './pages/AboutPage';
import {BrowserRouter, NavLink, Switch, Route} from 'react-router-dom';
import {RecommendationPage} from './pages/RecommendationPage';
import {ProductRecommendationsPage} from './pages/ProductRecommendationsPage';
import {StandaloneSearchBoxPage} from './pages/StandaloneSearchBoxPage';
import {SamlPage} from './pages/SamlPage';
import {DependentFacetPage} from './pages/DependentFacetPage';
import {AnalyticsHook} from './pages/AnalyticsHook';

function App(props: SearchPageProps) {
  const activeNavLink: React.CSSProperties = {color: 'red'};

  return (
    <BrowserRouter>
      <main className="App">
        <nav>
          <button>
            <NavLink exact to="/" activeStyle={activeNavLink}>
              Search
            </NavLink>
          </button>
          <button>
            <NavLink to="/recommendation" activeStyle={activeNavLink}>
              Recommendation
            </NavLink>
          </button>
          <button>
            <NavLink to="/standalone-search-box" activeStyle={activeNavLink}>
              Standalone Search Box
            </NavLink>
          </button>
          <button>
            <NavLink to="/about" activeStyle={activeNavLink}>
              About
            </NavLink>
          </button>
          <button>
            <NavLink to="/saml" activeStyle={activeNavLink}>
              Saml
            </NavLink>
          </button>
          <button>
            <NavLink to="/dependent-facet" activeStyle={activeNavLink}>
              Dependent facet
            </NavLink>
          </button>
          <button>
            <NavLink to="/analyticshooks" activeStyle={activeNavLink}>
              Analytics hook (Google Tag Manager)
            </NavLink>
          </button>
          <button>
            <NavLink to="/product-recommendations" activeStyle={activeNavLink}>
              Product Recommendations
            </NavLink>
          </button>
        </nav>
        <Switch>
          <Route path="/recommendation">
            <RecommendationPage />
          </Route>
          <Route path="/standalone-search-box">
            <StandaloneSearchBoxPage />
          </Route>
          <Route path="/about">
            <AboutPage />
          </Route>
          <Route path="/saml">
            <SamlPage organizationId="" provider="" />
          </Route>
          <Route path="/dependent-facet">
            <DependentFacetPage />
          </Route>
          <Route path="/analyticshooks">
            <AnalyticsHook />
          </Route>
          <Route path="/product-recommendations">
            <ProductRecommendationsPage />
          </Route>
          <Route path="/search-page">
            <SearchPage {...props} />
          </Route>
          <Route path="/">
            <SearchPage {...props} />
          </Route>
        </Switch>
      </main>
    </BrowserRouter>
  );
}

export default App;
