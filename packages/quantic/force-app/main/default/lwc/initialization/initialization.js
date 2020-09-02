export function initializeComponent(element) {
  element.dispatchEvent(
    new CustomEvent('initializecomponent', {
      bubbles: true,
      detail: {
        initialize: (engine) => {
          if (!element.initialize) {
            return console.warn(
              'The initialize method has to be defined for the Quantic component to initialize correctly',
              element
            );
          }

          element.initialize(engine);
        },
      },
    })
  );
}
