const links = [
  {href: './dynamics.html', label: 'Dynamics'},
  {href: './lithium.html', label: 'Lithium'},
  {href: './rss.html', label: 'Rss'},
  {href: './servicenow.html', label: 'Servicenow'},
  {href: './youtube.html', label: 'Youtube'},
];

const header = document.createElement('header');

const getCurrentExample = () =>
  links.find((link) => link.href === window.location.pathname);

const makeLinks = () => {
  return links
    .filter((link) => link.href !== window.location.pathname)
    .map(
      (link) =>
        `<li style="display: inline-block; list-decoration: none;">
           <a href="${link.href}" style="margin-right: 10px; color: var(--atomic-primary); text-decoration: none;">${link.label}</a>
         </li>`
    )
    .join('');
};
const example = getCurrentExample();
header.innerHTML = `
  <nav style="padding: 10px 20px; font-family: var(--atomic-font-family);">
    <span style="font-weight: var(--atomic-font-bold);">${
      example ? example.label : ''
    } automatic facet examples</span>
    <ul style="display: inline-block; font-size: var(--atomic-text-sm);">
      ${makeLinks()}
    </ul>
  </nav>
`;

document.body.insertAdjacentElement('afterbegin', header);
