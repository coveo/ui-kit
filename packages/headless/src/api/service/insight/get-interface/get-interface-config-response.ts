export interface GetInsightInterfaceConfigResponse {
  contextFields: Record<string, string>;
  searchHub: string;
  interface?: InsightInterface;
}

export interface InsightInterface {
  id: string;
  name: string;
  resultTemplates: InsightResultTemplate[];
  facets: Facet[];
  tabs: Tab[];
  settings: SettingsSection;
  answerConfigId?: string;
}

interface InsightResultTemplate {
  name: string;
  layout: string;
  conditions: Condition[];
  badge: Badge;
  details: Detail[];
  resultActions: ResultActions;
  tags: Tags;
}

type Condition<
  ConditionType = 'isDefined' | 'isNotDefined' | 'mustMatch' | 'mustNotMatch',
> = {
  field: string;
  conditionType: ConditionType;
} & (ConditionType extends 'mustMatch' | 'mustNotMatch'
  ? {values: string[]}
  : {});

interface Badge {
  field: string;
  label?: string;
  color: string;
}

type InsightFieldType = 'string' | 'date' | 'number' | 'multi';

interface Detail {
  field: string;
  label?: string;
  fieldType?: InsightFieldType;
}

type ResultAction =
  | 'attachToCase'
  | 'copyToClipboard'
  | 'quickview'
  | 'sendAsEmail'
  | 'sendToFeed';

type InsightFacetType = 'standard' | 'numeric' | 'timeframe';

interface InsightOption {
  enabled: boolean;
}

type ResultActions = Record<ResultAction, InsightOption>;

type Tag = 'recommended' | 'viewedByCustomer';

interface TagParams {
  enabled: boolean;
  color: string;
}

type Tags = Record<Tag, TagParams>;

interface Facet {
  field: string;
  label?: string;
  displayValueAs?: string;
  facetType?: InsightFacetType;
}

interface Tab {
  label: string;
  conditions: Condition[];
}

interface InsightGenQAOptions extends InsightOption {
  collapsible: boolean;
}

interface SettingsSection {
  createArticle: InsightOption;
  fullSearch: InsightOption;
  genQA: InsightGenQAOptions;
  userActions: InsightUserActionOptions;
}

interface InsightUserActionOptions {
  enabled: boolean;
  recentClickedDocuments: InsightOption;
  recentQueries: InsightOption;
  timeline: InsightOption;
}
