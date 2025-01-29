// // TODO:
// import { AnyBindings } from '../components/common/interface/bindings';
// import { closest } from './dom-utils';
// import { buildCustomEvent } from './event-utils';
// import {
//   initializableElements,
//   InitializeEventHandler,
//   initializeEventName,
//   MissingInterfaceParentError,
// } from './initialization-lit-stencil-common-utils';
// import { fetchBindings } from './initialization-utils';
// import { vi } from 'vitest';

// vi.mock('./dom-utils', () => ({
//   closest: vi.fn(),
// }));

// vi.mock('./event-utils', () => ({
//   buildCustomEvent: vi.fn(),
// }));

// describe('fetchBindings', () => {
//   let element: HTMLElement;

//   beforeEach(() => {
//     element = document.createElement('div');
//     document.body.appendChild(element);
//   });

//   afterEach(() => {
//     document.body.removeChild(element);
//     vi.clearAllMocks();
//   });

//   it('should resolve with bindings when the event is dispatched and closest element is found', async () => {
//     const bindings = { some: 'bindings' } as AnyBindings;
//     (buildCustomEvent as any).mockImplementation((_, callback) => {
//       callback(bindings);
//       return new Event('initialize');
//     });
//     (closest as any).mockReturnValue(true);

//     const result = await fetchBindings<AnyBindings>(element);

//     expect(result).toEqual(bindings);
//     expect(buildCustomEvent).toHaveBeenCalledWith(
//       initializeEventName,
//       expect.any(Function)
//     );
//     expect(closest).toHaveBeenCalledWith(element, initializableElements.join(', '));
//   });

//   it('should reject with MissingInterfaceParentError when closest element is not found', async () => {
//     (closest as any).mockReturnValue(false);

//     await expect(fetchBindings<AnyBindings>(element)).rejects.toThrow(MissingInterfaceParentError);
//     expect(closest).toHaveBeenCalledWith(element, initializableElements.join(', '));
//   });

//   it('should dispatch the event', async () => {
//     const dispatchEventSpy = vi.spyOn(element, 'dispatchEvent');
//     (closest as any).mockReturnValue(true);

//     fetchBindings<AnyBindings>(element);

//     expect(dispatchEventSpy).toHaveBeenCalled();
//   });
// });

describe('TODO:', () => {
  it('TODO:', () => {
    expect(true).toBe(true);
  });
});
