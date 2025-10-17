import {debounce, removeDuplicates} from './utils.js';

describe('removeDuplicates', () => {
  it('should return reduced array based on received predicate', () => {
    const objectToProcess = [
      {discriminator: 'a'},
      {discriminator: 'b'},
      {discriminator: 'a'},
    ];

    expect(removeDuplicates(objectToProcess, (v) => v.discriminator)).toEqual([
      {discriminator: 'a'},
      {discriminator: 'b'},
    ]);
  });

  it('should keep left-most element when duplicates are found', () => {
    const arr = [
      {discriminator: 'a', otherProperty: 1},
      {discriminator: 'a', otherProperty: 2},
      {discriminator: 'a', otherProperty: 3},
      {discriminator: 'b', otherProperty: 1},
      {discriminator: 'c', otherProperty: 1},
      {discriminator: 'b', otherProperty: 2},
      {discriminator: 'd', otherProperty: 1},
    ];

    expect(removeDuplicates(arr, (v) => v.discriminator)).toEqual([
      {discriminator: 'a', otherProperty: 1},
      {discriminator: 'b', otherProperty: 1},
      {discriminator: 'c', otherProperty: 1},
      {discriminator: 'd', otherProperty: 1},
    ]);
  });

  it('should preserve original order', () => {
    const arr = [
      {discriminator: 'h'},
      {discriminator: 'e'},
      {discriminator: 'h'},
      {discriminator: 'l'},
      {discriminator: 'l'},
      {discriminator: 'L'},
      {discriminator: 'o'},
      {discriminator: 'o'},
      {discriminator: ' '},
      {discriminator: 'o'},
      {discriminator: 'w'},
      {discriminator: ' '},
      {discriminator: 'O'},
      {discriminator: 'O'},
      {discriminator: 'w'},
      {discriminator: 'r'},
      {discriminator: 'w'},
      {discriminator: 'r'},
      {discriminator: '7'},
      {discriminator: 'd'},
      {discriminator: '!'},
      {discriminator: '7'},
    ];

    expect(removeDuplicates(arr, (v) => v.discriminator)).toEqual([
      {discriminator: 'h'},
      {discriminator: 'e'},
      {discriminator: 'l'},
      {discriminator: 'L'},
      {discriminator: 'o'},
      {discriminator: ' '},
      {discriminator: 'w'},
      {discriminator: 'O'},
      {discriminator: 'r'},
      {discriminator: '7'},
      {discriminator: 'd'},
      {discriminator: '!'},
    ]);
  });
});

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should delay the execution of the function', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 500);

    debouncedFn('test');

    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('test');
  });

  it('should debounce multiple calls within the wait time', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 500);

    debouncedFn('first');
    debouncedFn('second');
    debouncedFn('third');

    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('third');
  });

  it('should call the function immediately when isImmediate is true', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 500, {isImmediate: true});

    debouncedFn('immediate');

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('immediate');
  });

  it('should not call the function again during the wait period with isImmediate', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 500, {isImmediate: true});

    debouncedFn('first');
    debouncedFn('second');
    debouncedFn('third');

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('first');

    // Even after advancing time, should still only have been called once
    // because isImmediate prevents the setTimeout callback from executing
    vi.advanceTimersByTime(500);

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should allow immediate execution after wait time has passed', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 500, {isImmediate: true});

    debouncedFn('first');
    expect(mockFn).toHaveBeenCalledWith('first');

    vi.advanceTimersByTime(500);

    debouncedFn('second');
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith('second');
  });

  it('should preserve the context and return value of the original function', () => {
    const originalFn = function (this: {value: number}, x: number) {
      return this.value + x;
    };
    const context = {value: 10};
    const debouncedFn = debounce(originalFn.bind(context), 100, {
      isImmediate: true,
    });

    const result = debouncedFn(5);

    expect(result).toBe(15);
  });

  it('should handle functions with no arguments', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 300);

    debouncedFn();

    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith();
  });

  it('should handle functions with multiple arguments', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 200);

    debouncedFn('arg1', 'arg2', 'arg3');

    vi.advanceTimersByTime(200);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
  });

  it('should reset the timer on each call', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 500);

    debouncedFn('first');
    vi.advanceTimersByTime(300);

    debouncedFn('second');
    vi.advanceTimersByTime(300);

    // Should not have been called yet since we reset the timer
    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('second');
  });
});
