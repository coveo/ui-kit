# Internationalization (i18n) Workflow

## Overview

The UI Kit has sophisticated internationalization support with automated translation tooling powered by GPT and comprehensive locale management.

## Key Components

### Locale Management

- **Main File**: `packages/atomic/src/locales.json`
- **Supported Languages**: 26 languages including RTL support
- **Structure**: Nested JSON with translation keys and language mappings

### Translation Workflow

#### Automated Translation (GPT)

Located in `scripts/translation-gpt/`:

```bash
# Navigate to translation tools
cd scripts/translation-gpt

# Translate missing values
node translate.mjs

# Validate translations
node validate.mjs

# Validate specific entries
node validate.mjs query-suggestion-label between-parentheses
```

#### Process Flow

1. **Identify Missing**: Script finds incomplete translations in `locales.json`
2. **Generate Translations**: GPT generates semantically appropriate translations
3. **Validate Quality**: Automated validation checks for accuracy
4. **Manual Review**: Human review for false positives

## Translation Guidelines

### Adding New Translation Keys

```json
{
  "new-translation-key": {
    "en": "English text",
    "fr": "French text"
    // Add other languages as needed
  }
}
```

### Key Naming Conventions

- Use kebab-case: `search-box-placeholder`
- Be descriptive: `facet-clear-filter-button` vs `clear-button`
- Group by component: `atomic-search-box-*`

### Content Guidelines

- **Semantic Accuracy**: Translations must convey meaning, not just literal words
- **Context Awareness**: Consider UI context (buttons, labels, messages)
- **Character Limits**: Some UI elements have space constraints
- **Cultural Sensitivity**: Avoid region-specific references

## Advanced Features

### Pluralization Support

```json
{
  "result-count": {
    "en": "{{count}} result | {{count}} results",
    "fr": "{{count}} résultat | {{count}} résultats"
  }
}
```

### Variable Interpolation

```json
{
  "search-for": {
    "en": "Search for {{query}}",
    "fr": "Rechercher {{query}}"
  }
}
```

### RTL Language Support

- Arabic (`ar`)
- Hebrew (`he`)
- Automatic layout adjustments in CSS

## Validation Process

### Automated Checks

- **Completeness**: All languages have values
- **Syntax**: Valid JSON structure
- **Variables**: Consistent variable usage across languages
- **Semantic**: GPT validation for meaning accuracy

### Manual Review Areas

- Technical terms
- UI-specific language
- Brand terminology
- Cultural references

## Common Issues

### Translation Quality

**Problem**: GPT may generate technically incorrect translations
**Solution**: Focus on UI/component-specific terms during manual review

### Missing Contexts

**Problem**: Translations lack UI context
**Solution**: Include component/usage context in translation keys

### Variable Mismatches

**Problem**: Inconsistent variable names across languages
**Example**: `{{count}}` in English, `{{nombre}}` in French
**Solution**: Keep variable names identical across all languages

## Development Integration

### Component Usage

```typescript
// In Stencil components
@State() strings = this.i18n.state;

render() {
  return <button>{this.strings['search-button']}</button>;
}
```

### Dynamic Loading

- Language bundles loaded on demand
- Fallback to English for missing translations
- Runtime language switching support

## Best Practices

1. **Add translations early**: Don't leave English placeholders
2. **Test with longer languages**: German and Finnish test text wrapping
3. **Validate visually**: Check UI layout with different text lengths
4. **Use semantic keys**: Make translation keys self-documenting
5. **Group related terms**: Keep component translations together

## Release Considerations

- Complete translation validation before releases
- Test major languages (EN, FR, DE, ES, JA, ZH)
- Verify RTL layout correctness
- Check mobile/responsive behavior with longer text

## Future Enhancements

- Integration with professional translation services
- Context-aware translation suggestions
- Automated screenshot testing for UI layouts
- Translation memory for consistency
