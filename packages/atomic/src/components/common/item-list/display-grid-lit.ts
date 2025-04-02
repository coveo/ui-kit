import {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {html, TemplateResult} from 'lit';
import {createRef, Ref, ref} from 'lit/directives/ref.js';

export interface DisplayGridProps {
  selectorForItem: string;
  item: {clickUri: string; title: string};
  setRef: (element?: Element) => void;
  select: () => void;
  beginDelayedSelect: () => void;
  cancelPendingSelect: () => void;
}

export const DisplayGrid: FunctionalComponentWithChildren<DisplayGridProps> = ({
  props,
}) => {
  const {selectorForItem} = props;

  const r: Ref<HTMLElement> = createRef();

  const setRef = (element: Element | undefined) => {
    props.setRef(element);
    return r;
  };

  const handleClick = (event: Event) => {
    event.preventDefault();
    (r.value?.querySelector(selectorForItem) as HTMLElement)?.click();
  };

  return (children: TemplateResult) =>
    html` <div
      part="result-list-grid-clickable-container outline"
      ${ref(setRef)}
      @click="${handleClick}"
    >
      ${children}
    </div>`;
};
