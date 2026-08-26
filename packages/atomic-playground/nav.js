const pages = [
  {href: '/', label: 'Search'},
  {href: '/genqa.html', label: 'Gen Q&A'},
  {href: '/insight.html', label: 'Insight Panel'},
];

const style = document.createElement('style');
style.textContent = `
  .playground-nav {
    display: flex;
    gap: 1rem;
    padding: 0.75rem 1.25rem;
    font-family: system-ui, sans-serif;
    font-size: 0.875rem;
    border-bottom: 1px solid #d3d5db;
  }

  .playground-nav a {
    color: #1372ec;
    text-decoration: none;
  }

  .playground-nav a[aria-current='page'] {
    font-weight: 700;
    color: #282c34;
  }
`;

const nav = document.createElement('nav');
nav.className = 'playground-nav';
nav.innerHTML = pages
  .map(
    ({href, label}) =>
      `<a href="${href}"${href === window.location.pathname ? ' aria-current="page"' : ''}>${label}</a>`
  )
  .join('');

document.head.appendChild(style);
document.body.insertAdjacentElement('afterbegin', nav);
