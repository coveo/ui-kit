import React from 'react';
import hljs from 'highlight.js';
import MonacoEditor from 'react-monaco-editor';

export const CodeSamplePanel = () => {
  const htmlString = `<div>hello code sample</div>`;

  //const styleString = renderShadowPartsToStyleString(componentTag, getArgs());
  return (
    <MonacoEditor
      language="html"
      height="100vh"
      theme="vs-dark"
      defaultValue={htmlString}
      options={{
        readOnly: true,
        theme: 'vs-dark',
        codeLens: false,
        language: 'html',
      }}
      editorDidMount={(editor, monaco) => {
        console.log(editor, monaco);
      }}
    />
  );
};
