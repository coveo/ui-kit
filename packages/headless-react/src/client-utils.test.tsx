import '@testing-library/jest-dom';
import {act, render, screen} from '@testing-library/react';
import {useEffect} from 'react';
import {useSyncMemoizedStore, Subscriber} from './client-utils';

describe('useSyncMemoizedStore', () => {
  test('should return the initial snapshot', () => {
    const snapshot = {count: 0};
    const unsubscribe = jest.fn();
    const subscribe = jest.fn(() => unsubscribe);
    const getSnapshot = jest.fn(() => snapshot);

    const TestComponent = () => {
      const state = useSyncMemoizedStore(subscribe, getSnapshot);
      return <div>{JSON.stringify(state)}</div>;
    };

    render(<TestComponent />);

    expect(screen.getByText(JSON.stringify(snapshot))).toBeInTheDocument();
  });

  test('should update the state when the store changes', () => {
    const snapshot1 = {count: 0};
    const snapshot2 = {count: 1};
    const subscribe = jest.fn(() => jest.fn());
    const getSnapshot = jest
      .fn()
      .mockReturnValueOnce(snapshot1)
      .mockReturnValueOnce(snapshot2);

    interface TestProps {
      id: string;
    }

    function TestComponent({id}: TestProps) {
      const state = useSyncMemoizedStore(subscribe, getSnapshot);
      return <div key={id}>{JSON.stringify(state)}</div>;
    }

    const {rerender} = render(<TestComponent id="1" />);
    expect(screen.getByText(JSON.stringify(snapshot1))).toBeInTheDocument();

    rerender(<TestComponent id="2" />);
    expect(screen.getByText(JSON.stringify(snapshot2))).toBeInTheDocument();
  });

  test('should unsubscribe and re-subscribe to new function when subscribe function is changed', () => {
    const snapshot = {count: 0};
    const unsubscribe1 = jest.fn();
    const unsubscribe2 = jest.fn();
    const subscribe1 = jest.fn(() => unsubscribe1);
    const subscribe2 = jest.fn(() => unsubscribe2);
    const getSnapshot = jest.fn(() => snapshot);

    interface TestProps {
      subscribe: Subscriber;
    }

    function TestComponent({subscribe}: TestProps) {
      const state = useSyncMemoizedStore(subscribe, getSnapshot);
      return <div>{JSON.stringify(state)}</div>;
    }

    const {rerender} = render(<TestComponent subscribe={subscribe1} />);

    expect(screen.getByText(JSON.stringify(snapshot))).toBeInTheDocument();
    expect(subscribe1).toHaveBeenCalledTimes(1);
    expect(unsubscribe1).not.toHaveBeenCalled();
    expect(subscribe2).not.toHaveBeenCalled();

    rerender(<TestComponent subscribe={subscribe2} />);
    expect(unsubscribe1).toHaveBeenCalledTimes(1);
    expect(subscribe2).toHaveBeenCalledTimes(1);
    expect(unsubscribe2).not.toHaveBeenCalled();
  });
  test('should replace current snapshot when getSnapshot function is changed', () => {
    const snapshot1 = {count: 0};
    const snapshot2 = {count: 1};
    const unsubscribe = jest.fn();
    const subscribe = jest.fn(() => unsubscribe);
    const getSnapshot1 = jest.fn(() => snapshot1);
    const getSnapshot2 = jest.fn(() => snapshot2);

    interface TestProps {
      getSnapshot: () => {};
    }

    function TestComponent({getSnapshot}: TestProps) {
      const state = useSyncMemoizedStore(subscribe, getSnapshot);
      return <div>{JSON.stringify(state)}</div>;
    }

    const {rerender} = render(<TestComponent getSnapshot={getSnapshot1} />);

    expect(screen.getByText(JSON.stringify(snapshot1))).toBeInTheDocument();

    rerender(<TestComponent getSnapshot={getSnapshot2} />);

    expect(screen.getByText(JSON.stringify(snapshot2))).toBeInTheDocument();
  });

  it('should re-render only when the subscribe listener is called', () => {
    const snapshot = {count: 0};
    const unsubscribe = jest.fn();
    const subscribe = jest.fn(() => unsubscribe);
    const getSnapshot = jest.fn(() => snapshot);
    const effect = jest.fn();

    const TestComponent = () => {
      const state = useSyncMemoizedStore(subscribe, getSnapshot);
      useEffect(effect, [state]);
      return <div>{JSON.stringify(state)}</div>;
    };

    render(<TestComponent />);

    expect(screen.getByText(JSON.stringify(snapshot))).toBeInTheDocument();

    act(() => {
      subscribe();
    });

    expect(effect).toHaveBeenCalledTimes(1);
  });
});
