import type {SearchEngine} from '@coveo/headless';
import {LogLevel} from '@coveo/headless';
import type {RecommendationEngine} from '@coveo/headless/recommendation';
import type {InsightEngine} from '@coveo/headless/insight';
import {i18n} from 'i18next';

export type AnyEngineType = SearchEngine | RecommendationEngine | InsightEngine;

export interface BaseAtomicInterface<EngineType extends AnyEngineType> {
  analytics: boolean;
  i18n: i18n;
  engine?: EngineType;
  languageAssetsPath: string;
  iconAssetsPath: string;
  logLevel?: LogLevel;
  language: string;

  updateIconAssetsPath(): void;
}
