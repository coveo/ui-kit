import {resolveSteps} from '../stepsUtils.js';

describe('#resolveSteps', () => {
  it('should return empty array for empty input', () => {
    expect(resolveSteps([])).toEqual([]);
  });

  it('should resolve a full sequence correctly', () => {
    expect(
      resolveSteps([
        {name: 'thinking', status: 'completed', startedAt: 0},
        {name: 'searching', status: 'completed', startedAt: 10},
        {name: 'thinking', status: 'completed', startedAt: 20},
        {name: 'answering', status: 'active', startedAt: 30},
      ])
    ).toEqual([
      {name: 'thinking-before-search', status: 'completed'},
      {name: 'searching', status: 'completed'},
      {name: 'thinking-after-search', status: 'completed'},
      {name: 'answering', status: 'active'},
    ]);
  });

  it('should handle repeated searching steps', () => {
    expect(
      resolveSteps([
        {name: 'thinking', status: 'completed', startedAt: 0},
        {name: 'searching', status: 'completed', startedAt: 10},
        {name: 'thinking', status: 'completed', startedAt: 20},
        {name: 'searching', status: 'completed', startedAt: 30},
        {name: 'thinking', status: 'active', startedAt: 40},
      ])
    ).toEqual([
      {name: 'thinking-before-search', status: 'completed'},
      {name: 'searching', status: 'completed'},
      {name: 'thinking-after-search', status: 'completed'},
      {name: 'searching', status: 'completed'},
      {name: 'thinking-after-search', status: 'active'},
    ]);
  });

  it('should resolve searching step with toolCall query to searching-with-query', () => {
    expect(
      resolveSteps([
        {
          name: 'searching',
          status: 'active',
          startedAt: 0,
          toolCalls: [
            {
              toolCallName: 'search',
              toolCallId: 'tc-1',
              startedAt: 0,
              status: 'active',
              type: 'search',
              toolCallArgs: {q: 'how to reset password'},
            },
          ],
        },
      ])
    ).toEqual([
      {
        name: 'searching-with-query',
        status: 'active',
        searchQuery: 'how to reset password',
      },
    ]);
  });

  it('should expand multiple search toolCalls into separate resolved steps', () => {
    expect(
      resolveSteps([
        {
          name: 'searching',
          status: 'completed',
          startedAt: 0,
          toolCalls: [
            {
              toolCallName: 'search',
              toolCallId: 'tc-1',
              startedAt: 0,
              finishedAt: 1,
              status: 'completed',
              type: 'search',
              toolCallArgs: {q: 'What is Quantic'},
            },
            {
              toolCallName: 'search',
              toolCallId: 'tc-2',
              startedAt: 1,
              finishedAt: 2,
              status: 'completed',
              type: 'search',
              toolCallArgs: {q: 'What is Atomic'},
            },
          ],
        },
      ])
    ).toEqual([
      {
        name: 'searching-with-query',
        status: 'completed',
        searchQuery: 'What is Quantic',
      },
      {
        name: 'searching-with-query',
        status: 'completed',
        searchQuery: 'What is Atomic',
      },
    ]);
  });

  it('should fall back to searching when toolCalls is absent', () => {
    expect(
      resolveSteps([{name: 'searching', status: 'active', startedAt: 0}])
    ).toEqual([{name: 'searching', status: 'active'}]);
  });
});
