# Recent Queries and Results Patterns

## Overview

The UI Kit provides sophisticated management of user's recent queries and results through dedicated controllers and state management patterns. These features enhance user experience by enabling quick access to previous searches and results.

## Architecture

### Core Controllers

#### Recent Queries List

- **Controller**: `RecentQueriesList`
- **Location**: `controllers/recent-queries-list/`
- **Purpose**: Manages user's search query history

#### Recent Results List

- **Controller**: `RecentResultsList`
- **Location**: `controllers/recent-results-list/`
- **Purpose**: Manages user's recently accessed results

#### Commerce Variants

- Commerce-specific implementations for e-commerce use cases
- Extended functionality for product-focused experiences

### State Management

#### Recent Queries State

```typescript
interface RecentQueriesState {
  queries: string[];
  maxLength: number;
}
```

#### Recent Results State

```typescript
interface RecentResultsState {
  results: Result[];
  maxLength: number;
}
```

## Implementation Patterns

### Controller Initialization

#### Basic Setup

```typescript
const recentQueriesList = buildRecentQueriesList(engine, {
  initialState: {
    queries: [],
  },
  options: {
    maxLength: 10,
    clearFilters: true,
  },
});
```

#### Advanced Configuration

```typescript
const recentResultsList = buildRecentResultsList(engine, {
  initialState: {
    results: persistedResults,
  },
  options: {
    maxLength: 15,
  },
});
```

### State Updates

#### Query Management

```typescript
// Automatic query capture on search execution
// Manual query updates
recentQueriesList.updateRecentQueries(['query1', 'query2']);

// Clear all queries
recentQueriesList.clear();

// Execute a recent query
recentQueriesList.executeRecentQuery(index);
```

#### Result Management

```typescript
// Results are automatically captured on result interactions
// Manual result clearing
recentResultsList.clear();

// Access recent results
const recentResults = recentResultsList.state.results;
```

## Redux Integration

### Actions

#### Recent Queries Actions

- `registerRecentQueries`: Initialize with query list and options
- `clearRecentQueries`: Clear all stored queries
- Automatic capture on `executeSearch.fulfilled`

#### Recent Results Actions

- `registerRecentResults`: Initialize with result list and options
- `clearRecentResults`: Clear all stored results
- `pushRecentResult`: Add individual result

### Reducers

#### Query Handling

```typescript
export function handleRegisterQueries(
  state: WritableDraft<RecentQueriesState>,
  action: ReturnType<typeof registerRecentQueries>
) {
  // Normalize queries: trim, lowercase, deduplicate
  state.queries = Array.from(
    new Set(action.payload.queries.map((query) => query.trim().toLowerCase()))
  ).slice(0, action.payload.maxLength);

  state.maxLength = action.payload.maxLength;
}
```

#### Search Integration

```typescript
.addCase(executeSearch.fulfilled, (state, action) => {
  const query = action.payload.queryExecuted;
  const results = action.payload.response.results;

  if (!query.length || !results.length) {
    return;
  }

  handleExecuteSearchFulfilled(query, state);
})
```

## Component Integration

### Atomic Components

#### Recent Queries List Component

```html
<atomic-recent-queries-list>
  <!-- Automatically renders recent queries -->
</atomic-recent-queries-list>
```

#### Search Box Integration

```html
<atomic-search-box>
  <!-- Recent queries appear in suggestions -->
</atomic-search-box>
```

### Quantic (Salesforce) Integration

#### Component Usage

```javascript
// In LWC components
buildRecentQueriesList(this.engine);

// Handle query selection
handleRecentQuerySelection(event) {
  const { selection } = event.detail;
  if (selection.isRecentQuery) {
    this.recentQueriesList.executeRecentQuery(selection.index);
  }
}
```

#### Event Handling

```javascript
// Recent query clear action
handleClearRecentQueries() {
  this.recentQueriesList.clear();
  this.dispatchEvent(new CustomEvent('quantic__clearrecentqueries'));
}
```

## Data Persistence

### Browser Storage

- Recent queries/results typically stored in browser storage
- Configurable storage mechanisms
- Automatic cleanup based on maxLength

### State Restoration

```typescript
// On application startup
const persistedQueries = getStoredQueries();
recentQueriesList.updateRecentQueries(persistedQueries);
```

## Advanced Features

### Query Filtering

```typescript
// Filter recent queries by current input
buildRecentQueriesThatStartWithCurrentQuery() {
  return this.recentQueries
    .filter(query =>
      query !== this.currentQuery &&
      query.toLowerCase().startsWith(this.currentQuery?.toLowerCase())
    )
    .map(query => ({
      value: formatRecentQuery(query, this.currentQuery),
      rawValue: query,
      isRecentQuery: true
    }));
}
```

### Analytics Integration

- Recent query executions tracked as analytics events
- Clear actions logged for usage analysis
- Integration with search analytics pipeline

### Performance Optimizations

- Debounced state updates
- Efficient deduplication algorithms
- Memory-conscious result storage

## Testing Strategies

### Unit Testing

```typescript
describe('recent queries list', () => {
  it('should register with default props', () => {
    expect(registerRecentQueries).toHaveBeenCalledWith({
      queries: [],
      maxLength: 10,
    });
  });

  it('should handle query execution', () => {
    recentQueriesList.executeRecentQuery(0);
    expect(prepareForSearchWithQuery).toHaveBeenCalled();
  });
});
```

### Integration Testing

- Test query capture from actual searches
- Validate storage/retrieval mechanisms
- Test component integration scenarios

## Common Patterns

### Query Normalization

- Always trim whitespace
- Convert to lowercase for deduplication
- Remove empty/invalid queries

### Result Management

- Limit based on maxLength configuration
- Most recent items first (LIFO pattern)
- Automatic cleanup of stale results

### Event Handling

- Clear operations dispatch analytics events
- Query execution integrates with search flow
- Component communication via custom events

## Best Practices

### Performance

- Set reasonable maxLength limits (10-20 items)
- Debounce frequent updates
- Use efficient data structures

### User Experience

- Show most relevant recent items first
- Provide clear visual indicators
- Enable easy clearing/management

### Data Management

- Implement proper cleanup strategies
- Handle storage quota limits
- Provide fallback for storage failures

### Analytics

- Track usage patterns
- Monitor clear operations
- Analyze query repetition rates

## Error Handling

### Storage Failures

```typescript
try {
  persistQueries(recentQueries);
} catch (error) {
  // Fallback to in-memory storage
  console.warn('Failed to persist recent queries', error);
}
```

### Invalid Data Recovery

```typescript
// Validate and clean stored data
const cleanQueries = storedQueries
  .filter((query) => typeof query === 'string' && query.trim())
  .slice(0, maxLength);
```

## Migration Considerations

### Schema Evolution

- Handle legacy storage formats
- Provide migration utilities
- Maintain backward compatibility

### Feature Enhancement

- Graceful degradation for missing features
- Progressive enhancement patterns
- Configurable feature flags
