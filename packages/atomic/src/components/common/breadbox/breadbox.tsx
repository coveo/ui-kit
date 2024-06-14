import {FacetValueState} from '@coveo/headless';
import {h, VNode, Host, FunctionalComponent, Fragment} from '@stencil/core';
import CloseIcon from '../../../images/close.svg';
import {FocusTargetController} from '../../../utils/accessibility-utils';
import {Button} from '../button';
import {AnyBindings} from '../interface/bindings';

export interface IBreadcrumb {
  facetId: string;
  label: string;
  formattedValue: string[];
  state?: FacetValueState;
  content?: VNode;
  deselect: () => void;
}

export interface BreadcrumbContainerProps {
  isCollapsed: boolean;
  bindings: AnyBindings;
}

const SEPARATOR = ' / ';

export const BreadcrumbContainer: FunctionalComponent<
  BreadcrumbContainerProps
> = (props, children) => {
  return (
    <Host>
      <div part="container" class="flex text-sm text-on-background">
        <span part="label" class="font-bold py-[0.625rem] pl-0 pr-2">
          {props.bindings.i18n.t('with-colon', {
            text: props.bindings.i18n.t('filters'),
          })}
        </span>
        <div part="breadcrumb-list-container" class="relative grow">
          <ul
            part="breadcrumb-list"
            class={`flex gap-1 ${
              props.isCollapsed ? 'flex-nowrap absolute w-full' : 'flex-wrap'
            }`}
          >
            {...children}
          </ul>
        </div>
      </div>
    </Host>
  );
};

export interface BreadcrumbControlsProps {
  numberOfCollapsedBreadcrumbs: number;
  lastRemovedBreadcrumbIndex: number | undefined;
  onClickClearAll: ((event?: MouseEvent | undefined) => void) | undefined;
  numberOfBreadcrumbs: number;
  firstExpandedBreadcrumbIndex: number | undefined;
  focusTargets: BreadboxFocusTargets;
  showMore: HTMLButtonElement;
  showLess: HTMLButtonElement;
  isCollapsed: boolean;
  bindings: AnyBindings;
}

export const BreadcrumbControls: FunctionalComponent<
  BreadcrumbControlsProps
> = (props) => {
  if (props.isCollapsed) {
    return;
  }
  return (
    <Fragment>
      <BreadcrumbShowMore
        numberOfBreadcrumbs={props.numberOfBreadcrumbs}
        firstExpandedBreadcrumbIndex={props.firstExpandedBreadcrumbIndex ?? 0}
        showMore={props.showMore}
        focusTargets={props.focusTargets}
        isCollapsed={props.isCollapsed}
        bindings={props.bindings}
        numberOfCollapsedBreadcrumbs={props.numberOfCollapsedBreadcrumbs}
      ></BreadcrumbShowMore>
      ,
      <BreadcrumbShowLess
        focusTargets={props.focusTargets}
        showLess={props.showLess}
        isCollapsed={props.isCollapsed}
        bindings={props.bindings}
      ></BreadcrumbShowLess>
      ,
      <BreadcrumbClearAll
        onClick={props.onClickClearAll}
        numberOfBreadcrumbs={props.numberOfBreadcrumbs}
        firstExpandedBreadcrumbIndex={props.firstExpandedBreadcrumbIndex}
        showMore={props.showMore}
        focusTargets={props.focusTargets}
        isCollapsed={props.isCollapsed}
        bindings={props.bindings}
        lastRemovedBreadcrumbIndex={props.lastRemovedBreadcrumbIndex}
      ></BreadcrumbClearAll>
      ,
    </Fragment>
  );
};

export interface BreadcrumbShowLessProps {
  focusTargets: BreadboxFocusTargets;
  showLess: HTMLButtonElement;
  isCollapsed: boolean;
  bindings: AnyBindings;
}

export const BreadcrumbShowLess: FunctionalComponent<
  BreadcrumbShowLessProps
> = (props) => {
  if (props.isCollapsed) {
    return;
  }
  return (
    <li key="show-less">
      <Button
        ref={(ref) => (props.showLess = ref!)}
        part="show-less"
        style="outline-primary"
        text={props.bindings.i18n.t('show-less')}
        class="p-2 btn-pill"
        onClick={() => {
          props.focusTargets.breadcrumbShowLessFocus.focusOnNextTarget();
          props.isCollapsed = true;
        }}
      ></Button>
    </li>
  );
};

export interface BreadcrumbShowMoreProps {
  numberOfCollapsedBreadcrumbs: number;
  numberOfBreadcrumbs: number;
  firstExpandedBreadcrumbIndex: number;
  showMore: HTMLButtonElement;
  focusTargets: BreadboxFocusTargets;
  isCollapsed: boolean;
  bindings: AnyBindings;
}

export const BreadcrumbShowMore: FunctionalComponent<
  BreadcrumbShowMoreProps
> = (props) => {
  if (!props.isCollapsed) {
    return;
  }
  return (
    <li key="show-more">
      <Button
        ref={(ref) => {
          props.focusTargets.breadcrumbShowLessFocus.setTarget(ref!);
          props.showMore = ref!;
        }}
        part="show-more"
        style="outline-primary"
        class="p-2 btn-pill whitespace-nowrap"
        onClick={() => {
          props.firstExpandedBreadcrumbIndex =
            props.numberOfBreadcrumbs - props.numberOfCollapsedBreadcrumbs;
          props.focusTargets.breadcrumbShowMoreFocus.focusOnNextTarget();
          props.isCollapsed = false;
        }}
      ></Button>
    </li>
  );
};

type BreadboxFocusTargets = {
  breadcrumbRemovedFocus: FocusTargetController;
  breadcrumbShowLessFocus: FocusTargetController;
  breadcrumbShowMoreFocus: FocusTargetController;
};

export interface BreadcrumbClearAllProps {
  lastRemovedBreadcrumbIndex: number | undefined;
  onClick: ((event?: MouseEvent | undefined) => void) | undefined;
  numberOfBreadcrumbs: number;
  firstExpandedBreadcrumbIndex: number | undefined;
  showMore: HTMLButtonElement;
  focusTargets: BreadboxFocusTargets;
  isCollapsed: boolean;
  bindings: AnyBindings;
}

export const BreadcrumbClearAll: FunctionalComponent<
  BreadcrumbClearAllProps
> = (props) => {
  const isFocusTarget =
    props.lastRemovedBreadcrumbIndex === props.numberOfBreadcrumbs;

  return (
    <li key="clear-all">
      <Button
        part="clear"
        style="text-primary"
        text={props.bindings.i18n.t('clear')}
        class="p-2 btn-pill"
        ariaLabel={props.bindings.i18n.t('clear-all-filters')}
        onClick={props.onClick}
        ref={
          isFocusTarget
            ? props.focusTargets.breadcrumbRemovedFocus.setTarget
            : undefined
        }
      ></Button>
    </li>
  );
};

export interface BreadcrumbButtonProps {
  limitPath(path: string[]): string;
  numberOfBreadcrumbs: number;
  focusTargets: BreadboxFocusTargets;
  lastRemovedBreadcrumbIndex: number | undefined;
  firstExpandedBreadcrumbIndex: number | undefined;
  breadcrumb: IBreadcrumb;
  index: number;
  totalBreadcrumbs: number;
  bindings: AnyBindings;
}

export const BreadcrumbButton: FunctionalComponent<BreadcrumbButtonProps> = (
  props
) => {
  const classNames = [
    'py-2',
    'px-3',
    'flex',
    'items-center',
    'btn-pill',
    'group',
  ];

  const fullValue = Array.isArray(props.breadcrumb.formattedValue)
    ? props.breadcrumb.formattedValue.join(SEPARATOR)
    : props.breadcrumb.formattedValue;
  const title = `${props.breadcrumb.label}: ${fullValue}`;
  const isLastBreadcrumb = props.totalBreadcrumbs === 1;
  const isExclusion = props.breadcrumb.state === 'excluded';
  const activeColor = isExclusion ? 'error' : 'primary';
  const value = Array.isArray(props.breadcrumb.formattedValue)
    ? props.limitPath(props.breadcrumb.formattedValue)
    : props.breadcrumb.formattedValue;

  return (
    <li class="breadcrumb" key={value}>
      <Button
        part="breadcrumb-button"
        style={isExclusion ? 'outline-error' : 'outline-bg-neutral'}
        class={classNames.join(' ')}
        title={title}
        // TODO: [KIT-2939] Replace `remove-filter-on` by `remove-include-filter-on`.
        ariaLabel={props.bindings.i18n.t(
          isExclusion ? 'remove-exclusion-filter-on' : 'remove-filter-on',
          {
            value: title,
          }
        )}
        onClick={() => {
          if (isLastBreadcrumb) {
            props.bindings.store.state.resultList?.focusOnFirstResultAfterNextSearch();
          } else if (props.numberOfBreadcrumbs > 1) {
            props.focusTargets.breadcrumbRemovedFocus.focusAfterSearch();
          }

          props.lastRemovedBreadcrumbIndex = props.index;
          props.breadcrumb.deselect();
        }}
        ref={(ref) => {
          if (props.lastRemovedBreadcrumbIndex === props.index) {
            props.focusTargets.breadcrumbRemovedFocus.setTarget(ref);
          }
          if (props.firstExpandedBreadcrumbIndex === props.index) {
            props.focusTargets.breadcrumbShowMoreFocus.setTarget(ref);
          }
        }}
      >
        <span
          part="breadcrumb-label"
          class={`max-w-snippet truncate group-hover:text-${activeColor} group-focus-visible:text-${activeColor} ${props.breadcrumb.state}`}
        >
          {props.bindings.i18n.t('with-colon', {text: props.breadcrumb.label})}
        </span>
        <span
          part="breadcrumb-value"
          class={
            props.breadcrumb.content
              ? ''
              : `max-w-snippet truncate ${props.breadcrumb.state}`
          }
        >
          {props.breadcrumb.content ?? value}
        </span>
        <atomic-icon
          part="breadcrumb-clear"
          class="w-2.5 h-2.5 ml-2 mt-px"
          icon={CloseIcon}
        ></atomic-icon>
      </Button>
    </li>
  );
};
