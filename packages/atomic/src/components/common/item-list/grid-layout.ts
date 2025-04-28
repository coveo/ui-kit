import {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {html} from 'lit';
import {ref as litRef} from 'lit/directives/ref.js';

export interface GridLayoutProps {
  item: {clickUri: string; title: string};
  selectorForItem: string;
  setRef: (element?: Element) => void;
}

export const renderGridLayout: FunctionalComponentWithChildren<
  GridLayoutProps
> = ({props}) => {
  const {selectorForItem, setRef} = props;

  let ref: Element | undefined;

  const handleClick = (event: Event) => {
    event.preventDefault();
    (ref?.querySelector(selectorForItem) as HTMLElement)?.click();
  };

  return (children) =>
    html` <div
      part="result-list-grid-clickable-container outline"
      ${litRef((element) => {
        ref = element;
        setRef(element);
      })}
      @click=${handleClick}
    >
      ${children}
    </div>`;
};
