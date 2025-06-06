# Atomic Package Guide

## Overview

Atomic is a web component library built with Stencil that provides pre-built UI components for Coveo search experiences. Components are self-encapsulated, composable, and framework-agnostic.

> 📚 **For detailed component development guidelines, see the [Atomic Chemistry Guide](./atomic-chemistry.md)** - our comprehensive guide to building consistent, reusable components following atomic design principles.

## Architecture

### Stencil Framework

- **Web Components**: Standards-based custom elements
- **TypeScript**: Strong typing for component development
- **JSX**: Template syntax similar to React
- **CSS-in-JS**: Scoped styling with CSS variables
- **Build Output**: Framework-agnostic web components

### Component Structure

```
src/components/
├── search/
│   ├── atomic-search-interface/
│   ├── atomic-search-box/
│   └── atomic-result-list/
├── facets/
├── recommendations/
└── common/
```

## Development Patterns

### Component Creation

```bash
# Generate new component
npm run generate:component

# Follow the interactive prompts
# - Component name (kebab-case)
# - Component category
# - Base functionality
```

### Component Lifecycle

```typescript
@Component({
  tag: 'atomic-custom-component',
  styleUrl: 'atomic-custom-component.pcss',
  shadow: true
})
export class AtomicCustomComponent {
  @State() private state!: SomeState;

  connectedCallback() {
    // Initialize component
  }

  disconnectedCallback() {
    // Cleanup
  }

  render() {
    return <div>Component content</div>;
  }
}
```

### Headless Integration

Components use decorators to bind with Headless controllers:

```typescript
@InitializeBindings()
@BindStateToController('searchBox')
export class AtomicSearchBox {
  @BindStateToController('searchBox')
  private searchBox!: SearchBox;
}
```

## Build System

### Multiple Build Targets

- **Stencil**: Web components with shadow DOM
- **Lit**: Framework-agnostic alternative to Stencil
- **Loaders**: Framework-specific integration helpers

### Development Mode

```bash
# Standard development
npm run dev

# With Stencil changes (required when modifying .tsx files)
npm run dev --stencil
```

### Build Configurations

- `tsconfig.stencil.json` - Stencil compilation
- `tsconfig.lit.json` - Lit component generation
- `rollup.config.js` - Bundle configuration
- `stencil.config.ts` - Stencil-specific settings

## Styling System

### CSS Architecture

- **CSS Variables**: For theming and customization
- **PostCSS**: Processing and optimization
- **Scoped Styles**: Component-level encapsulation
- **Design Tokens**: Consistent spacing, colors, typography

### Theme System

```css
/* Component styles use CSS variables */
:host {
  --color-primary: var(--atomic-primary-color, #1372ec);
  --spacing-small: var(--atomic-spacing-small, 0.5rem);
}
```

### Sample Themes

- Located in `src/themes/`
- Demonstrate different styling approaches
- Can be imported and customized

## Testing Strategy

### Unit Tests (Jest)

- Component rendering tests
- State management validation
- User interaction simulation
- Headless controller mocking

### E2E Tests (Cypress)

- Full user workflow testing
- Cross-browser compatibility
- Visual regression testing
- Integration with Coveo APIs

### Visual Testing

```bash
# Run visual regression tests
npm run e2e:snapshots

# Update visual baselines
npm run e2e:snapshots:watch
```

## Framework Integration

### React

```typescript
// Via atomic-react package
import { AtomicSearchBox } from '@coveo/atomic-react';

function App() {
  return <AtomicSearchBox />;
}
```

### Angular

```typescript
// Via atomic-angular package
import {AtomicModule} from '@coveo/atomic-angular';

@NgModule({
  imports: [AtomicModule],
})
export class AppModule {}
```

### Vanilla HTML

```html
<!-- Direct web component usage -->
<script type="module" src="@coveo/atomic/loader"></script>
<atomic-search-interface>
  <atomic-search-box></atomic-search-box>
  <atomic-result-list></atomic-result-list>
</atomic-search-interface>
```

## Asset Management

### SVG Icons

- Centralized icon system
- Automatic SVG optimization
- Runtime icon loading
- Custom icon support

### Internationalization

- JSON-based translation files
- Runtime locale switching
- Fallback to English
- Extensible translation system

## Performance Optimization

### Lazy Loading

- Components loaded on demand
- Route-based code splitting
- Dynamic imports for optional features

### Bundle Analysis

- Use Stencil's built-in bundle analyzer
- Monitor component sizes
- Optimize shared dependencies

## Common Patterns

### Result Context

```typescript
@Component({
  tag: 'atomic-result-component'
})
export class AtomicResultComponent {
  @ResultContext() private result!: Result;

  render() {
    return <div>{this.result.title}</div>;
  }
}
```

### Error Boundaries

```typescript
@Component({
  tag: 'atomic-error-boundary',
})
export class AtomicErrorBoundary {
  @State() hasError = false;

  componentDidRender() {
    if (this.hasError) {
      // Handle error state
    }
  }
}
```

## Development Workflow

### Component Development

1. **Generate Component**: Use built-in generator
2. **Implement Logic**: Connect to Headless controllers
3. **Style Component**: Use CSS variables and design tokens
4. **Add Tests**: Unit and E2E coverage
5. **Document Usage**: JSDoc and Storybook stories

### Storybook Integration

- Interactive component documentation
- Live component playground
- Visual testing environment
- Design system showcase

## Troubleshooting

### Stencil Issues

- **Build Failures**: Check TypeScript configuration
- **Styling Problems**: Verify PostCSS processing
- **Component Registration**: Ensure proper lazy loading

### Development Mode

- **Changes Not Reflecting**: Use `--stencil` flag
- **Hot Reload Issues**: Restart dev server
- **Memory Issues**: Increase Node.js heap size

### Custom Elements

- **Registration Conflicts**: Check for duplicate registrations
- **Shadow DOM Issues**: Verify style encapsulation
- **Browser Support**: Check web component polyfills

## Best Practices

### Component Design

- Single responsibility principle
- Clear prop interfaces
- Consistent event naming
- Accessible by default

### Performance

- Minimize component re-renders
- Use efficient state management
- Optimize large lists
- Lazy load heavy components

### Accessibility

- Semantic HTML structure
- ARIA attributes where needed
- Keyboard navigation support
- Screen reader compatibility

### Internationalization

- Use translation keys for all text
- Support RTL languages
- Format dates/numbers correctly
- Handle pluralization rules
