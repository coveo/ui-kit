import {pipelineReducer, getPipelineInitialState} from './pipeline-slice';
import {setPipeline} from './pipeline-actions';
import {change} from '../history/history-actions';
import {getHistoryInitialState} from '../history/history-slice';

describe('pipeline slice', () => {
  it('should have initial state', () => {
    expect(pipelineReducer(undefined, {type: 'randomAction'})).toEqual(
      getPipelineInitialState()
    );
  });

  it('allows to set a pipeline', () => {
    expect(pipelineReducer('foo', setPipeline('bar'))).toBe('bar');
  });

  it('allows to restore a pipeline on history change', () => {
    const state = 'foo';
    const historyChange = {
      ...getHistoryInitialState(),
      pipeline: 'bar',
    };

    const nextState = pipelineReducer(
      state,
      change.fulfilled(historyChange, '')
    );

    expect(nextState).toEqual('bar');
  });
});
