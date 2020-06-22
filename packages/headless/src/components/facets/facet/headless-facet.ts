import {Schema, StringValue} from '@coveo/bueno';
import {Component} from '../../component/headless-component';
import {Engine} from '../../../app/headless-engine';
import {registerFacet} from '../../../features/facets/facet-set/facet-set-actions';
import {randomID} from '../../../utils/utils';
import {facetSelector} from '../../../features/facets/facet-set/facet-set-selectors';

export {FacetValue} from '../../../features/facets/facet-set/facet-set-interfaces';
export type FacetState = Facet['state'];

export type FacetProps = {
  options: FacetOptions;
};

const schema = new Schema({
  /**
   * A unique identifier for the component.
   * By default, a unique random identifier is generated.
   */
  facetId: new StringValue({default: () => randomID('facet')}),
  /** The field whose values you want to display in the facet.*/
  field: new StringValue({required: true}),
});

export type FacetOptions = {
  field: string;
  facetId?: string;
};

export class Facet extends Component {
  private options: Required<FacetOptions>;

  constructor(engine: Engine, props: FacetProps) {
    super(engine);
    this.options = schema.validate(props.options) as Required<FacetOptions>;

    this.register();
  }

  /**
   * @returns The state of the `Facet` component.
   */
  public get state() {
    const response = facetSelector(this.engine.state, this.options.facetId);
    const values = response ? response.values : [];

    return {
      values,
    };
  }

  private register() {
    this.dispatch(registerFacet(this.options));
  }
}
