const links = [{href: '/', label: 'Main'}];

const header = document.createElement('header');

const getCurrentExample = () => links.find((link) => link.href === window.location.pathname);

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
  <nav>

    <span>${example ? example.label : ''} example</span>
    <ul>
      ${makeLinks()}
    </ul>
  </nav>
`;
document.head.appendChild(styleTag);
document.body.insertAdjacentElement('afterbegin', header);
