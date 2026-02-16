// Extend TypeScript types for safety
import { within as withinShadow } from "shadow-dom-testing-library";
type ShadowQueries = ReturnType<typeof withinShadow>;
declare module "storybook/internal/csf" {
  // Since 8.6
  interface Canvas extends ShadowQueries {}
}