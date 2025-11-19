import { FunctionalComponent } from "@/src/utils/functional-component-utils";
import { html } from "lit";
import { when } from "lit/directives/when.js";
import { renderGeneratedTextContent } from "./generated-content/generated-text-content";

interface GeneratedContentContainerProps {
  answer?: string;
  answerContentFormat?: string;
  isStreaming: boolean;
}

export const renderAtomicGeneratedContent: FunctionalComponent<
  GeneratedContentContainerProps
> = ({ props }) => {
  const isMarkdown = props.answerContentFormat === "text/markdown";
  return html`
    <div part="generated-container" class="mt-6">
      ${when(
        isMarkdown,
        () => html`
          <generated-markdown-content
            .answer=${props.answer}
            .isStreaming=${props.isStreaming}
          ></generated-markdown-content>
        `,

        () =>
          renderGeneratedTextContent({
            props: {
              answer: props.answer,
              isStreaming: props.isStreaming,
            },
          })
      )}
      <div class="footer mt-6">
        <slot></slot>
      </div>
    </div>
  `;
};
