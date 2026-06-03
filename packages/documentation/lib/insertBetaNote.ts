export const insertBetaNote = () => {
  document.addEventListener('DOMContentLoaded', () => {
    const breadcrumbs = document.querySelector('ul.tsd-breadcrumb');
    if (breadcrumbs) {
      const IsSSRCommercePage = Array.from(
        breadcrumbs.querySelectorAll('a')
      ).find((link) => link.textContent?.trim() === 'SSR Commerce');

      if (IsSSRCommercePage) {
        const h1Element = document.querySelector('h1');
        if (h1Element) {
          h1Element.textContent += ' (Open Beta)';
        }
      }
    }
  });
};
