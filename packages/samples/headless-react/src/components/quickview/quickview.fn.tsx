import {useEffect, useState, useContext, FunctionComponent} from 'react';
import {buildQuickview, Result} from '@coveo/headless';
import {AppContext} from '../../context/engine';

interface QuickviewProps {
  result: Result;
}

export const Quickview: FunctionComponent<QuickviewProps> = (props) => {
  const {result} = props;
  const {engine} = useContext(AppContext);

  const controller = buildQuickview(engine!, {options: {result}});

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
 * <Quickview result={result} />;
 * ```
 */
