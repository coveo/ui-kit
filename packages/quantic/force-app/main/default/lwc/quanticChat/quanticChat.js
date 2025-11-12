import {LightningElement, track, api} from 'lwc';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
// @ts-ignore
import initialStateTemplate from './templates/initialState.html';
// @ts-ignore
import chatTemplate from './templates/chat.html';

export default class QuanticChat extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The unique identifier of the answer configuration to use to generate the answer.
   * @api
   * @type {string}
   * @default {undefined}
   */
  @api answerConfigurationId;

  answers = [];

  @track currentPrompt = '';
  controller;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  initialize = (engine) => {
    this.headless = getHeadlessBundle(this.engineId);
    this.conversation = this.headless.buildMultiturnConversation(engine, {
      answerConfigurationId: this.answerConfigurationId,
    });
    this.unsubscribe = this.conversation.subscribe(() => this.updateState());
  };

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  updateState() {
    this.answers = this.conversation?.state?.answers ?? [];
    this.scrollToBottom();
  }

  handleInputChange(event) {
    this.currentPrompt = event.target.value;
  }

  handleKeyUp(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      this.submitPrompt();
    }
  }

  submitPrompt() {
    const prompt = this.currentPrompt.trim();
    console.log('Submitting prompt:', prompt);
    if (!prompt) return;

    // Add user message immediately
    // this.answers = [
    //   ...this.answers,
    //   {
    //     answer: '',
    //     // '# What Is Coveo?\n\nCoveo is a **relevance platform** that enhances user experiences through **machine learning-powered search** and **recommendations**. It provides solutions for four primary use cases:\n\n1. **Commerce**: Boosts revenue by presenting relevant products during the shopping experience.\n2. **Website**: Enhances user interaction and satisfaction by offering a centralized hub of information for visitors.\n3. **Workplace**: Increases employee efficiency and reduces operational costs by facilitating quick access to internal resources.\n4. **Service**: Promotes customer self-service and improves service agent efficiency by effectively resolving support cases.\n\nCoveo operates on three main project phases:\n\n- **Indexing**: Collecting the right content with appropriate metadata.\n- **Creating Search Experiences**: Designing a search interface to query the indexed data.\n- **Tuning Relevance**: Enhancing search experience relevance through machine learning and business rules.\n\nOverall, Coveo aims to deliver personalized and relevant digital experiences across various platforms.',
    //     prompt: 'what is Coveo',
    //     citations: [
    //       {
    //         id: '42.46594$https://docs.coveo.com/en/assets/PDF/Platform/Coveo%20Platform%20Implementation%20Guide.pdf-55:1',
    //         title: 'Coveo Implementation Project Guide',
    //         uri: 'https://docs.coveo.com/en/assets/PDF/Platform/Coveo%20Platform%20Implementation%20Guide.pdf',
    //         clickUri:
    //           'https://docs.coveo.com/en/assets/PDF/Platform/Coveo%20Platform%20Implementation%20Guide.pdf',
    //         permanentid:
    //           'e4a9bd2872cb5716539d99458ed5be43da255a86895175462f559d877cf2',
    //         primaryId: 'HB3E6Z2NNVBTMUDJNM4FM2SYPEXDINRVHE2C4ZDFMZQXK3DU',
    //         text: 'intend to replace the product documentation, but share best practices for a successful implementation. For a step-by-step learning experience, see the Level Up platform. What Is Coveo? Coveo is a relevance platform that enables relevant experiences through machine learning-powered search and recommendations. Coveo oﬀers solutions for four main use cases: 1. Commerce: Increase revenue by showing people what they need during their shopping experience 2. Website: Improve user interaction and satisfaction by providing a uniﬁed hub of information for external visitors 3. Workplace: Increase employee proﬁciency and eﬃciency — and reduce operating costs — by allowing workers to get to internal resources they need more quickly 4. Service: Enable customer self-service and streamline service agent proﬁciency by eﬃciently resolving and closing support cases Project steps 1. Indexing the appropriate content with the right metadata in Coveo 2. Creating the search experience to query that data No matter which solution you choose, Coveo functions with the same general principles: • Indexing the right content in your Coveo index • Making a search experience to present that content • Improving the relevance of your experience by enabling machine learning and adding business rules • Continuously improve the experience by observing user behavior and making informed business decisions based on it 3. Tuning the relevance by adding features to enhance the relevance of your search experiences At its core, Coveo projects work in these three main phases. This project guide will help you through those steps in order. Websites Application DAM Sources of',
    //         source: 'Coveo Docs',
    //       },
    //       {
    //         id: '42.46594$https://docs.coveo.com/en/assets/PDF/Platform/Coveo%20Platform%20Architecture%20Guide.pdf-59:0',
    //         title: 'Coveo Platform Architecture Guide',
    //         uri: 'https://docs.coveo.com/en/assets/PDF/Platform/Coveo%20Platform%20Architecture%20Guide.pdf',
    //         clickUri:
    //           'https://docs.coveo.com/en/assets/PDF/Platform/Coveo%20Platform%20Architecture%20Guide.pdf',
    //         permanentid:
    //           'c18dfc72631553221a2e0a19afe51f8d7e1d1dccd3e4980861c5bf9e8277',
    //         primaryId: 'NYYGISZXPJUFSMRWMFJE6VCVHEXDINRVHE2C4ZDFMZQXK3DU',
    //         text: 'Coveo Platform Architecture Guide White Paper Contents Introduction A Coveo Architecture A Planning the Implementation A Tracking Data A Indexing Content A Serving Content A Relevance A Common Pitfalls A Additional Resources A Introduction Coveo is a highly scalable, highly extensible, cloud-based, enterprise AI platform that uses semantic search, AI recommendations, and GenAI answering to provide individualized, connected, and trusted digital experiences. This document is meant to help you understand how Coveo works and how it ﬁts within a larger implementation project. It is aimed mostly at project managers and solution architects. Developers wanting to know how to implement Coveo should follow the Platform Developer Certiﬁcation on Level Up. Coveo Architecture Websites Application Sources of Content 1 Index Coveo Organization 6, 7 5 The Coveo architecture can be summarized as such: 1. Coveo integrates content from many diﬀerent sources using its connectors, and consolidates the information in a single, uniﬁed index that lives in your Coveo organization. Query Pipelines Business Rules Machine Learning Usage Analytics 2. A query is sent to Coveo, either due to a user searching or through recommendation or listing components wanting to display content to users. 3. In parallel, a second call is made to Coveo Usage Analytics, indicating a query was performed. This data is what allows Coveo Machine Learning to learn. 4. The query goes through a query pipeline in the Coveo Platform. 3, 9 4, 8 10 2 Website Search Recommendations Page Navigation 5. The query pipeline modiﬁes the query according to business',
    //         source: 'Coveo Docs',
    //       },
    //       {
    //         id: '42.46594$https://docs.coveo.com/en/0/-70:0',
    //         title: 'Coveo documentation',
    //         uri: 'https://docs.coveo.com/en/0/',
    //         clickUri: 'https://docs.coveo.com/en/0/',
    //         permanentid:
    //           '696ebfd0bbb6a3638d9e2ca06755d786baab900292c5469ce17e6cf5b5c2',
    //         primaryId: 'IRFFGYSJKRDXG22SORWFKZ3FJQXDINRVHE2C4ZDFMZQXK3DU',
    //         text: "Get what you're looking for Coveo documentation Coveo Platform overview Product tour See firsthand how AI-powered relevance can change your business. Get a demo Learn interactively Create a test organization, get an interactive tour of Coveo, and more. Coveo Level Up Use our DX tools Check out the Coveo CLI, Atomic, and Headless libraries. Developer Experience Previous Next Commerce Index your commerce content, integrate relevant search and Coveo ML-powered product recommendations into your commerce site, and drive conversion. Service Unify structured and unstructured data to create a repository of knowledge. Even large and complex indexes will always return the most relevant content, personalized for each end-user. Workplace Unify your information securely and provide your users with sub-second access to the same data, and only the data, that they can see in the repositories for which they have permissions. Website Use generic or product-specific connectors to index your web content. Integrate AI-powered search into any web application or CMS, and offer visitors the most relevant experience at every touchpoint. Coveo for Salesforce Coveo for Agentforce Coveo for SAP Commerce Coveo for Shopify Coveo for Salesforce Commerce Cloud Coveo for ServiceNow Coveo for Sitecore Coveo for Zendesk Coveo for Adobe Coveo for Optimizely Coveo for Contentful Coveo In-Product Experience (IPX) Coveo for Genesys Cloud Web Search the content of a website. Sitemap Search the content of a sitemap file or Sitemaps index file. YouTube Search the content of a YouTube brand or user channel. REST API Search any content which is located",
    //         source: 'Coveo Docs',
    //       },
    //     ],
    //     isStreaming: false,
    //     isLoading: false,
    //     error: null,
    //     cannotAnswer: false,
    //     answerContentFormat: 'text/markdown',
    //   },
    // ];

    // Ask Headless controller
    this.conversation.ask(prompt);

    // Clear input
    this.currentPrompt = '';
  }

  // Helper functions for CSS classes
  isUserTurn(turn) {
    return turn.type === 'user';
  }

  isAITurn(turn) {
    return !turn.type || turn.type === 'ai';
  }

  turnClass(turn) {
    return this.isUserTurn(turn) ? 'turn user-turn' : 'turn ai-turn';
  }

  scrollToBottom() {
    const container = this.template.querySelector('.chat-messages');
    if (container) {
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 50);
    }
  }

  render() {
    if (this.answers.length === 0) {
      return initialStateTemplate;
    }
    return chatTemplate;
  }
}
