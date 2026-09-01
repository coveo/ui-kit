import {useRemoteController} from '../controllers.js';
import {useStateSource} from '../state-source-context.js';
import {RegularFacetRenderer} from '../RegularFacet/RegularFacet.js';
import {NumericFacetRenderer} from '../NumericFacet/NumericFacet.js';
import {CategoryFacetRenderer} from '../CategoryFacet/CategoryFacet.js';
import type {
  FacetManagerProps,
  RegularFacetProps,
  NumericFacetProps,
  CategoryFacetProps,
} from '@coveo/thermidor-schema';
import styles from './FacetManager.module.css';

export type FacetProps = RegularFacetProps | NumericFacetProps | CategoryFacetProps;

function renderChild(props: FacetProps) {
  switch (props.componentType) {
    case 'regular-facet':
      return <RegularFacetRenderer props={props} />;
    case 'numeric-facet':
      return <NumericFacetRenderer props={props} />;
    case 'category-facet':
      return <CategoryFacetRenderer props={props} />;
    default:
      return null;
  }
}

export function FacetManagerRenderer({
  props,
  childComponents,
}: {
  props: FacetManagerProps;
  childComponents: Map<string, FacetProps>;
}) {
  const stateSource = useStateSource();
  const controller = useRemoteController(stateSource, props.componentId, props.componentType);

  if (!controller.state) {
    return null;
  }

  const {facetIds} = controller.state;

  return (
    <div className={styles.container} data-testid={props.componentId}>
      {facetIds.map((facetId) => {
        const facetProps = childComponents.get(facetId);
        if (!facetProps) {
          return null;
        }
        return <div key={facetId}>{renderChild(facetProps)}</div>;
      })}
    </div>
  );
}
