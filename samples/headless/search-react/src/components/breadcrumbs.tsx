import type {BreadcrumbManager} from '@coveo/headless';
import {useController} from '../use-controller';

interface BreadcrumbsProps {
  controller: BreadcrumbManager;
}

/**
 * Shows the active facet selections as removable chips, plus a "Clear all"
 * button. Backed by a Headless `BreadcrumbManager`.
 */
export function Breadcrumbs({controller}: BreadcrumbsProps) {
  const {facetBreadcrumbs, categoryFacetBreadcrumbs} = useController(controller);

  const crumbs = [
    ...facetBreadcrumbs.flatMap((facet) =>
      facet.values.map((value) => ({
        key: `${facet.facetId}:${value.value.value}`,
        label: `${facet.field}: ${value.value.value}`,
        deselect: value.deselect,
      }))
    ),
    // A category (hierarchical) selection is shown as a single chip spanning
    // the whole drilled-down path, e.g. "ec_category: Sensors / Cameras".
    ...categoryFacetBreadcrumbs.map((facet) => ({
      key: facet.facetId,
      label: `${facet.field}: ${facet.path.map((value) => value.value).join(' / ')}`,
      deselect: facet.deselect,
    })),
  ];

  if (crumbs.length === 0) {
    return null;
  }

  return (
    <div className="breadcrumbs">
      {crumbs.map((crumb) => (
        <button type="button" className="breadcrumb" key={crumb.key} onClick={crumb.deselect}>
          {crumb.label} ✕
        </button>
      ))}
      <button
        type="button"
        className="breadcrumb breadcrumb--clear"
        onClick={() => controller.deselectAll()}
      >
        Clear all
      </button>
    </div>
  );
}
