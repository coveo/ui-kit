import React, {useRef} from 'react';
import {useArgs, useParameter} from '@storybook/api';
import {
  renderArgsToHTMLString,
  renderShadowPartsToStyleString,
} from '../default-story-shared';
import MonacoEditor from '@monaco-editor/react';
import {renderArgsToResultTemplate} from '../default-result-component-story';

const addSpacingBetweenStylingAndHTML = (
  htmlString: string,
  styleString: string
) => {
  if (styleString && htmlString) {
    return `${styleString} \n\n ${htmlString}`;
  }
  return styleString ? styleString : htmlString;
};

export const CodeSamplePanel = () => {
  const componentTag = useParameter('shadowParts', null)?.componentTag;
  const isResultComponent = useParameter(
    'shadowParts',
    null
  )?.isResultComponent;
  const [args, _] = useArgs();
  const styleString = renderShadowPartsToStyleString(componentTag, args);
  const htmlString = isResultComponent
    ? renderArgsToResultTemplate(
        renderArgsToHTMLString(componentTag, args),
        () => args,
        false
      )
    : renderArgsToHTMLString(componentTag, args);
  const editorRef = useRef(null);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        position: 'relative',
      }}
    >
      <MonacoEditor
        width="100%"
        height="800px"
        theme="vs-dark"
        defaultValue={''}
        value={addSpacingBetweenStylingAndHTML(htmlString, styleString)}
        defaultLanguage="html"
        options={{
          theme: 'vs-dark',
          readOnly: false,
          minimap: {
            enabled: false,
          },
        }}
        onMount={(editor, _) => {
          editorRef.current = editor;
          editor.onDidFocusEditorText(() => {
            editor.setScrollTop(0);
            editor.updateOptions({readOnly: true});
          });
          editor.onDidChangeModelContent(() => {
            editor.getAction('editor.action.formatDocument').run();
          });
        }}
      />
      <button
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: 'white',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: '5px 0px 0px 5px',
          padding: '5px 13px',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'copy',
        }}
        onClick={() => {
          navigator.clipboard.writeText(editorRef.current.getValue());
        }}
      >
        Copy
      </button>
    </div>
  );
};
