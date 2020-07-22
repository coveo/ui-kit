import {buildMockEngine, MockEngine} from '../../test/mock-engine';
import {Pipeline} from './headless-pipeline';
import {setPipeline} from '../../features/pipeline/pipeline-actions';

describe('Pipeline', () => {
  let engine: MockEngine;
  let pipeline: Pipeline;

  beforeEach(() => {
    engine = buildMockEngine();
    pipeline = new Pipeline(engine);
  });

  it('#setPipeline dispatches #setPipeline with the passed pipeline', () => {
    pipeline.setPipeline('foo');
    expect(engine.actions).toContainEqual(setPipeline('foo'));
  });
});
