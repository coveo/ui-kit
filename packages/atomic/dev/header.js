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
  .custom-theme {
    --atomic-primary: rgb(255, 192, 0);
    --atomic-primary-light: rgb(0, 128, 0);
    --atomic-primary-dark: rgb(255, 0, 0);
    --atomic-on-primary: rgb(255, 165, 0);
    --atomic-ring-primary: rgb(250, 128, 114);

    /* Neutral colors */
    --atomic-neutral-dark: rgb(0, 255, 255);
    --atomic-neutral-dim: rgb(255, 127, 80);
    --atomic-neutral: rgb(38, 91, 128);
    --atomic-neutral-light: rgb(89, 119, 86);
    --atomic-neutral-lighter: rgb(147, 41, 41);

    /* Semantic colors */
    --atomic-background: rgb(54, 54, 54);
    --atomic-on-background: rgb(255, 120, 0);
    --atomic-success: rgb(222, 222, 0);
    --atomic-error: rgb(206, 0, 0);
    --atomic-visited: rgb(113, 129, 101);
    --atomic-disabled: rgb(21, 64, 107);
    --atomic-success-background: rgb(0, 20, 0);
    --atomic-error-background: #rgb(0, 0, 20);
    --atomic-primary-background: rgb(49, 58, 68);
    --atomic-inline-code: rgb(135, 86, 82);

    --atomic-text-base: 24px;
    --atomic-text-xl: 20px;

    --atomic-rating-icon-active-color: rgb(0, 0, 255);
    --atomic-rating-icon-inactive-color: rgb(128, 0, 128);

    --atomic-font-family: "Georgia", serif;

    --atomic-border-radius: 50px;
    --atomic-border-radius-md: 50px;
    --atomic-border-radius-lg: 50px;
    --atomic-border-radius-xl: 50px;
  }

  @layer base {
    .styles-error {
      display: none;
    }
  }

  p {
    margin: 0;
    padding: 0;
    margin-block-start: 0;
    margin-block-end: 0;
    padding-inline-start: 0;
  }

  ul {
    list-style-type: none;
    margin-block-start: 0;
    margin-block-end: 0;
    padding-inline-start: 0;
  }

  body {
    margin: 0;
    padding: 0;
  }

  button {
    -webkit-appearance: none;
    border-radius: 0;
    text-align: inherit;
    background: none;
    box-shadow: none;
    padding: 0;
    cursor: pointer;
    border: none;
    color: inherit;
    font: inherit;
  }

  #theme-toggle {
    background-color: white;
    font-size: 12px;

    border: 1px solid black;
    border-radius: 5px;
    padding: 2px 4px;
  }

  #theme-toggle:after {
    margin-left: 5px;
    content: "✗";
    color: red;
  }

  .custom-theme #theme-toggle:after {
    content: "✓";
    color: green;
  }
}

header {
  min-height: 130px;
}

h1 {
  font-size: 16px;
  font-family: "Arial";
  font-weight: bold!important;
  margin: 0;
  padding: 0;
  line-height: 1;
}

nav {
  font-size: 10px;
  line-height: 1;

  padding: 10px 20px;
  font-family: var(--atomic-font-family);

  span {
    font-weight: var(--atomic-font-bold);
  }

  ul {
    display: inline-block;
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
}
`;
styleTag.setAttribute('nonce', '1234567890');
header.innerHTML = `  <nav>
    <span>${example ? example.label : ''} example</span>   <button id="theme-toggle">Custom Theme</button>
    <ul>
      ${makeLinks()}
    </ul>
  </nav>

`;
document.head.appendChild(styleTag);
document.body.insertAdjacentElement('afterbegin', header);

const themeToggleButton = document.getElementById('theme-toggle');
const isCustomThemeEnabled =
  localStorage.getItem('custom-theme-enabled') === 'true';

if (isCustomThemeEnabled) {
  document.body.classList.add('custom-theme');
  themeToggleButton.textContent = 'Custom Theme';
}

themeToggleButton.addEventListener('click', () => {
  document.body.classList.toggle('custom-theme');
  const isEnabled = document.body.classList.contains('custom-theme');
  localStorage.setItem('custom-theme-enabled', isEnabled);
});
