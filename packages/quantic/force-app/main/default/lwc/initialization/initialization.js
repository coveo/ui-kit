export function initializeComponent(element) {
  element.dispatchEvent(
    new CustomEvent('initializecomponent', {
      bubbles: true,
      detail: {
        initialize: (engine) => {
          if (!element.initialize) {
            console.warn(
              'The initialize method has to be defined for the Quantic component to initialize correctly',
              element
            );
            return;
          }

          element.initialize(engine);
        },
      },
    })
  );
}
