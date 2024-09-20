import {setExcerptLength} from './excerpt-length-actions.js';
import {excerptLengthReducer} from './excerpt-length-slice.js';
import {getExcerptLengthInitialState} from './excerpt-length-state.js';

describe('excerpt length slice', () => {
  it('#setExcerptLength should set the value in the state', () => {
    const state = excerptLengthReducer(
      getExcerptLengthInitialState(),
      setExcerptLength(1234)
    );
    expect(state.length).toBe(1234);
  });
});
