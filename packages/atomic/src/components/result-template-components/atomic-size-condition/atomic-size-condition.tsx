import {Element, Component, Prop, State} from '@stencil/core';

type Criterion = (width: number, height: number) => boolean;

/**
 * Displays children only if their parent meets the defined size constraints.
 */
@Component({
  tag: 'atomic-size-condition',
  styleUrl: 'atomic-size-condition.pcss',
  shadow: false,
})
export class AtomicSizeCondition {
  private resizeObserver!: ResizeObserver;

  @Element() private host!: HTMLElement;

  @State() private shouldRender!: boolean;

  /**
   * The minimum width (exclusively) required to display children.
   *
   * E.g.: `3rem`, `500px` or `30vw`.
   */
  @Prop() public minimumWidthExclusive?: string;
  /**
   * The minimum width (inclusively) required to display children.
   *
   * E.g.: `3rem`, `500px` or `30vw`.
   */
  @Prop() public minimumWidthInclusive?: string;
  /**
   * The maximum width (exclusively) required to display children.
   *
   * E.g.: `3rem`, `500px` or `30vw`.
   */
  @Prop() public maximumWidthExclusive?: string;
  /**
   * The maximum width (inclusively) required to display children.
   *
   * E.g.: `3rem`, `500px` or `30vw`.
   */
  @Prop() public maximumWidthInclusive?: string;
  /**
   * The minimum height (exclusively) required to display children.
   *
   * E.g.: `3rem`, `500px` or `30vw`.
   */
  @Prop() public minimumHeightExclusive?: string;
  /**
   * The minimum height (inclusively) required to display children.
   *
   * E.g.: `3rem`, `500px` or `30vw`.
   */
  @Prop() public minimumHeightInclusive?: string;
  /**
   * The maximum height (exclusively) required to display children.
   *
   * E.g.: `3rem`, `500px` or `30vw`.
   */
  @Prop() public maximumHeightExclusive?: string;
  /**
   * The maximum height (inclusively) required to display children.
   *
   * E.g.: `3rem`, `500px` or `30vw`.
   */
  @Prop() public maximumHeightInclusive?: string;

  constructor() {
    this.shouldRender = this.elementMeetsCriteria;
  }

  public componentDidLoad() {
    this.resizeObserver = new ResizeObserver(
      () => (this.shouldRender = this.elementMeetsCriteria)
    );
    this.resizeObserver.observe(this.parent);
  }

  public componentDidUnLoad() {
    this.resizeObserver.disconnect();
  }

  public componentDidRender() {
    this.host.style.display = this.shouldRender ? '' : 'none';
  }

  private convertToPixels(size: string) {
    const temporaryElement = document.createElement('div');
    temporaryElement.style.position = 'absolute';
    temporaryElement.style.width = size;
    this.parent.appendChild(temporaryElement);
    const {offsetWidth} = temporaryElement;
    temporaryElement.remove();
    return offsetWidth;
  }

  private get parent() {
    return this.host.parentElement!;
  }

  private get criteria() {
    const criteria: Criterion[] = [];
    this.minimumWidthExclusive &&
      criteria.push(
        (width) => width > this.convertToPixels(this.minimumWidthExclusive!)
      );
    this.minimumWidthInclusive &&
      criteria.push(
        (width) => width >= this.convertToPixels(this.minimumWidthInclusive!)
      );
    this.maximumWidthExclusive &&
      criteria.push(
        (width) => width < this.convertToPixels(this.maximumWidthExclusive!)
      );
    this.maximumWidthInclusive &&
      criteria.push(
        (width) => width <= this.convertToPixels(this.maximumWidthInclusive!)
      );
    this.minimumHeightExclusive &&
      criteria.push(
        (_, height) =>
          height > this.convertToPixels(this.minimumHeightExclusive!)
      );
    this.minimumHeightInclusive &&
      criteria.push(
        (_, height) =>
          height >= this.convertToPixels(this.minimumHeightInclusive!)
      );
    this.maximumHeightExclusive &&
      criteria.push(
        (_, height) =>
          height < this.convertToPixels(this.maximumHeightExclusive!)
      );
    this.maximumHeightInclusive &&
      criteria.push(
        (_, height) =>
          height <= this.convertToPixels(this.maximumHeightInclusive!)
      );
    return criteria;
  }

  private get elementMeetsCriteria() {
    const {offsetWidth, offsetHeight} = this.parent;
    const indexOfInvalidatedCriterion = this.criteria.findIndex(
      (criterion) => !criterion(offsetWidth, offsetHeight)
    );
    return indexOfInvalidatedCriterion === -1;
  }
}
