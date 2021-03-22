import {useEffect, useState, FunctionComponent} from 'react';
import {BreadcrumbManager as HeadlessBreadcrumbManager} from '@coveo/headless';

interface BreadcrumbManagerProps {
  controller: HeadlessBreadcrumbManager;
}

export const BreadcrumbManager: FunctionComponent<BreadcrumbManagerProps> = (
  props
) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  if (!state?.hasBreadcrumbs) {
    return null;
  }

  return (
    <ul>
      {state.facetBreadcrumbs.map((facet) => (
        <li key={facet.facetId}>
          {facet.field}:{' '}
          {facet.values.map((breadcrumb) => (
            <button
              key={breadcrumb.value.value}
              onClick={() => breadcrumb.deselect()}
            >
              {breadcrumb.value.value}
            </button>
          ))}
        </li>
      ))}
    </ul>
  );
};

// usage

/**
 * ```tsx
 * const controller = buildBreadcrumbManager(engine);
 *
 * <BreadcrumbManager controller={controller} />;
 * ```
 */
