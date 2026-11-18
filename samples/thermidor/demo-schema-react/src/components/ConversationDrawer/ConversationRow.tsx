import {useEffect, useId, useRef, useState, type FocusEvent} from 'react';
import {KebabIcon, PencilIcon, TrashIcon} from './drawer-icons.js';
import styles from './ConversationDrawer.module.css';

/** Why the drawer cannot swap the conversation while it sends a request, which would cancel it. */
export const NOT_READY = 'Available once the conversation is ready';

/** The room the menu needs below its row, or it opens upward. */
const MENU_HEIGHT = 100;

interface ConversationRowProps {
  title: string;
  current: boolean;
  /** The id of the note saying why the conversation cannot be opened now, if it cannot. */
  openBlockedBy?: string;
  /** The id of the note saying why the conversation cannot be deleted now, if it cannot. */
  deleteBlockedBy?: string;
  onOpen: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}

/**
 * A saved conversation: its title opens it, and its menu renames it in place or deletes it. A
 * rename is saved on Enter or once the field loses focus, and Escape cancels it.
 */
export function ConversationRow({
  title,
  current,
  openBlockedBy,
  deleteBlockedBy,
  onOpen,
  onRename,
  onDelete,
}: ConversationRowProps) {
  const [menu, setMenu] = useState<'below' | 'above'>();
  const [renaming, setRenaming] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const kebabRef = useRef<HTMLButtonElement>(null);
  const focusKebab = useRef(false);
  // Enter and Escape end the rename before the field blurs, which must not end it again.
  const renameEnded = useRef(false);
  const menuId = useId();

  useEffect(() => {
    if (!menu) return;
    const onPointerDown = ({target}: PointerEvent) => {
      if (target instanceof Node && !rowRef.current?.contains(target)) {
        setMenu(undefined);
      }
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [menu]);

  // The kebab is back only once the rename field is gone.
  useEffect(() => {
    if (!renaming && focusKebab.current) {
      focusKebab.current = false;
      kebabRef.current?.focus();
    }
  }, [renaming]);

  const toggleMenu = () => {
    if (menu) {
      setMenu(undefined);
      return;
    }
    const row = rowRef.current?.getBoundingClientRect();
    const drawer = rowRef.current?.closest('nav')?.getBoundingClientRect();
    const roomBelow = row && drawer ? drawer.bottom - row.bottom : Infinity;
    setMenu(roomBelow < MENU_HEIGHT ? 'above' : 'below');
  };

  const endRename = (renamed: string | undefined, returnFocus: boolean) => {
    if (renameEnded.current) return;
    renameEnded.current = true;
    const trimmed = renamed?.trim();
    if (trimmed && trimmed !== title) {
      onRename(trimmed);
    }
    focusKebab.current = returnFocus;
    setRenaming(false);
  };

  if (renaming) {
    return (
      <div className={styles.row}>
        <input
          className={styles.rename}
          aria-label="Conversation title"
          defaultValue={title}
          // oxlint-disable-next-line jsx-a11y/no-autofocus -- the rename the shopper just asked for
          autoFocus
          onFocus={(event) => event.currentTarget.select()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === 'Escape') {
              // Escape cancels the rename only, leaving the drawer open, and Enter must not reach
              // the menu button that gets the focus back.
              event.stopPropagation();
              event.preventDefault();
              endRename(event.key === 'Enter' ? event.currentTarget.value : undefined, true);
            }
          }}
          onBlur={(event) => endRename(event.currentTarget.value, false)}
        />
      </div>
    );
  }

  return (
    <div
      ref={rowRef}
      className={styles.row}
      onKeyDown={(event) => {
        if (menu && event.key === 'Escape') {
          event.stopPropagation();
          setMenu(undefined);
          kebabRef.current?.focus();
        }
      }}
      onBlur={(event: FocusEvent) => {
        const next = event.relatedTarget;
        if (menu && next instanceof Node && !rowRef.current?.contains(next)) {
          setMenu(undefined);
        }
      }}
    >
      <button
        type="button"
        className={styles.open}
        aria-current={current ? 'true' : undefined}
        aria-disabled={openBlockedBy ? true : undefined}
        aria-describedby={openBlockedBy}
        title={openBlockedBy && NOT_READY}
        onClick={() => !openBlockedBy && onOpen()}
      >
        {title}
      </button>
      <button
        ref={kebabRef}
        type="button"
        className={styles.kebab}
        aria-label={`Options for ${title}`}
        aria-expanded={menu !== undefined}
        aria-controls={menu ? menuId : undefined}
        onClick={toggleMenu}
      >
        <KebabIcon />
      </button>
      {menu && (
        <div
          id={menuId}
          role="group"
          aria-label={`Options for ${title}`}
          className={[styles.menu, menu === 'above' && styles.menuAbove].filter(Boolean).join(' ')}
        >
          <button
            type="button"
            className={styles.menuItem}
            // oxlint-disable-next-line jsx-a11y/no-autofocus -- the options the shopper just opened
            autoFocus
            onClick={() => {
              setMenu(undefined);
              renameEnded.current = false;
              setRenaming(true);
            }}
          >
            <PencilIcon />
            Rename
          </button>
          <button
            type="button"
            className={styles.menuItem}
            aria-disabled={deleteBlockedBy ? true : undefined}
            aria-describedby={deleteBlockedBy}
            title={deleteBlockedBy && NOT_READY}
            onClick={() => !deleteBlockedBy && onDelete()}
          >
            <TrashIcon />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
