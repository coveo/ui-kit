import {getAttributesFromLinkSlotContent} from './attributes-slot';

describe('getAttributesFromLinkSlot', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('retrieves attributes from child slot correctly without warnings', () => {
    const link = document.createElement('a');
    const slotName = 'my-slot';
    link.setAttribute('slot', slotName);
    link.setAttribute('download', '');
    link.setAttribute('target', '_self');

    const host = document.createElement('div');
    host.appendChild(link);
    const attributes = getAttributesFromLinkSlotContent(host, slotName);
    expect(attributes![0]).toMatchObject({
      _name: 'download',
      _value: '',
    });
    expect(attributes![1]).toMatchObject({
      _name: 'target',
      _value: '_self',
    });
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('returns undefined when there is no slot of that name', () => {
    const link = document.createElement('span');
    link.setAttribute('slot', 'my-slot');

    const host = document.createElement('div');
    host.appendChild(link);
    const attributes = getAttributesFromLinkSlotContent(host, 'not-my-slot');
    expect(attributes).toBeUndefined();
  });

  it('logs a warning & returns undefined when slot is not an "a" tag', () => {
    const link = document.createElement('span');
    const slotName = 'my-slot';
    link.setAttribute('slot', slotName);

    const host = document.createElement('div');
    host.appendChild(link);
    const attributes = getAttributesFromLinkSlotContent(host, slotName);
    expect(attributes).toBeUndefined();
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it('logs a warning when the "href" is defined & filters it out', () => {
    const link = document.createElement('a');
    const slotName = 'my-slot';
    link.setAttribute('slot', slotName);
    link.setAttribute('href', 'https://www.test.com');

    const host = document.createElement('div');
    host.appendChild(link);
    const attributes = getAttributesFromLinkSlotContent(host, slotName);
    expect(attributes).toEqual([]);
    expect(console.warn).toHaveBeenCalledTimes(1);
  });
});
