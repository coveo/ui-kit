const Navigate: unique symbol = Symbol('Navigate');
const GenerateUrl: unique symbol = Symbol('GenerateUrl');

declare module 'lightning/navigation' {
  /** use with @wire, but directly assigns the pageref, not {data,error} */
  function CurrentPageReference(config?: any): any;

  const NavigationMixin: {
    <T>(Base: T): T & NavClz;
    readonly Navigate: typeof Navigate;
    readonly GenerateUrl: typeof GenerateUrl;
  };

  class NavClz {
    [NavigationMixin.Navigate](
      pageReference: PageReference,
      replace?: boolean
    ): void;
    [NavigationMixin.GenerateUrl](
      pageReference: PageReference
    ): Promise<string>;
  }

  interface PageReference {
    type: PageRefType;
    attributes?: object;
    state: {
      [key: string]: string;
    };
  }

  type PageRefType =
    | 'standard__app'
    | 'standard__component'
    | 'comm__loginPage'
    | 'standard__knowledgeArticlePage'
    | 'comm__namedPage'
    | 'standard__namedPage'
    | 'standard__navItemPage'
    | 'standard__objectPage'
    | 'standard__recordPage'
    | 'standard__recordRelationshipPage'
    | 'standard__webPage';

    function getNavigateCalledWith(): any;
    function getGenerateUrlCalledWith(): any;
}
