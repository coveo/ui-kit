import type { Plugin } from 'rollup';

export interface PluginOptions {
  include?: string | string[];
  exclude?: string | string[];
  replacements?: Record<string, string>;
}

/**
 * A Rollup plugin for replacing import/export paths using AST.
 */
export default function replaceWithASTPlugin(options?: PluginOptions): Plugin;
