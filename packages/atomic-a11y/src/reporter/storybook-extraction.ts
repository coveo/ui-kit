import {UNKNOWN_CATEGORY, UNKNOWN_FRAMEWORK} from '../shared/constants.js';
import type {SupportedFramework} from '../shared/types.js';

export function normalizePath(filePath: string): string {
  return filePath.replaceAll('\\', '/');
}

export function extractComponentName(
  modulePath: string,
  storyId: string
): string | null {
  const componentPathMatch = modulePath.match(/\/((atomic-[a-z0-9-]+))\//i);
  if (componentPathMatch?.[1]) {
    return componentPathMatch[1].toLowerCase();
  }

  const storyPathMatch = modulePath.match(
    /(atomic-[a-z0-9-]+)\.new\.stories\.[jt]sx?$/i
  );
  if (storyPathMatch?.[1]) {
    return storyPathMatch[1].toLowerCase();
  }

  const storyIdMatch = storyId.match(/(atomic-[a-z0-9-]+)/i);
  if (storyIdMatch?.[1]) {
    return storyIdMatch[1].toLowerCase();
  }

  const pageStoryMatch = modulePath.match(
    /storybook-pages\/[^/]+\/([a-z0-9-]+)\.new\.stories\.[jt]sx?$/i
  );
  if (pageStoryMatch?.[1]) {
    return `${pageStoryMatch[1].toLowerCase()}-page`;
  }

  return null;
}

export function extractCategory(modulePath: string, storyId: string): string {
  const categoryFromPath = modulePath.match(
    /components\/(commerce|search|insight|ipx|common|recommendations)\//i
  );

  if (categoryFromPath?.[1]) {
    return categoryFromPath[1].toLowerCase();
  }

  const categoryFromStoryId = storyId.match(
    /^(commerce|search|insight|ipx|common|recommendations)-/i
  );

  if (categoryFromStoryId?.[1]) {
    return categoryFromStoryId[1].toLowerCase();
  }

  const categoryFromPagePath = modulePath.match(
    /storybook-pages\/([a-z0-9-]+)\//i
  );

  if (categoryFromPagePath?.[1]) {
    return categoryFromPagePath[1].toLowerCase();
  }

  return UNKNOWN_CATEGORY;
}

export function extractFramework(modulePath: string): SupportedFramework {
  if (modulePath.endsWith('.new.stories.tsx')) {
    return 'lit';
  }

  if (modulePath.endsWith('.stories.tsx')) {
    return 'stencil';
  }

  return UNKNOWN_FRAMEWORK;
}
