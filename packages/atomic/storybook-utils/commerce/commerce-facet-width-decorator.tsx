import { Decorator } from "@storybook/web-components-vite";
import { html } from "lit";

export const commerceFacetWidthDecorator: Decorator = (story) =>
  html`<div style="min-width: 470px;">${story()}</div> `;
