import {FunctionalComponent, h} from '@stencil/core';

interface Props {
  disabled: boolean;
  textArea?: boolean;
  onFocusout?: (event: FocusEvent) => void;
}

export const SearchBoxWrapper: FunctionalComponent<Props> = (
  props,
  children
) => {
  const getClasses = () => {
    const baseClasses =
      'flex bg-background w-full border border-neutral rounded-md focus-within:ring';
    const focusClasses = props.disabled
      ? 'focus-within:border-disabled focus-within:ring-neutral'
      : 'focus-within:border-primary focus-within:ring-ring-primary';
    const inputTypeClasses = props.textArea
      ? 'absolute top-0 left-0'
      : 'relative h-full';

    return [baseClasses, focusClasses, inputTypeClasses].join(' ');
  };

  return (
    <div part="wrapper" class={getClasses()} onFocusout={props.onFocusout}>
      {children}
    </div>
  );
};
