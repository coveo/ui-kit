import {updateSearchConfiguration} from '../configuration/configuration-actions';
import {change} from '../history/history-actions';
import {getHistoryInitialState} from '../history/history-state';
import {setPipeline} from './pipeline-actions';
import {pipelineReducer} from './pipeline-slice';
import {getPipelineInitialState} from './pipeline-state';

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
