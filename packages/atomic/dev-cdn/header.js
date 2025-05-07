const links = [
  {href: '/', label: 'Main'},
  {href: '/examples/custom.html', label: 'Custom'},
  {href: '/examples/external.html', label: 'External'},
  {href: '/examples/folding.html', label: 'Folding'},
  {href: '/examples/slack.html', label: 'Slack'},
  {href: '/examples/headless.html', label: 'Headless'},
  {href: '/examples/standalone.html', label: 'Standalone'},
  {href: '/examples/modal.html', label: 'Modal'},
  {href: '/examples/suggestions.html', label: 'Custom Query Suggestions'},
  {href: '/examples/fashion.html', label: 'Fashion (Instant results + Recs)'},
  {href: '/examples/insights.html', label: 'Insight Panel'},
  {
    href: '/examples/recommendations.html',
    label: 'Recommendations',
  },
  {href: '/examples/horizontal-facets.html', label: 'Horizontal Facets'},
  {href: '/examples/ipx.html', label: 'IPX'},
  {href: '/examples/genqa.html', label: 'Gen Q&A'},
  {href: '/examples/tabs.html', label: 'Tabs'},
  {href: '/examples/commerce-website/homepage.html', label: 'Commerce Website'},
];

const header = document.createElement('header');

const getCurrentExample = () =>
  links.find((link) => link.href === window.location.pathname);

const makeLinks = () => {
  const currentExample = getCurrentExample();
  return links
    .map(
      (link) =>
        `<li>
           <a href="${link.href}" style="${currentExample && currentExample.href === link.href ? 'font-weight: bold;' : ''}">${link.label}</a>
         </li>`
    )
    .join('');
};
const example = getCurrentExample();
const styleTag = document.createElement('style');
styleTag.innerHTML = `
  html {
  @layer base {
    .styles-error {
      display: none;
    }
  }

  body{
  margin: 0;
  padding: 0;}

  header {
  min-height: 130px;
  }
    nav {

      padding: 10px 20px;
      font-family: var(--atomic-font-family);
      span {
        font-weight: var(--atomic-font-bold);
      }
      ul {
        display: inline-block;
        font-size: var(--atomic-text-sm);
      }
      li {
        display: inline-block;
        list-decoration: none;
      }
      a {
        margin-right: 10px;
        color: var(--atomic-primary);
        text-decoration: none;
      }
    }`;
styleTag.setAttribute('nonce', '1234567890');

header.innerHTML = `
  <span class="styles-error block  font-bold text-error">If you can see this, our styles have escaped shadow DOM
</span>
  <nav>

    <span>${example ? example.label : ''} example</span>
    <ul>
      ${makeLinks()}
    </ul>
  </nav>
`;
document.head.appendChild(styleTag);
document.body.insertAdjacentElement('afterbegin', header);
