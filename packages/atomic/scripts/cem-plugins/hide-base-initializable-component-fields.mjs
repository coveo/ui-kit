/**
 * CEM plugin to mark BaseInitializableComponent fields as private
 * for custom elements that extend LitElement and implement BaseInitializableComponent.
 */
export function hideBaseInitializableComponentFieldsPlugin() {
  return {
    name: 'hide-base-initializable-component-fields',
    // Run in moduleLinkPhase to process after all analysis is complete
    moduleLinkPhase({moduleDoc}) {
      // List of BaseInitializableComponent field names that should be marked as private
      const baseInitializableComponentFields = [
        'bindings',
        'initialized',
        'unsubscribeLanguage',
        'error',
      ];

      for (const declaration of moduleDoc.declarations) {
        if (declaration.kind !== 'class') {
          continue;
        }

        // Check if this class extends LitElement
        const extendsLitElement = declaration.superclass?.name === 'LitElement';

        // Check if this class implements BaseInitializableComponent
        // The CEM analyzer might not capture TypeScript implements directly,
        // so we'll check for the presence of the BaseInitializableComponent fields instead
        const implementsBaseInitializable = declaration.implements?.some(
          (impl) =>
            impl.name === 'BaseInitializableComponent' ||
            impl.name === 'InitializableComponent' ||
            impl.name === 'SearchBoxSuggestionsComponent'
        );

        // Alternative: check if the class has the BaseInitializableComponent fields
        const hasBaseInitializableFields = declaration.members?.some((member) =>
          baseInitializableComponentFields.includes(member.name)
        );

        // Use either explicit implements or presence of the fields
        const shouldProcess =
          extendsLitElement && (implementsBaseInitializable || hasBaseInitializableFields);

        // If both conditions are met, mark the BaseInitializableComponent fields as private
        if (shouldProcess && declaration.members) {
          for (const member of declaration.members) {
            if (baseInitializableComponentFields.includes(member.name)) {
              member.privacy = 'private';
            }
          }

          // Also handle attributes that might correspond to these fields
          if (declaration.attributes) {
            const attributesToRemove = [];
            for (let i = 0; i < declaration.attributes.length; i++) {
              const attribute = declaration.attributes[i];
              if (baseInitializableComponentFields.includes(attribute.fieldName)) {
                attributesToRemove.push(i);
              }
            }
            // Remove attributes in reverse order to maintain indices
            for (let i = attributesToRemove.length - 1; i >= 0; i--) {
              declaration.attributes.splice(attributesToRemove[i], 1);
            }
            // Clean up empty attributes array
            if (declaration.attributes.length === 0) {
              declaration.attributes = undefined;
            }
          }
        }
      }
    },
  };
}
