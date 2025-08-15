document.querySelector('#nav-bar')!.innerHTML = `
    <div id="navbar-container">
      <atomic-external>
        <atomic-search-box>
        </atomic-search-box>
      </atomic-external>
      <a href="/">Search</a>
      <a href="/tabs/">Tabs</a> 
      <a href="/genqa/">Gen QA</a> 
  
    </div>
  `;

const navbarContainer = document.querySelector(
  '#navbar-container'
) as HTMLElement;
navbarContainer.style.display = 'flex';
navbarContainer.style.justifyContent = 'center';
navbarContainer.style.width = '100%';
navbarContainer.style.padding = '10px';
navbarContainer.style.borderBottom = '1px solid #e5e7eb';
navbarContainer.style.marginBottom = '20px';
navbarContainer.style.fontFamily = 'var(--atomic-font-family)';

const navLinks = navbarContainer.querySelectorAll('a');
navLinks.forEach((link) => {
  link.style.textDecoration = 'none';
  link.style.color = '#333';
  link.style.fontSize = '24px';
  link.style.padding = '8px 16px';
  link.style.display = 'inline-block';
  link.style.transition = 'background-color 0.3s, color 0.3s';

  link.addEventListener('mouseover', () => {
    link.style.color = '#f05245';
  });

  link.addEventListener('mouseout', () => {
    if (link !== document.querySelector('.active')) {
      link.style.color = '#333';
    }
  });

  if (window.location.pathname === link.getAttribute('href')) {
    link.classList.add('active');
    link.style.color = '#f05245';
  }
});
