const baseLayerStyles = document.createElement('style');
baseLayerStyles.textContent = `@layer base {
  .styles-error {
    display: none;
  }
}`;
document.head.appendChild(baseLayerStyles);

const sentinel = document.createElement('span');
sentinel.className = 'styles-error block font-bold text-error';
sentinel.textContent = 'If you can see this, our styles have escaped shadow DOM';
document.body.insertAdjacentElement('afterbegin', sentinel);
