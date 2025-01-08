export function insertCoveoLogo(imagePath: string) {
  document.addEventListener('DOMContentLoaded', () => {
    const toolbarContents = document.getElementsByClassName(
      'tsd-toolbar-contents'
    )[0];
    if (toolbarContents) {
      const logoCell = document.createElement('div');
      logoCell.classList.add('table-cell', 'coveo-logo-cell');
      const logoDiv = document.createElement('div');
      logoDiv.classList.add('coveo-logo');
      const logoLink = document.createElement('a');
      logoLink.href = 'https://docs.coveo.com/en/0';
      const logoImg = document.createElement('img');
      logoImg.src = imagePath;
      logoImg.alt = 'Coveo Docs Logo';

      logoLink.appendChild(logoImg);
      logoDiv.appendChild(logoLink);
      logoCell.appendChild(logoDiv);
      toolbarContents.insertBefore(logoCell, toolbarContents.firstChild);
    }
  });
}
