export const formatTypeDocToolbar = () => {
  document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementsByTagName('header')[0] as HTMLElement;
    if (header) {
      header.innerHTML = '';
    }
    // Always hide TypeDoc's theme selector
    const typedocThemeSelector = document.querySelector(
      '.tsd-theme-toggle'
    ) as HTMLElement;
    if (typedocThemeSelector) {
      typedocThemeSelector.style.display = 'none';
    }
  });
};
