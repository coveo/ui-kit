import { IconButton } from "storybook/internal/components";
import { STORY_MISSING, STORY_RENDERED } from "storybook/internal/core-events";
import { CogIcon, GithubIcon } from "@storybook/icons";
import { addons, types, useStorybookApi, useStorybookState } from "storybook/manager-api";
import { create } from "storybook/theming";
import { COVEO_PRIMARY, FONT_BASE, FONT_CODE } from "./theme";
import {
  resolveGithubDocsUrl,
  resolveGithubUrl,
} from "../storybook-utils/documentation/resolve-github-path";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect, useRef } from "react";

type AtomicSearchInterfaceElement = HTMLElement & {
  initialize: (options: { accessToken: string; organizationId: string }) => Promise<void>;
};

declare global {
  interface Window {
    OneTrust: {
      ToggleInfoDisplay: () => void;
    };
  }

  namespace JSX {
    interface IntrinsicElements {
      "atomic-search-interface": React.DetailedHTMLProps<
        React.HTMLAttributes<AtomicSearchInterfaceElement>,
        AtomicSearchInterfaceElement
      > & {
        analytics?: string;
        "search-hub"?: string;
        ref?: React.Ref<AtomicSearchInterfaceElement>;
      };
      "atomic-search-box": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "redirection-url"?: string;
        ref?: React.Ref<HTMLElement>;
      };
    }
  }
}

function CoveoDocsSearchBox() {
  const searchInterfaceRef = useRef<AtomicSearchInterfaceElement>(null);
  const searchBoxRef = useRef<HTMLElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || !searchInterfaceRef.current) {
      return;
    }
    initializedRef.current = true;

    const searchInterface = searchInterfaceRef.current;
    let cancelled = false;

    customElements.whenDefined("atomic-search-interface").then(() => {
      if (cancelled) {
        return;
      }
      searchInterface
        .initialize({
          // Public API key with only anonymous search + UA logging permissions.
          // Safe to expose in client-side code
          accessToken: "xx6ac9d08f-eb9a-48d5-9240-d7c251470c93",
          organizationId: "coveosearch",
        })
        .catch((err) => {
          console.warn("Coveo Docs search initialization failed:", err);
        });
    });

    // Intercept the redirect event to append the query as a URL hash parameter.
    // By default, atomic-search-box stores the query in localStorage before
    // redirecting, but localStorage is origin-scoped — the destination page
    // (docs.coveo.com) can't read data written by the Storybook origin.
    const searchBox = searchBoxRef.current;
    const handleRedirect = (e: Event) => {
      const { redirectTo, value } = (e as CustomEvent).detail;
      e.preventDefault();
      const url = new URL(redirectTo);
      url.hash = `#q=${encodeURIComponent(value)}`;
      window.location.href = url.toString();
    };
    searchBox?.addEventListener("redirect", handleRedirect);

    return () => {
      cancelled = true;
      searchBox?.removeEventListener("redirect", handleRedirect);
    };
  }, []);

  return (
    <div id="coveo-docs-search-container">
      <atomic-search-interface
        ref={searchInterfaceRef}
        analytics="false"
        search-hub="Coveo Docs Unified Search"
      >
        <atomic-search-box
          ref={searchBoxRef}
          redirection-url="https://docs.coveo.com/en/search/"
        ></atomic-search-box>
      </atomic-search-interface>
    </div>
  );
}

const coveoTheme = create({
  base: "dark",

  // Branding
  brandTitle: "Coveo Docs",
  brandUrl: "https://docs.coveo.com/en/0",
  brandTarget: "_blank",
  brandImage: "./coveo-logo.svg",

  // Colors
  colorPrimary: COVEO_PRIMARY,
  colorSecondary: COVEO_PRIMARY,

  // UI
  appBg: "#1b2631",
  appContentBg: "#1e2a35",
  appPreviewBg: "#ffffff",
  appBorderColor: "#3a4a5a",
  appBorderRadius: 4,

  // Typography
  fontBase: FONT_BASE,
  fontCode: FONT_CODE,

  // Text
  textColor: "#e8eaed",
  textInverseColor: "#1b2631",
  textMutedColor: "#9aa5b1",

  // Toolbar
  barBg: "#1b2631",
  barTextColor: "#9aa5b1",
  barSelectedColor: "#ffffff",
  barHoverColor: "#e8eaed",

  // Form
  inputBg: "#263544",
  inputBorder: "#3a4a5a",
  inputTextColor: "#e8eaed",
  inputBorderRadius: 4,
});

addons.setConfig({
  theme: coveoTheme,
});

addons.register("SELECT-FIRST-STORY-BY-DEFAULT-ONCE", (api) => {
  api.once(STORY_MISSING, () => {
    const currentId = api.getUrlState().storyId;
    if (!currentId) {
      return api.selectFirstStory();
    }
    // The first parameter expects the PascalCase story ID whereas the second expects the sluggified one.
    // See: https://github.com/storybookjs/storybook/blob/b0052ad9f71f5763dcb25af31bc8832097682d29/code/lib/manager-api/src/modules/stories.ts#L401
    api.selectStory(undefined, "default");
  });
});

addons.register("coveo-docs-search", () => {
  addons.add("coveo-docs-search/toolbar", {
    type: types.TOOL,
    title: "Search Coveo Docs",
    match: () => true,
    render: () => <CoveoDocsSearchBox />,
  });
});

addons.register("custom/onetrust-button", () => {
  addons.add("custom/onetrust-button/toolbar", {
    type: types.TOOL,
    title: "Cookie Preferences",
    match: () => true,
    render: () => (
      <IconButton
        key="onetrust-button"
        title="Open Cookie Preferences"
        onClick={() => {
          if (window.OneTrust && typeof window.OneTrust.ToggleInfoDisplay === "function") {
            window.OneTrust.ToggleInfoDisplay();
          } else {
            console.warn("OneTrust is not available on this page.");
          }
        }}
      >
        <CogIcon />
      </IconButton>
    ),
  });
});

const observeAndExpandButtons = () => {
  const expandButtons = () => {
    const buttonsToExpand: NodeListOf<HTMLButtonElement> =
      document.querySelectorAll(
        'button[data-action="expand-all"][data-expanded="false"]'
      );
    if (!buttonsToExpand.length) return false;
    buttonsToExpand.forEach((button) => {
      button.click();
    });
    return true;
  };

  // Check immediately in case buttons are already in the DOM
  if (expandButtons()) {
    return;
  }

  // Otherwise, observe for future DOM mutations
  const observer = new MutationObserver(() => {
    if (expandButtons()) {
      observer.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

const addNoIndexMetaTag = () => {
  if (!document.querySelector('meta[name="robots"][content="noindex"]')) {
    const metaTag = document.createElement("meta");
    metaTag.name = "robots";
    metaTag.content = "noindex";
    document.head.appendChild(metaTag);
  }
};

function EditInGithubToolbarButton() {
  const { viewMode, storyId } = useStorybookState();
  const api = useStorybookApi();

  const entry = storyId
    ? (api.getData(storyId) as unknown as Record<string, unknown> | undefined)
    : undefined;

  const importPath = entry?.importPath as string | undefined;

  const githubUrl =
    viewMode === "docs" ? resolveGithubDocsUrl(importPath) : resolveGithubUrl(importPath);

  if (!githubUrl) return null;

  return (
    <IconButton
      key="edit-in-github"
      title="Edit in GitHub"
      onClick={() => {
        const w = window.open(githubUrl, "_blank", "noopener,noreferrer");
        if (w) w.opener = null;
      }}
    >
      <GithubIcon />
    </IconButton>
  );
}

addons.register("coveo-edit-in-github", () => {
  addons.add("coveo-edit-in-github/toolbar", {
    type: types.TOOL,
    title: "Edit in GitHub",
    match: () => true,
    render: () => <EditInGithubToolbarButton />,
  });
});

addons.register("expand-all-folders-on-crawling", () => {
  addons.getChannel().on(STORY_RENDERED, (storyId) => {
    if (storyId === "crawling--crawling") {
      observeAndExpandButtons();
      addNoIndexMetaTag();
    }
  });
});
