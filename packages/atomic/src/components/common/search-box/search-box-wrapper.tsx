import {FunctionalComponent, h} from '@stencil/core';

interface Props {
  disabled: boolean;
  onFocusout?: (event: FocusEvent) => void;
}

export const SearchBoxWrapper: FunctionalComponent<Props> = (
  props,
  children
) => {
  const getClasses = () => {
    const baseClasses =
      'flex bg-background w-full border border-neutral rounded-md focus-within:ring absolute top-0 left-0';
    const focusClasses = props.disabled
      ? 'focus-within:border-disabled focus-within:ring-neutral'
      : 'focus-within:border-primary focus-within:ring-ring-primary';

    return [baseClasses, focusClasses].join(' ');
  };

  return (
    <div part="wrapper" class={getClasses()} onFocusout={props.onFocusout}>
      {children}
    </div>
  );
};
