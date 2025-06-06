# Quantic Package Guide

## Overview

Quantic is a Lightning Web Component (LWC) library specifically designed for Salesforce environments. It provides Coveo search capabilities native to the Salesforce platform.

## Architecture

### Salesforce LWC Framework

- **Lightning Web Components**: Salesforce's modern component framework
- **Salesforce Platform Integration**: Native platform capabilities
- **Apex Integration**: Server-side logic integration
- **Lightning Design System**: Consistent Salesforce styling

### Component Structure

```
force-app/
├── main/default/lwc/           # Production components
├── examples/main/lwc/          # Example components for demos
└── solutionExamples/           # Complete solution examples
```

## Development Environment

### Prerequisites

- Salesforce DX CLI (sf)
- Valid Salesforce org (scratch org or developer org)
- Node.js and npm
- Git

### Scratch Org Setup

```bash
# Create scratch org with LWS enabled
npm run scratch:create

# Deploy main components
npm run deploy:main

# Deploy examples
npm run deploy:examples
```

### Two Testing Environments

1. **LWS Enabled**: Lightning Web Security enabled (modern)
2. **LWS Disabled**: Legacy Lightning Locker Service

```bash
# Create both environments
npm run setup:examples

# Create specific environment
npm run create:lws-enabled
npm run create:lws-disabled
```

## Build System

### Static Resource Management

Quantic bundles external dependencies as static resources:

- **coveoheadless**: Headless library compiled for Salesforce
- **coveobueno**: Schema validation library
- **dompurify**: HTML sanitization
- **marked**: Markdown processing

### Build Process

```bash
# Build all static resources
npm run build

# Individual build steps
npm run babel:headless          # Transform Headless for Salesforce
npm run build:staticresources   # Bundle static resources
npm run build:doc              # Generate JSDoc documentation
```

### Documentation Generation

- JSDoc-based documentation
- Automatic API reference generation
- Integration with Salesforce documentation

## Testing Strategy

### Jest Unit Tests

**Focus**: Isolated component behavior without browser/Salesforce environment

Key testing patterns:

```javascript
// Mock Headless controller
const mockController = {
  state: {
    /* mocked state */
  },
  methods: {
    /* mocked methods */
  },
};

// Test component rendering
expect(element.shadowRoot.querySelector('.expected-class')).toBeTruthy();

// Test property updates
element.someProperty = 'new value';
expect(element.shadowRoot.textContent).toContain('new value');
```

### Playwright E2E Tests

**Focus**: Real user workflows in actual Salesforce environment

Test scenarios:

- Complete search workflows across all use cases
- Coveo API interactions and analytics
- Salesforce platform integration
- Cross-component communication
- URL parameter handling
- Responsive design behavior

```bash
# Run E2E tests
npm run e2e:playwright

# Environment-specific tests
npm run e2e:playwright:lws-enabled
npm run e2e:playwright:lws-disabled
```

### Cypress Tests (Legacy)

```bash
# Standard Cypress tests
npm run e2e

# Detailed reporting
npm run e2e:detailed
```

## Salesforce Integration

### Package Distribution

```bash
# Create SFDX package
npm run publish:sfdx

# Promote to managed package
npm run promote:sfdx

# CI promotion
npm run promote:sfdx:ci
```

### Deployment Commands

```bash
# Deploy to specific org
npm run deploy:main -- my-org-alias
npm run deploy:examples -- my-org-alias

# Deploy with source tracking
sf project deploy start --source-dir force-app/main --target-org my-org
```

## Component Development

### LWC Patterns

```javascript
import {buildSearchEngine} from 'c/quanticHeadlessLoader';
import {LightningElement, api, track} from 'lwc';

export class QuanticSearchBox extends LightningElement {
  @api engineId;
  @track state = {};

  connectedCallback() {
    this.engine = buildSearchEngine(this.engineId);
    this.searchBox = buildSearchBox(this.engine);
    this.unsubscribe = this.searchBox.subscribe(() => {
      this.state = this.searchBox.state;
    });
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }
}
```

### Headless Integration

- Custom loader for Headless library
- Salesforce-specific adaptations
- State management patterns
- Event handling

### Styling with SLDS

```css
/* Use Salesforce Lightning Design System */
.slds-box {
  padding: var(--lwc-spacingMedium);
  border: 1px solid var(--lwc-colorBorder);
}
```

## Configuration Management

### Environment-Specific Settings

```javascript
// config/lws-enabled-scratch-def.json
{
  "orgName": "Quantic LWS Enabled",
  "edition": "Developer",
  "settings": {
    "lightningExperienceSettings": {
      "enableS1DesktopEnabled": true
    },
    "securitySettings": {
      "enableLightningWebSecurity": true
    }
  }
}
```

### Translation Management

- Salesforce Custom Labels for translations
- Multi-language support
- RTL language support
- Dynamic label loading

## Common Patterns

### Result Templates

```html
<template for:each="{results}" for:item="result">
  <c-quantic-result
    key="{result.uniqueId}"
    result="{result}"
    engine-id="{engineId}"
  >
  </c-quantic-result>
</template>
```

### Error Handling

```javascript
@track error;

handleError(error) {
  this.error = {
    message: error.message,
    type: error.type
  };
  // Log to Salesforce debug logs
  console.error('Quantic Error:', error);
}
```

### Analytics Integration

- Coveo analytics events
- Salesforce analytics tracking
- Custom event reporting
- Privacy compliance

## Development Workflow

### Local Development

```bash
# Start development environment
npm run dev

# Watch for changes
npm run test:watch

# Lint and fix
npm run lint:fix
```

### Testing Workflow

1. **Unit Tests**: Test component logic in isolation
2. **Integration Tests**: Test with mock Salesforce environment
3. **E2E Tests**: Test in real Salesforce scratch orgs
4. **Manual Testing**: Test in different Salesforce editions

## Troubleshooting

### Common LWC Issues

- **Module Resolution**: Check import paths and c/ namespace
- **Lightning Web Security**: Verify API compatibility
- **Static Resource Loading**: Check resource bundle names
- **Event Handling**: Verify event propagation in LWC

### Salesforce-Specific Issues

- **Org Limits**: Monitor API usage and limits
- **Permission Issues**: Verify user permissions
- **Custom Settings**: Check org configuration
- **Browser Compatibility**: Test across supported browsers

### Build Issues

- **Babel Transformation**: Check Headless compatibility
- **Static Resource Size**: Monitor bundle sizes (< 5MB limit)
- **Documentation Generation**: Verify JSDoc configuration

## Best Practices

### Performance

- Minimize component re-renders
- Efficient state management
- Lazy loading for large datasets
- Optimize static resource sizes

### Salesforce Compliance

- Follow Lightning Web Component best practices
- Use Salesforce Lightning Design System
- Respect platform security restrictions
- Handle org limits gracefully

### Accessibility

- WCAG 2.1 compliance
- Salesforce accessibility standards
- Screen reader support
- Keyboard navigation

### Security

- Input sanitization with DOMPurify
- Secure API communication
- CSP compliance
- Data privacy considerations

## Package Management

### Versioning Strategy

- Semantic versioning aligned with UI Kit
- Salesforce package versions
- Backward compatibility considerations

### Release Process

1. **Build and Test**: Complete test suite
2. **Package Creation**: SFDX package creation
3. **Testing**: Install in fresh orgs
4. **Promotion**: Promote to managed package
5. **Documentation**: Update release notes
