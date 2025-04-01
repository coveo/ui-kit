import {ResultMultiValueTextSelectors} from './result-multi-value-text-selectors';

export function assertShouldRenderValues(values: string[]) {
  ResultMultiValueTextSelectors.value().then((elements) => {
    const slotElements = elements.get() as HTMLSlotElement[];
    const actualText = slotElements.map(
      (element) => element.assignedNodes({flatten: true})[0].textContent
    );
    expect(actualText).to.deep.equal(values);
  });
}

export function assertDoesNotDisplayXMoreLabel() {
  it('should not display a "x more" label', () => {
    ResultMultiValueTextSelectors.moreLabel().should('not.exist');
  });
}

export function assertDisplaysXMoreLabel(count: number) {
  ResultMultiValueTextSelectors.moreLabel().should(
    'have.text',
    `${count} more`
  );
}
