import{n as e}from"./chunk-jRWAZmH_.js";import{D as t,E as n}from"./iframe-cSkD6HDI.js";import{n as r,t as i}from"./common-meta-parameters-BmIbTEf7.js";import{r as a,t as o}from"./search-interface-wrapper-DyJSRxFL.js";import{n as s,t as c}from"./mock-C5ckzz_b.js";import{i as l,n as u,r as d,t as f}from"./facets-decorator-DYB9S-w4.js";var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k=e((()=>{t(),s(),i(),u(),o(),p=new c,m=[{start:`past-1-hour`,end:`now`,state:`idle`,numberOfResults:12,endInclusive:!1},{start:`past-1-day`,end:`now`,state:`idle`,numberOfResults:45,endInclusive:!1},{start:`past-1-week`,end:`now`,state:`idle`,numberOfResults:87,endInclusive:!1},{start:`past-1-month`,end:`now`,state:`idle`,numberOfResults:234,endInclusive:!1},{start:`past-3-months`,end:`now`,state:`idle`,numberOfResults:456,endInclusive:!1},{start:`past-1-year`,end:`now`,state:`idle`,numberOfResults:1234,endInclusive:!1}],h=(e,{moreValuesAvailable:t=!1,facetId:n=`date`,field:r=`date`}={})=>({facetId:n,field:r,moreValuesAvailable:t,values:e,label:`Date`}),{decorator:g,play:_}=a(),{events:v,args:y,argTypes:b,template:x}=n(`atomic-timeframe-facet`,{excludeCategories:[`methods`]}),S={component:`atomic-timeframe-facet`,title:`Search/Facet (Timeframe)`,id:`atomic-timeframe-facet`,render:e=>x(e),decorators:[f,g],parameters:{...r,actions:{handles:v},msw:{handlers:[...p.handlers]}},args:y,argTypes:b,beforeEach:()=>{p.searchEndpoint.clear()},play:_},C={args:{"default-slot":`
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
    `},beforeEach:()=>{p.searchEndpoint.mockOnce(e=>({...e,facets:[h(m),h(m,{facetId:`date_input_range`})]}))}},w={name:`With Selected Value`,args:{"default-slot":`
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
    `},beforeEach:()=>{let e=m.map(e=>e.start===`past-1-month`?{...e,state:`selected`}:e);p.searchEndpoint.mockOnce(t=>({...t,facets:[h(e),h(m,{facetId:`date_input_range`})]}))}},T={name:`With Date Picker`,args:{"default-slot":`
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
    `,"with-date-picker":!0},beforeEach:()=>{p.searchEndpoint.mockOnce(e=>({...e,facets:[h(m),h(m,{facetId:`date_input_range`})]}))}},E={name:`With Depends On`,tags:[`test`],decorators:[l(`before`),d(`before`)],argTypes:{"depends-on-filetype":{name:`depends-on-filetype`,control:{type:`text`}}},args:{"default-slot":`
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
    `,label:`Timeframe (Dependent facet)`,"with-date-picker":!0,"depends-on-filetype":`YouTubeVideo`},beforeEach:()=>{p.searchEndpoint.mock(e=>({...e,facets:[h(m),h(m,{facetId:`date_input_range`}),{facetId:`filetype`,field:`filetype`,moreValuesAvailable:!0,values:[{value:`YouTubeVideo`,state:`selected`,numberOfResults:62734},{value:`pdf`,state:`idle`,numberOfResults:38398},{value:`html`,state:`idle`,numberOfResults:26879}]}]}))},play:async e=>{await customElements.whenDefined(`atomic-facet`),await _(e);let{canvas:t,step:n}=e;await n(`Select YouTubeVideo in filetype facet`,async()=>{let e=await t.findByShadowLabelText(`Inclusion filter on YouTubeVideo`,{exact:!1});e.ariaChecked===`false`&&e.click()})}},D={name:`Collapsed`,args:{"default-slot":`
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
    `,"is-collapsed":!0},beforeEach:()=>{p.searchEndpoint.mockOnce(e=>({...e,facets:[h(m),h(m,{facetId:`date_input_range`})]}))}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    'default-slot': \`
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
    \`
  },
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce(response => ({
      ...response,
      facets: [createDateFacetResponse(baseDateFacetValues), createDateFacetResponse(baseDateFacetValues, {
        facetId: 'date_input_range'
      })]
    }));
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'With Selected Value',
  args: {
    'default-slot': \`
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
    \`
  },
  beforeEach: () => {
    const selectedValues = baseDateFacetValues.map(v => v.start === 'past-1-month' ? {
      ...v,
      state: 'selected'
    } : v);
    searchApiHarness.searchEndpoint.mockOnce(response => ({
      ...response,
      facets: [createDateFacetResponse(selectedValues), createDateFacetResponse(baseDateFacetValues, {
        facetId: 'date_input_range'
      })]
    }));
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'With Date Picker',
  args: {
    'default-slot': \`
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
    \`,
    'with-date-picker': true
  },
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce(response => ({
      ...response,
      facets: [createDateFacetResponse(baseDateFacetValues), createDateFacetResponse(baseDateFacetValues, {
        facetId: 'date_input_range'
      })]
    }));
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: 'With Depends On',
  tags: ['test'],
  decorators: [withRegularFacet('before'), withBreadboxDecorator('before')],
  argTypes: {
    'depends-on-filetype': {
      name: 'depends-on-filetype',
      control: {
        type: 'text'
      }
    }
  },
  args: {
    'default-slot': \`
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
    \`,
    label: 'Timeframe (Dependent facet)',
    'with-date-picker': true,
    'depends-on-filetype': 'YouTubeVideo'
  },
  beforeEach: () => {
    // Pre-select YouTubeVideo in the filetype facet to trigger the dependency
    // Use .mock() instead of .mockOnce() to ensure it works in docs page
    searchApiHarness.searchEndpoint.mock(response => ({
      ...response,
      facets: [createDateFacetResponse(baseDateFacetValues), createDateFacetResponse(baseDateFacetValues, {
        facetId: 'date_input_range'
      }), {
        facetId: 'filetype',
        field: 'filetype',
        moreValuesAvailable: true,
        values: [{
          value: 'YouTubeVideo',
          state: 'selected',
          numberOfResults: 62734
        }, {
          value: 'pdf',
          state: 'idle',
          numberOfResults: 38398
        }, {
          value: 'html',
          state: 'idle',
          numberOfResults: 26879
        }]
      }]
    }));
  },
  play: async context => {
    //TODO: Fix component registration race condition #6480
    await customElements.whenDefined('atomic-facet');
    await play(context);
    const {
      canvas,
      step
    } = context;
    await step('Select YouTubeVideo in filetype facet', async () => {
      const button = await canvas.findByShadowLabelText('Inclusion filter on YouTubeVideo', {
        exact: false
      });
      button.ariaChecked === 'false' ? button.click() : null;
    });
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: 'Collapsed',
  args: {
    'default-slot': \`
      <atomic-timeframe unit="hour"></atomic-timeframe>
      <atomic-timeframe unit="day"></atomic-timeframe>
      <atomic-timeframe unit="week"></atomic-timeframe>
      <atomic-timeframe unit="month"></atomic-timeframe>
      <atomic-timeframe unit="quarter"></atomic-timeframe>
      <atomic-timeframe unit="year"></atomic-timeframe>
    \`,
    'is-collapsed': true
  },
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce(response => ({
      ...response,
      facets: [createDateFacetResponse(baseDateFacetValues), createDateFacetResponse(baseDateFacetValues, {
        facetId: 'date_input_range'
      })]
    }));
  }
}`,...D.parameters?.docs?.source}}},O=[`Default`,`WithSelectedValue`,`WithDatePicker`,`WithDependsOn`,`Collapsed`]}));k();export{D as Collapsed,C as Default,T as WithDatePicker,E as WithDependsOn,w as WithSelectedValue,O as __namedExportsOrder,S as default,k as t};