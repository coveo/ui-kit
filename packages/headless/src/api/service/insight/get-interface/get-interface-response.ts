// TODO: Write the JSDoc for everything

export interface GetInsightInterfaceResponse {
  contextFields: Record<string, string>;
  searchHub: string;
  interface: {
    id: string;
    name: string;
    resultTemplates: InsightResultTemplate[];
    facets: Facet[];
    tabs: Tab[];
    settings: SettingsSection;
  };
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

type Condition =
  | FieldIsDefined
  | FieldIsNotDefined
  | FieldMustMatch
  | FieldMustNotMatch;

interface FieldIsDefined {
  conditionType: 'isDefined';
  field: string;
}

interface FieldIsNotDefined {
  conditionType: 'isNotDefined';
  field: string;
}

interface FieldMustMatch {
  conditionType: 'mustMatch';
  field: string;
  values: string[];
}

interface FieldMustNotMatch {
  conditionType: 'mustNotMatch';
  field: string;
  values: string[];
}

interface Badge {
  field: string;
  label?: string;
  color: string;
}

interface Detail {
  field: string;
  label?: string;
}

type ResultAction =
  | 'attachToCase'
  | 'copyToClipboard'
  | 'quickview'
  | 'sendAsEmail'
  | 'sendToFeed';

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
}

interface Tab {
  label: string;
  conditions: Condition[];
}

interface SettingsSection {
  createArticle: InsightOption;
  fullSearch: InsightOption;
  userActions: InsightUserActionOptions;
}

interface InsightUserActionOptions {
  enabled: boolean;
  recentClickedDocuments: InsightOption;
  recentQueries: InsightOption;
  timeline: InsightOption;
}
