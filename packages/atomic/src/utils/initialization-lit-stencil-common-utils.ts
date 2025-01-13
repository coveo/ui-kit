export class MissingInterfaceParentError extends Error {
  constructor(elementName: string) {
    super(
      `The "${elementName}" element must be the child of the following elements: ${initializableElements.join(
        ', '
      )}`
    );
  }
}

export const initializableElements = [
  'atomic-recs-interface',
  'atomic-search-interface',
  'atomic-commerce-interface',
  'atomic-commerce-recommendation-interface',
  'atomic-relevance-inspector',
  'atomic-insight-interface',
  'atomic-external',
];

export const initializeEventName = 'atomic/initializeComponent';
