import {Engine} from '../../app/headless-engine';
import {Controller} from '../controller/headless-controller';
import {setPipeline} from '../../features/pipeline/pipeline-actions';

/** The state relevant to the `Pipeline` controller.*/
export type PipelineState = Pipeline['state'];

export class Pipeline extends Controller {
  constructor(engine: Engine) {
    super(engine);
  }

  /**
   * @returns The state of the `Pipeline` controller.
   */
  public get state() {
    const state = this.engine.state;

    return {
      pipeline: state.pipeline,
    };
  }

  public setPipeline(pipeline: string) {
    this.dispatch(setPipeline(pipeline));
  }
}
