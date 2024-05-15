const barcaRoot = 'https://sports-dev.barca.group';
export const navContent = {
  Homepage: {href: 'homepage.html', label: 'Homepage', barcaUrl: barcaRoot},
  Pants: {
    href: 'listing-pants.html',
    label: 'Pants',
    barcaUrl: `${barcaRoot}/browse/promotions/clothing/pants`,
  },
  'Surf accessories': {
    href: 'listing-surf-accessories.html',
    label: 'Surf accessories',
    barcaUrl: `${barcaRoot}/browse/promotions/surf-with-us-this-year`,
  },
  Towels: {
    href: 'listing-towels.html',
    label: 'Towels',
    barcaUrl: `${barcaRoot}/browse/promotions/accessories/towels`,
  },
  Cart: {href: 'cart.html', label: 'Cart', barcaUrl: `${barcaRoot}/cart`},
  Search: {
    href: 'search.html',
    label: 'Search',
    barcaUrl: `${barcaRoot}/commerce-search`,
  },
};

export const getParamValue = (param) => {
  return document.location.hash
    .substring(1)
    .split('&')
    .reduce(function (res, item) {
      var parts = item.split('=');
      res[parts[0]] = parts[1];
      return res;
    }, {})[param];
};

const makeLinks = () => {
  return Object.values(navContent)
    .map(
      (nav) =>
        `<a href="${nav.href}" style="margin-right: 10px; color: var(--atomic-neutral-dark); text-decoration: none;">${nav.label}</a>`
    )
    .join('');
};

const nav = document.createElement('nav');
nav.style.borderTop = '1px solid var(--atomic-neutral-dark)';
nav.style.marginBottom = '2em';

nav.innerHTML = `
            <p style="margin-bottom: 0; margin-left: 0;">Commerce website nav menu:</p>
            <ul style="display: inline-block; font-size: var(--atomic-text-lg); padding-left: 0;">
              ${makeLinks()}
            </ul>
        `;

document.body.querySelector('header').insertAdjacentElement('beforeend', nav);

const isOnSearchPage = () => {
  return window.location.pathname === '/examples/commerce-website/search.html';
};

if (!isOnSearchPage()) {
  const standaloneSearchBoxHTML = `
    <atomic-commerce-search-box redirection-url="./search.html" textarea  style="max-width: 1000px; margin: auto">
      <atomic-commerce-search-box-recent-queries></atomic-commerce-search-box-recent-queries>
      <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
      <atomic-commerce-search-box-instant-products image-size="small"></atomic-commerce-search-box-instant-products>
    </atomic-commerce-search-box>
  `;

  const standaloneSearchBox = document.createElement('search');

  const atomicCommerceInterface = document.body.querySelector(
    'atomic-commerce-interface'
  );

  if (atomicCommerceInterface) {
    standaloneSearchBox.innerHTML = standaloneSearchBoxHTML;
    atomicCommerceInterface.insertAdjacentElement(
      'afterbegin',
      standaloneSearchBox
    );
  } else {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = './init-standalone-search-box.js';
    document.head.insertAdjacentElement('beforeend', script);

    standaloneSearchBox.innerHTML = `
      <atomic-commerce-interface id="standaloneSearchBox" type="search">
        ${standaloneSearchBoxHTML}
      </atomic-commerce-interface>`;

    document.body
      .querySelector('main')
      .insertAdjacentElement('afterbegin', standaloneSearchBox);
  }
}
