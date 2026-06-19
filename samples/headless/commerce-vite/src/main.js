import './style.css';
import {renderHome} from './pages/home.js';
import {renderSearch} from './pages/search.js';
import {renderListing} from './pages/listing.js';

function router() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  const hash = window.location.hash || '#/';

  if (hash.startsWith('#/search')) {
    renderSearch(app);
  } else if (hash.startsWith('#/listing')) {
    renderListing(app);
  } else {
    renderHome(app);
  }
}

window.addEventListener('hashchange', router);
router();
