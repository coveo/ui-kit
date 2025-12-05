export type TNavNode = {
  text?: string;
  path?: string | null;
  children?: TNavNode[] | undefined;
  class?: string;
  icon?: string | number;
  [key: string]: unknown;
};

export type TFrontMatter = {
  group?: string;
  category?: string;
  title?: string;
  slug?: string;
};
