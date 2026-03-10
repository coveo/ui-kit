export interface InteractionProtocol {
  role: string;
  selector: string;
  stateAttributes: string[];
  apgPattern?: string;
  actions: Array<{
    name: string;
    keys: string[];
    focusFirst?: boolean;
  }>;
}

export const INTERACTION_PROTOCOLS: InteractionProtocol[] = [
  {
    role: 'combobox',
    selector:
      '[role="combobox"], input[role="combobox"], textarea[aria-autocomplete], input[aria-autocomplete]',
    stateAttributes: ['aria-expanded', 'aria-activedescendant'],
    apgPattern: 'combobox',
    actions: [
      {name: 'open', keys: ['ArrowDown'], focusFirst: true},
      {
        name: 'navigate',
        keys: ['ArrowDown', 'ArrowDown', 'ArrowDown'],
        focusFirst: false,
      },
      {name: 'close', keys: ['Escape'], focusFirst: false},
    ],
  },
  {
    role: 'tab',
    selector: '[role="tab"]',
    stateAttributes: ['aria-selected'],
    apgPattern: 'tabs',
    actions: [
      {
        name: 'navigate-right',
        keys: ['ArrowRight', 'ArrowRight'],
        focusFirst: true,
      },
      {name: 'navigate-left', keys: ['ArrowLeft'], focusFirst: false},
    ],
  },
  {
    role: 'accordion',
    selector: '[role="heading"] button[aria-expanded], details > summary',
    stateAttributes: ['aria-expanded'],
    apgPattern: 'accordion',
    actions: [
      {name: 'toggle', keys: ['Enter'], focusFirst: true},
      {name: 'navigate-down', keys: ['ArrowDown'], focusFirst: false},
    ],
  },
  {
    role: 'button[aria-expanded]',
    selector: 'button[aria-expanded], [role="button"][aria-expanded]',
    stateAttributes: ['aria-expanded'],
    apgPattern: 'disclosure',
    actions: [{name: 'toggle', keys: ['Enter'], focusFirst: true}],
  },
  {
    role: 'button',
    selector:
      'button:not([aria-expanded]):not([aria-haspopup]), [role="button"]:not([aria-expanded]):not([aria-haspopup])',
    stateAttributes: ['aria-pressed', 'aria-disabled'],
    apgPattern: 'button',
    actions: [
      {name: 'activate', keys: ['Enter'], focusFirst: true},
      {name: 'activate-space', keys: [' '], focusFirst: false},
    ],
  },
  {
    role: 'carousel',
    selector:
      '[role="group"][aria-roledescription="slide"], [aria-roledescription="carousel"]',
    stateAttributes: ['aria-live', 'aria-label'],
    apgPattern: 'carousel',
    actions: [
      {name: 'next', keys: ['ArrowRight'], focusFirst: true},
      {name: 'prev', keys: ['ArrowLeft'], focusFirst: false},
    ],
  },
  {
    role: 'checkbox',
    selector: '[role="checkbox"], input[type="checkbox"]',
    stateAttributes: ['aria-checked', 'checked'],
    apgPattern: 'checkbox',
    actions: [{name: 'toggle', keys: [' '], focusFirst: true}],
  },
  {
    role: 'disclosure',
    selector:
      '[data-disclosure] button[aria-expanded], nav button[aria-expanded]',
    stateAttributes: ['aria-expanded'],
    apgPattern: 'disclosure',
    actions: [{name: 'toggle', keys: ['Enter'], focusFirst: true}],
  },
  {
    role: 'feed',
    selector: '[role="feed"]',
    stateAttributes: ['aria-busy'],
    apgPattern: 'feed',
    actions: [
      {name: 'next-article', keys: ['PageDown'], focusFirst: true},
      {name: 'prev-article', keys: ['PageUp'], focusFirst: false},
    ],
  },
  {
    role: 'grid',
    selector: '[role="grid"]',
    stateAttributes: ['aria-multiselectable', 'aria-readonly'],
    apgPattern: 'grid',
    actions: [
      {name: 'navigate-right', keys: ['ArrowRight'], focusFirst: true},
      {name: 'navigate-down', keys: ['ArrowDown'], focusFirst: false},
      {name: 'navigate-left', keys: ['ArrowLeft'], focusFirst: false},
    ],
  },
  {
    role: 'listbox',
    selector: '[role="listbox"]',
    stateAttributes: ['aria-multiselectable', 'aria-activedescendant'],
    apgPattern: 'listbox',
    actions: [
      {name: 'navigate-down', keys: ['ArrowDown'], focusFirst: true},
      {name: 'navigate-up', keys: ['ArrowUp'], focusFirst: false},
      {name: 'select', keys: [' '], focusFirst: false},
    ],
  },
  {
    role: 'menu-button',
    selector:
      'button[aria-haspopup="menu"], [role="button"][aria-haspopup="menu"]',
    stateAttributes: ['aria-expanded', 'aria-haspopup'],
    apgPattern: 'menu-button',
    actions: [
      {name: 'open', keys: ['Enter'], focusFirst: true},
      {
        name: 'navigate-down',
        keys: ['ArrowDown', 'ArrowDown'],
        focusFirst: false,
      },
      {name: 'close', keys: ['Escape'], focusFirst: false},
    ],
  },
  {
    role: 'menubar',
    selector: '[role="menubar"]',
    stateAttributes: ['aria-orientation'],
    apgPattern: 'menubar',
    actions: [
      {
        name: 'navigate-right',
        keys: ['ArrowRight', 'ArrowRight'],
        focusFirst: true,
      },
      {name: 'navigate-left', keys: ['ArrowLeft'], focusFirst: false},
      {name: 'open-submenu', keys: ['ArrowDown'], focusFirst: false},
    ],
  },
  {
    role: 'switch',
    selector: '[role="switch"]',
    stateAttributes: ['aria-checked'],
    apgPattern: 'switch',
    actions: [{name: 'toggle', keys: [' '], focusFirst: true}],
  },
  {
    role: 'radio-group',
    selector: '[role="radiogroup"]',
    stateAttributes: ['aria-required'],
    apgPattern: 'radio-group',
    actions: [
      {name: 'select-next', keys: ['ArrowDown'], focusFirst: true},
      {name: 'select-prev', keys: ['ArrowUp'], focusFirst: false},
    ],
  },
  {
    role: 'slider',
    selector: '[role="slider"]',
    stateAttributes: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
    apgPattern: 'slider',
    actions: [
      {name: 'increase', keys: ['ArrowRight'], focusFirst: true},
      {name: 'decrease', keys: ['ArrowLeft'], focusFirst: false},
      {name: 'min', keys: ['Home'], focusFirst: false},
      {name: 'max', keys: ['End'], focusFirst: false},
    ],
  },
  {
    role: 'spinbutton',
    selector: '[role="spinbutton"], input[type="number"]',
    stateAttributes: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
    apgPattern: 'spinbutton',
    actions: [
      {name: 'increase', keys: ['ArrowUp'], focusFirst: true},
      {name: 'decrease', keys: ['ArrowDown'], focusFirst: false},
    ],
  },
  {
    role: 'toolbar',
    selector: '[role="toolbar"]',
    stateAttributes: ['aria-orientation', 'aria-label'],
    apgPattern: 'toolbar',
    actions: [
      {
        name: 'navigate-right',
        keys: ['ArrowRight', 'ArrowRight'],
        focusFirst: true,
      },
      {name: 'navigate-left', keys: ['ArrowLeft'], focusFirst: false},
    ],
  },
  {
    role: 'tooltip',
    selector: '[aria-describedby][tabindex], button[aria-describedby]',
    stateAttributes: ['aria-describedby', 'aria-hidden'],
    apgPattern: 'tooltip',
    actions: [
      {name: 'show', keys: ['Tab'], focusFirst: true},
      {name: 'dismiss', keys: ['Escape'], focusFirst: false},
    ],
  },
  {
    role: 'tree',
    selector: '[role="tree"]',
    stateAttributes: ['aria-multiselectable'],
    apgPattern: 'treeview',
    actions: [
      {name: 'navigate-down', keys: ['ArrowDown'], focusFirst: true},
      {name: 'expand', keys: ['ArrowRight'], focusFirst: false},
      {name: 'collapse', keys: ['ArrowLeft'], focusFirst: false},
    ],
  },
  {
    role: 'treegrid',
    selector: '[role="treegrid"]',
    stateAttributes: ['aria-multiselectable'],
    apgPattern: 'treegrid',
    actions: [
      {name: 'navigate-down', keys: ['ArrowDown'], focusFirst: true},
      {name: 'expand', keys: ['ArrowRight'], focusFirst: false},
      {name: 'collapse', keys: ['ArrowLeft'], focusFirst: false},
    ],
  },
  {
    role: 'window-splitter',
    selector: '[role="separator"][tabindex]',
    stateAttributes: [
      'aria-valuenow',
      'aria-valuemin',
      'aria-valuemax',
      'aria-orientation',
    ],
    apgPattern: 'windowsplitter',
    actions: [
      {name: 'increase', keys: ['ArrowRight'], focusFirst: true},
      {name: 'decrease', keys: ['ArrowLeft'], focusFirst: false},
    ],
  },
  {
    role: 'menuitem',
    selector: '[role="menuitem"]',
    stateAttributes: ['aria-expanded'],
    apgPattern: 'menubar',
    actions: [
      {name: 'activate', keys: ['Enter'], focusFirst: true},
      {
        name: 'navigate-down',
        keys: ['ArrowDown', 'ArrowDown'],
        focusFirst: false,
      },
      {name: 'close', keys: ['Escape'], focusFirst: false},
    ],
  },
  {
    role: 'dialog',
    selector:
      '[role="dialog"] button, button[aria-haspopup="true"]:not([aria-haspopup="dialog"]):not([aria-haspopup="alertdialog"])',
    stateAttributes: ['aria-modal'],
    apgPattern: 'dialog',
    actions: [
      {name: 'open', keys: ['Enter'], focusFirst: true},
      {name: 'focus-trap', keys: ['Tab', 'Tab', 'Tab'], focusFirst: false},
      {name: 'close', keys: ['Escape'], focusFirst: false},
    ],
  },
  {
    role: 'alertdialog',
    selector: '[role="alertdialog"] button, [aria-haspopup="alertdialog"]',
    stateAttributes: ['aria-modal'],
    apgPattern: 'alertdialog',
    actions: [
      {name: 'open', keys: ['Enter'], focusFirst: true},
      {name: 'close', keys: ['Escape'], focusFirst: false},
    ],
  },
  {
    role: 'dialog-trigger',
    selector: '[aria-haspopup="dialog"], button[aria-haspopup="dialog"]',
    stateAttributes: ['aria-expanded'],
    apgPattern: 'dialog',
    actions: [
      {name: 'open-dialog', keys: ['Enter'], focusFirst: true},
      {
        name: 'focus-trap-test',
        keys: [
          'Tab',
          'Tab',
          'Tab',
          'Tab',
          'Tab',
          'Tab',
          'Tab',
          'Tab',
          'Tab',
          'Tab',
        ],
        focusFirst: false,
      },
      {name: 'close-dialog', keys: ['Escape'], focusFirst: false},
    ],
  },
  {
    role: 'alert',
    selector: '[role="alert"]',
    stateAttributes: ['aria-live', 'aria-atomic'],
    apgPattern: 'alert',
    actions: [],
  },
  {
    role: 'breadcrumb',
    selector: '[aria-label="breadcrumb"] ol, nav[aria-label="breadcrumb"]',
    stateAttributes: ['aria-current'],
    apgPattern: 'breadcrumb',
    actions: [],
  },
  {
    role: 'landmark',
    selector:
      '[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]',
    stateAttributes: ['aria-label', 'aria-labelledby'],
    apgPattern: 'landmark-regions',
    actions: [],
  },
  {
    role: 'meter',
    selector: '[role="meter"], meter',
    stateAttributes: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
    apgPattern: 'meter',
    actions: [],
  },
];
