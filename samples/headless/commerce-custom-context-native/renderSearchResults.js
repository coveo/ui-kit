// renderSearchResults.js

export const renderSearchResults = (el, products) => {
  if (!products.length) {
    el.innerHTML = '<h2>Search Results</h2><p>No results.</p>';
    return;
  }

  const items = products
    .slice(0, 10)
    .map((product) => {
      const price = product.ec_price
        ? `<span class="product-price">$${Number(product.ec_price).toFixed(2)}</span>`
        : '';
      return `<li><span class="product-name">${product.ec_name ?? product.permanentid}</span>${price}</li>`;
    })
    .join('');

  el.innerHTML = `
    <h2>Search Results <small>(${products.length} products)</small></h2>
    <ul>${items}</ul>
  `;
};
