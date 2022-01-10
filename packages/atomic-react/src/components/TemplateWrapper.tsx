import React from 'react';
import ReactDOMServer from 'react-dom/server';

export const TemplateWrapper = (
  props: React.PropsWithChildren<{[attr: string]: any}>
) => {
  const {children, ...attrs} = props;
  const innerHTML = ReactDOMServer.renderToStaticMarkup(<>{children}</>);
  return (
    <template
      {...attrs}
      dangerouslySetInnerHTML={{__html: innerHTML}}
    ></template>
  );
};
