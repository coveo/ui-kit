import {
  buildCart,
  buildFilterSuggestionsGenerator,
  buildInstantProducts,
  buildStandaloneSearchBox,
  type CommerceEngine,
} from '@coveo/headless/commerce';
import type React from 'react';
import CartTab from '../components/cart-tab/cart-tab.js';
import StandaloneSearchBox from '../components/standalone-search-box/standalone-search-box.js';
import {highlightOptions} from '../utils/highlight-options.js';

interface ILayoutProps {
  engine: CommerceEngine;
  isPending: boolean;
  navigate: (path: string) => void;
  children: React.ReactNode;
}

export default function Layout(props: ILayoutProps) {
  const {engine, isPending, navigate, children} = props;
  const standaloneSearchBoxId = 'standalone-search-box';

  return (
    <div className="Layout">
      <section className="Header">
        <h1 className="AppTitle">Coveo Headless Commerce + React</h1>
        <div className="Tabs">
          <span>
            <input
              type="radio"
              id="home"
              name="home"
              value="/"
              checked={window.location.pathname === '/'}
              onChange={() => navigate('/')}
            />
            <label htmlFor="home">Home</label>
          </span>

          <span>
            <input
              type="radio"
              id="search"
              name="search"
              value="/search"
              checked={window.location.pathname === '/search'}
              onChange={() => navigate('/search')}
            />
            <label htmlFor="search">Search</label>
          </span>

          <span>
            <input
              type="radio"
              id="surf-accessories"
              name="surf-accessories"
              value="/listing/surf-accessories"
              checked={window.location.pathname === '/listing/surf-accessories'}
              onChange={() => navigate('/listing/surf-accessories')}
            />
            <label htmlFor="surf-accessories">Surf Accessories</label>
          </span>

          <span>
            <input
              type="radio"
              id="pants"
              name="pants"
              value="/listing/pants"
              checked={window.location.pathname === '/listing/pants'}
              onChange={() => navigate('/listing/pants')}
            />
            <label htmlFor="pants">Pants</label>
          </span>

          <span>
            <input
              type="radio"
              id="towels"
              name="towels"
              value="/listing/towels"
              checked={window.location.pathname === '/listing/towels'}
              onChange={() => navigate('/listing/towels')}
            />
            <label htmlFor="towels">Towels</label>
          </span>

          <CartTab
            controller={buildCart(engine)}
            onChange={() => navigate('/cart')}
          ></CartTab>
        </div>
        {!(window.location.pathname === '/search') && (
          <StandaloneSearchBox
            navigate={navigate}
            controller={buildStandaloneSearchBox(engine, {
              options: {
                redirectionUrl: '/search',
                id: standaloneSearchBoxId,
                highlightOptions,
              },
            })}
            instantProductsController={buildInstantProducts(engine, {
              options: {searchBoxId: standaloneSearchBoxId},
            })}
            filterSuggestionsGeneratorController={buildFilterSuggestionsGenerator(
              engine
            )}
            /* Uncomment the `legacyFieldSUggestionsGeneratorController` prop below and comment out the
               `filterSuggestionsGeneratorController` prop above if using legacy field suggestions */
            //legacyFieldSuggestionsGeneratorController={buildFieldSuggestionsGenerator(engine)}
          />
        )}
      </section>
      {!isPending && <main>{children}</main>}
    </div>
  );
}
