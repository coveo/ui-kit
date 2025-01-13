import './atomic-text';

describe('atomic-text component', () => {
  let interfaceElement;

  beforeEach(() => {
    // Create the atomic-search-interface wrapper
    interfaceElement = document.createElement('atomic-search-interface');
    document.body.appendChild(interfaceElement);

    // Create the atomic-text element and append it inside the interface
    const textElement = document.createElement('atomic-text');
    textElement.value = 'Hello, World!';
    interfaceElement.appendChild(textElement);
  });

  afterEach(() => {
    // Clean up the DOM after each test
    document.body.innerHTML = '';
  });

  it('should render correctly', () => {
    const textElement = document.querySelector('atomic-text');
    expect(textElement).toBeTruthy();
    expect(textElement?.value).toBe('Hello, World!');
  });
});
