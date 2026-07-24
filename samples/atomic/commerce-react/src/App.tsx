import {useEffect, useState} from 'react';
import {HomePage} from './pages/HomePage';
import {ListingPage} from './pages/ListingPage';
import {SearchPage} from './pages/SearchPage';

const LISTINGS: Record<string, {title: string; viewUrl: string}> = {
  '/listing/surf-accessories': {
    title: 'Surf accessories',
    viewUrl: 'https://sports.barca.group/browse/promotions/surf-accessories',
  },
  '/listing/toys': {
    title: 'Toys',
    viewUrl: 'https://sports.barca.group/browse/promotions/toys',
  },
};

const NAV = [
  {path: '/', label: 'Home'},
  {path: '/search', label: 'Search'},
  {path: '/listing/surf-accessories', label: 'Surf Accessories'},
  {path: '/listing/toys', label: 'Toys'},
];

export const App = () => {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (to: string) => {
    if (to !== window.location.pathname) {
      window.history.pushState({}, '', to);
      setPath(to);
    }
  };

  const listing = LISTINGS[path];

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <img src="/coveo-logo.svg" alt="Coveo" width={119} height={30} />
          <h1>Atomic Commerce + React</h1>
        </div>
        <nav className="app-nav">
          {NAV.map((item) => (
            <a
              key={item.path}
              href={item.path}
              aria-current={path === item.path ? 'page' : undefined}
              onClick={(event) => {
                event.preventDefault();
                navigate(item.path);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="page">
        {listing ? (
          <ListingPage key={path} title={listing.title} viewUrl={listing.viewUrl} />
        ) : path === '/search' ? (
          <SearchPage />
        ) : (
          <HomePage />
        )}
      </main>
    </div>
  );
};
