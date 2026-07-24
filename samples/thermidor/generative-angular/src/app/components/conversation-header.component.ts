import {ChangeDetectionStrategy, Component, input} from '@angular/core';

@Component({
  selector: 'app-conversation-header',
  template: `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Barca Sports reference app</p>
        <h1>Structured commerce surfaces for a sports storefront.</h1>
        <p class="lede">
          This demo focuses on storefront-side responsibilities: stable conversation identity,
          streamed assistant text, and renderable A2UI surfaces for shopping flows.
        </p>
      </div>

      <div class="hero-meta">
        <div class="meta-card">
          <span>Status</span>
          <strong>{{ status() }}</strong>
        </div>
        <div class="meta-card">
          <span>Turns</span>
          <strong>{{ historyCount() }}</strong>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationHeaderComponent {
  readonly status = input.required<string>();
  readonly historyCount = input.required<number>();
}
