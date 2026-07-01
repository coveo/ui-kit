import {buildRecommendations} from '@coveo/headless/commerce';
import {engine} from '../engine.js';

export function renderHome(container) {
  container.innerHTML =
    '<h1>Home</h1><section id="recommendations"><h2>Recommendations</h2><div id="rec-list"></div></section>';

  const recommendations = buildRecommendations(engine, {
    options: {slotId: 'af4fb7ba-6641-4b67-9cf9-be67e9f30174'},
  });

  recommendations.subscribe(() => {
    const state = recommendations.state;
    const list = document.getElementById('rec-list');
    if (!list) return;

    list.innerHTML = state.products
      .map(
        (p) =>
          `<div class="product"><p>${p.ec_name || p.permanentid}</p><p>${p.ec_price ? '$' + p.ec_price : ''}</p></div>`
      )
      .join('');
  });

  recommendations.refresh();
}
