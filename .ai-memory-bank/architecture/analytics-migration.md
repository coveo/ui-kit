# Analytics Migration (KIT-2859)

## Overview

There's an ongoing migration from legacy analytics implementation to a new analytics system. This affects multiple controllers and components across the codebase.

## Migration Status

### Identified TODO Items

Multiple files contain `//TODO: KIT-2859` comments indicating pending migration work:

- `features/did-you-mean/did-you-mean-analytics-actions.ts`
- `features/query/query-analytics-actions.ts`
- `features/analytics/analytics-actions.ts`
- `features/history/history-analytics-actions.ts`
- `api/analytics/search-analytics.ts`

### Pattern Recognition

#### Legacy Analytics Pattern

```typescript
//TODO: KIT-2859
export const logNavigateForward = (): LegacySearchAction =>
  makeAnalyticsAction(
    'history/analytics/forward',
    (client) =>
      client.makeSearchEvent('historyForward' as LegacySearchPageEvents) // TODO: Need to create this event natively in coveo.analytics to remove cast
  );
```

#### New Analytics Pattern

```typescript
export const logNavigateForward = (): SearchAction =>
  makeAnalyticsAction(
    'history/analytics/forward',
    (client) => client.makeHistoryForwardEvent() // Native implementation
  );
```

## Migration Considerations

### Breaking Changes

- **Type Changes**: `LegacySearchAction` → `SearchAction`
- **Event Methods**: Custom event creation → Native coveo.analytics methods
- **Import Paths**: Updated import statements
- **Method Signatures**: Some analytics methods may have different signatures

### Compatibility Strategy

- Maintain backward compatibility during transition
- Feature flags for enabling new analytics
- Gradual migration per component/feature
- Comprehensive testing of analytics events

### Testing Requirements

- **Event Tracking**: Verify all analytics events fire correctly
- **Payload Validation**: Ensure event payloads match expected format
- **Integration Testing**: Test with actual analytics services
- **Backward Compatibility**: Legacy integrations continue working

## Development Guidelines

### When Working on Analytics Code

1. **Check for TODO markers**: Look for `KIT-2859` comments
2. **Use new patterns**: Prefer new analytics implementation for new features
3. **Test thoroughly**: Analytics changes affect reporting and insights
4. **Document changes**: Update analytics documentation

### Code Review Focus

- Verify analytics events are properly triggered
- Check for type safety improvements
- Ensure no analytics events are lost in migration
- Validate event payload structures

### Common Patterns to Update

#### Event Creation

```typescript
// OLD (Legacy)
client.makeSearchEvent('eventName' as LegacySearchPageEvents);

// NEW (Native)
client.makeEventName(); // Proper typed method
```

#### Action Types

```typescript
// OLD
export const action = (): LegacySearchAction => ...

// NEW
export const action = (): SearchAction => ...
```

## Impact Areas

### Controllers Affected

- Search controllers
- Facet controllers
- Query suggestion controllers
- Navigation controllers
- Result controllers

### Components Affected

- All Atomic components that send analytics
- Quantic components with analytics integration
- Framework binding components

### Integration Points

- Headless engine initialization
- Analytics middleware configuration
- Custom analytics implementations

## Migration Checklist

### Per Component/Feature

- [ ] Identify all analytics actions
- [ ] Update action return types
- [ ] Replace legacy event creation
- [ ] Update tests for new types
- [ ] Verify event payloads
- [ ] Test integration scenarios

### System-Wide

- [ ] Update analytics configuration
- [ ] Migrate analytics middleware
- [ ] Update documentation
- [ ] Create migration guide
- [ ] Plan rollout strategy

## Timeline Considerations

### Phase 1: Foundation

- Complete core analytics types migration
- Update base analytics utilities
- Establish new patterns

### Phase 2: Controller Migration

- Migrate search controllers
- Update facet analytics
- Migrate suggestion analytics

### Phase 3: Component Migration

- Update Atomic components
- Migrate Quantic components
- Update framework bindings

### Phase 4: Cleanup

- Remove legacy code
- Update documentation
- Finalize migration

## Monitoring and Validation

### Analytics Validation

- Set up analytics event monitoring
- Compare before/after event volumes
- Validate event payload accuracy
- Monitor customer analytics dashboards

### Performance Monitoring

- Track analytics bundle size changes
- Monitor event processing performance
- Validate memory usage patterns

## Documentation Updates Needed

- Analytics integration guides
- Event reference documentation
- Migration guide for customers
- Breaking changes documentation
- Custom analytics implementation examples

## Risk Mitigation

### Rollback Strategy

- Maintain legacy analytics as fallback
- Feature flags for easy rollback
- Comprehensive testing in staging
- Gradual production rollout

### Customer Communication

- Advance notice of analytics changes
- Migration timeline communication
- Support for custom implementations
- Updated integration examples
