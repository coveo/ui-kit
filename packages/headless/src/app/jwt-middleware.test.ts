/* eslint-disable @typescript-eslint/no-explicit-any */
import {buildMockSearchAppEngine} from '../test';

describe('jwtMiddleware', () => {
  it('when a state contains no configuration, it should not throw an error', () => {
    const e = buildMockSearchAppEngine();
    e.state = {completely: 'random'} as any;
    const {dispatch} = e;

    const action = {type: 'foo'};
    expect(() => dispatch(action)).not.toThrow();
  });

  it('when configuration contains a non JWT access token, it should not throw an error', () => {
    const e = buildMockSearchAppEngine();
    e.state.configuration.accessToken = 'completely random';
    const {dispatch} = e;

    const action = {type: 'foo'};
    expect(() => dispatch(action)).not.toThrow();
  });

  it('when configuration contains a non JWT access token, it should not throw an error', () => {
    const e = buildMockSearchAppEngine();
    e.state.configuration.accessToken = 'completely random';
    const {dispatch} = e;

    const action = {type: 'foo'};
    expect(() => dispatch(action)).not.toThrow();
  });

  describe('when configuration contains a JWT access token', () => {});
});
