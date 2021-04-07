import {useEffect, useState, FunctionComponent} from 'react';
import {Quickview as HeadlessQuickview} from '@coveo/headless';

interface QuickviewProps {
  controller: HeadlessQuickview;
}

export const Quickview: FunctionComponent<QuickviewProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);
  const [isModalOpen, toggleModal] = useState(false);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  const openModal = () => {
    controller.fetchResultContent();
    toggleModal(true);
  };

  const closeModal = () => toggleModal(false);

  if (!state.resultHasPreview) {
    return null;
  }

  if (isModalOpen) {
    return (
      <div>
        <button onClick={() => closeModal()}>X</button>
        <iframe srcDoc={state.content}></iframe>
      </div>
    );
  }

  return <button onClick={() => openModal()}>view</button>;
};

// usage

/**
 * ```tsx
 * const controller = buildQuickview(engine, {
 *   options: {result}
 * });
 *
 * <Quickview controller={controller} />;
 * ```
 */
