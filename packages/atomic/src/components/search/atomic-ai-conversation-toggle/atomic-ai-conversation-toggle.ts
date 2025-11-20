import {Schema, StringValue} from '@coveo/bueno';

import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {renderButton} from '@/src/components/common/button';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import '@/src/components/common/atomic-icon/atomic-icon';
import '@/src/components/common/atomic-modal/atomic-modal';
// import { ATOMIC_MODAL_EXPORT_PARTS } from "../../common/atomic-modal/export-parts.js";
import {booleanConverter} from '@/src/converters/boolean-converter';
import {renderAIConversationModal} from '../../common/ai-conversation-modal/modal';
import '../atomic-ai-conversation/atomic-ai-conversation';

/**
 * The `atomic-ai-conversation-toggle` component displays a simple greeting message and
 * allows the user to show or hide the current query.
 *
 * @part container - The container for the entire component.
 * @part message - The greeting message itself.
 * @part query-container - The container for the button and query.
 * @part toggle-reveal-query-button - The button to show or hide the query.
 * @part query - The query.
 *
 * @slot - Content to display between the message and the the query container.
 * @slot before - Content to display before the message.
 * @slot after - Content to display after the query container.
 *
 * @remarks
 * This is a template meant to be used as a starting point for creating or
 * migrating components. It demonstrates common patterns and good practices.
 */
@customElement('atomic-ai-conversation-toggle')
@bindings()
@withTailwindStyles
export class AtomicAiConversationToggle
  extends LitElement
  implements InitializableComponent<Bindings>
{
  /**
   * The element that opens the modal when clicked.
   */
  @property({attribute: 'open-button', type: Object})
  openButton?: HTMLElement;

  /**
   * The tooltip text for the AI Conversation Toggle button.
   */
  @property({type: String, attribute: 'tooltip'})
  tooltip: string = 'AI Mode';

  /**
   * The label text for the AI Conversation Toggle button.
   */
  @property({type: String, attribute: 'label'}) label: string = 'AI Mode';
  /**
   * Whether the modal is open.
   */
  @property({
    type: Boolean,
    converter: booleanConverter,
    reflect: true,
    attribute: 'is-open',
  })
  isOpen = false;

  @state() public bindings!: Bindings;
  @state() public error!: Error;

  static styles: CSSResultGroup = css`
    :host {
      overflow: hidden;
    }
  `;

  // ==========================================================================
  // Standard custom element lifecycle methods
  // ==========================================================================
  /*
  Override standard custom element lifecycle methods in this section.

  Use the following order:
    1. `constructor`
    2. `connectedCallback`
    3. `disconnectedCallback`
    4. `adoptedCallback`
    5. `attributeChangedCallback`

  Remove this multiline comment when no longer needed.
  */

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({tooltip: this.tooltip, label: this.label}),
      new Schema({
        tooltip: new StringValue({
          emptyAllowed: false,
        }),
        label: new StringValue({
          emptyAllowed: false,
        }),
      })
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  // ==========================================================================
  // Public methods
  // ==========================================================================
  /*
  Declare public non-lifecycle methods in this section.

  For initializable components, declare the `initialize` method first.
  
  Declare other public methods in alphabetical order.

  Remove this multiline comment when no longer needed.
  */

  public initialize() {}

  // ==========================================================================
  // Lit reactive update lifecycle methods
  // ==========================================================================
  /*
  Override Lit reactive update lifecycle method in this section.

  Use the following order:
    1. `shouldUpdate`
    2. `willUpdate`
    3. `update`
    4. `render`
    5. `firstUpdated`
    6. `updated`

  Remove this multiline comment when no longer needed.
  */

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${renderAIConversationModal({
      props: {
        i18n: this.bindings.i18n,
        host: this,
        isOpen: this.isOpen,
        onClose: () => {
          this.isOpen = false;
        },
        title: '✨ AI MODE!',
        openButton: this.openButton,
      },
    })(html`<div slot="body">
      <atomic-ai-conversation answer-configuration-id="04a30433-667b-4988-ba59-e9a585e41c0e"></atomic-ai-conversation>
    </div>`)}
    ${renderButton({
      props: {
        style: 'primary',
        class: 'relative p-3',
        part: `atomic-ai-conversation-toggle-button`,
        title: this.tooltip,
        onClick: () => {
          this.isOpen = !this.isOpen;
        },
      },
    })(html`
      <atomic-icon
        .icon=${'assets://sparkles.svg'}
        .className=${'h-4 w-4 shrink-0'}
        .part=${'atomic-ai-conversation-toggle-icon'}
      ></atomic-icon>
      ${this.label}
    `)}`;
  }
  // ==========================================================================
  // Private methods
  // ==========================================================================
  /*
  Declare private methods in this section in any order.

  Remove this multiline comment when no longer needed.
  */
  // private handleCloseAIConversation() {
  //   this.isOpen = false;
  // }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-ai-conversation-toggle': AtomicAiConversationToggle;
  }
}
