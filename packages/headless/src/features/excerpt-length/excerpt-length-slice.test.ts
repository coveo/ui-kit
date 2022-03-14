import {setExcerptLength} from './excerpt-length-actions';
import {excerptLengthReducer} from './excerpt-length-slice';
import {getExcerptLengthInitialState} from './excerpt-length-state';

describe('excerpt length slice', () => {
  it('#setExcerptLength should set the value in the state', () => {
    const state = excerptLengthReducer(
      getExcerptLengthInitialState(),
      setExcerptLength(1234)
    );
    expect(state.length).toBe(1234);
  });
});
