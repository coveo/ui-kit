// biome-ignore lint/correctness/noUnusedImports: Storybook needs this import
import React, {useState} from 'react';

const GitHubIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="currentColor"
    style={{flexShrink: 0}}
    aria-hidden="true"
  >
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

/**
 * A floating "Edit in GitHub" button that links to the Atomic component's source file.
 * Rendered as a sticky float at the top-right of the docs page, matching the
 * docs.coveo.com floating button experience.
 *
 * @param {Object} props
 * @param {string} props.githubPath - Path relative to `packages/atomic/src/components/`
 * (e.g., `"search/atomic-did-you-mean/atomic-did-you-mean.ts"`)
 */
export const EditInGithubButton = ({githubPath}) => {
  const [hovered, setHovered] = useState(false);

  if (!githubPath) {
    return null;
  }

  const githubUrl = `https://github.com/coveo/ui-kit/blob/main/packages/atomic/src/components/${githubPath}`;

  const containerStyle = {
    display: 'block',
    textAlign: 'right',
    float: 'none',
    position: 'static',
    top: '1rem',
    zIndex: 1000,
    marginBottom: '1rem',
  };

  const anchorStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: hovered ? '0.375rem 0.75rem' : '0.25rem',
    width: hovered ? 'auto' : '36px',
    height: '36px',
    boxSizing: 'border-box',
    justifyContent: 'center',
    overflow: 'hidden',
    fontSize: '0.875rem',
    transition: 'width 160ms ease, padding 160ms ease, background-color 160ms ease, color 160ms ease, border-color 160ms ease, box-shadow 160ms ease',
    fontFamily: 'inherit',
    fontWeight: 500,
    color: hovered ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.72)',
    backgroundColor: '#e5e8e8',
    border: hovered ? '1px solid rgba(0,0,0,0.12)' : '1px solid transparent',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    boxShadow: hovered ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
    backdropFilter: hovered ? 'saturate(120%) blur(4px)' : 'none',
  };

  return (
    <div style={containerStyle}>
      <a
        href={githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Edit in GitHub"
        style={anchorStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <GitHubIcon />
        {hovered && 'Edit in GitHub'}
      </a>
    </div>
  );
}

// export a DOM factory that matches the React component styling/behavior
export function createEditInGithubElement() {
  const wrapper = document.createElement('div');
  // mirror the React `containerStyle` used around the anchor so visual parity is exact
  Object.assign(wrapper.style, {
    display: 'block',
    textAlign: 'right',
    float: 'none',
    position: 'static',
    top: '1rem',
    zIndex: '1000',
    marginBottom: '1rem',
    // ensure wrapper and children inherit the same docs font by default
    fontFamily:
      (typeof window !== 'undefined' &&
        (window.getComputedStyle(
          document.querySelector('.sbdocs-wrapper, .sbdocs-preview, .docs-root') ||
            document.body
        )?.fontFamily)) ||
      'inherit',
  });

  const a = document.createElement('a');
  a.setAttribute('aria-label', 'Edit in GitHub');
  a.target = '_blank';
  a.rel = 'noopener noreferrer';

  Object.assign(a.style, {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '36px', // fixed compact width pre-hover
    minWidth: '36px',
    height: '36px',
    boxSizing: 'border-box',
    justifyContent: 'center',
    overflow: 'hidden',
    fontSize: '14px',
    lineHeight: '1',
    transition:
      'width 160ms ease, padding 160ms ease, background-color 160ms ease, color 160ms ease, border-color 160ms ease, box-shadow 160ms ease',
    fontFamily: '"Nunito Sans", -apple-system, ".SFNSText-Regular", "San Francisco", BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontWeight: 500,
    padding: '0.25rem', // compact padding
    color: 'rgba(0,0,0,0.72)',
    backgroundColor: '#e5e8e8',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    boxShadow: 'none',
  });

  a.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" style="flex-shrink:0; display:block;">
      <g fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></g>
    </svg>
  `;

  a.addEventListener('mouseenter', () => {
    a.style.width = 'auto';
    a.style.padding = '0.375rem 0.75rem';
    a.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)';
    a.style.border = '1px solid rgba(0,0,0,0.12)';
    a.style.backdropFilter = 'saturate(120%) blur(4px)';
    a.style.color = 'rgba(0,0,0,0.85)';
    if (!a.textContent.includes('Edit in GitHub')) a.appendChild(document.createTextNode('Edit in GitHub'));
  });
  a.addEventListener('mouseleave', () => {
    a.style.width = '36px';
    a.style.padding = '0.25rem';
    a.style.boxShadow = 'none';
    a.style.border = '1px solid transparent';
    a.style.backdropFilter = 'none';
    a.style.color = 'rgba(0,0,0,0.72)';
    Array.from(a.childNodes).filter(n => n.nodeType === Node.TEXT_NODE).forEach(t => a.removeChild(t));
  });

  wrapper.appendChild(a);

  // expose `href` on the wrapper so existing preview code can set `btn.href`
  Object.defineProperty(wrapper, 'href', {
    get() {
      return a.href;
    },
    set(v) {
      a.href = v;
    },
    configurable: true,
    enumerable: true,
  });

  // expose a convenient method to update the inner anchor (in case callers want it)
  wrapper._anchor = a;

  return wrapper;
}
