import {updateSearchConfiguration} from '../configuration/configuration-actions.js';
import {change} from '../history/history-actions.js';
import {getHistoryInitialState} from '../history/history-state.js';
import {setPipeline} from './pipeline-actions.js';
import {pipelineReducer} from './pipeline-slice.js';
import {getPipelineInitialState} from './pipeline-state.js';

describe('pipeline slice', () => {
  it('should have initial state', () => {
    expect(pipelineReducer(undefined, {type: 'randomAction'})).toEqual(
      getPipelineInitialState()
    );
  });

  it('allows to set a pipeline', () => {
    expect(pipelineReducer('foo', setPipeline('bar'))).toBe('bar');
  });

  it('allows to set a pipeline through configuration', () => {
    expect(
      pipelineReducer('foo', updateSearchConfiguration({pipeline: 'bar'}))
    ).toEqual('bar');
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
