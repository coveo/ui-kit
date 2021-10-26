import {h} from '@stencil/core';
import hljs from 'highlight.js';
import 'highlight.js/styles/monokai-sublime.css';

export function codeSample(htmlString: string) {
  return (
    <pre
      style={{
        position: 'relative',
      }}
    >
      <code
        className="code-sample"
        style={{
          backgroundColor: '#242A31',
          padding: '30px',
          marginTop: '10px',
          display: 'block',
          overflow: 'auto',
        }}
        innerHTML={
          hljs.highlight(htmlString, {
            language: 'html',
          }).value
        }
      ></code>
      <button
        style={{
          position: 'absolute',
          bottom: '0',
          right: '0',
          backgroundColor: 'white',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: '5px 0px 0px',
          padding: '5px 13px',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'copy',
        }}
        onClick={() => {
          navigator.clipboard.writeText(htmlString);
        }}
      >
        Copy
      </button>
    </pre>
  );
}
