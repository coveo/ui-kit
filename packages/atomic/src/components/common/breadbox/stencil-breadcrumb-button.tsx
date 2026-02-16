import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {Button} from '../stencil-button';
import {Breadcrumb} from './breadcrumb-types';
import {
  joinBreadcrumbValues,
  getFirstBreadcrumbValue,
} from './breadcrumb-utils';

interface BreadcrumbButtonProps {
  onSelectBreadcrumb: () => void;
  setRef: (el: HTMLButtonElement) => void;
  pathLimit: number;
  breadcrumb: Breadcrumb;
  i18n: i18n;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const BreadcrumbButton: FunctionalComponent<BreadcrumbButtonProps> = (
  props,
  children
) => {
  const classNames = [
    'py-2',
    'px-3',
    'flex',
    'items-center',
    'rounded-xl',
    'group',
  ];

  const fullValue = joinBreadcrumbValues(props.breadcrumb);
  const value = getFirstBreadcrumbValue(props.breadcrumb, props.pathLimit);
  const title = `${props.breadcrumb.label}: ${fullValue}`;
  const isExclusion = props.breadcrumb.state === 'excluded';

  return (
    <li class="breadcrumb" key={value}>
      <Button
        ref={props.setRef}
        part="breadcrumb-button"
        style={isExclusion ? 'outline-error' : 'outline-bg-neutral'}
        class={classNames.join(' ')}
        title={title}
        ariaLabel={props.i18n.t(
          isExclusion
            ? 'remove-exclusion-filter-on'
            : 'remove-inclusion-filter-on',
          {
            value: title,
          }
        )}
        onClick={props.onSelectBreadcrumb}
      >
        {children}
      </Button>
    </li>
  );
};
