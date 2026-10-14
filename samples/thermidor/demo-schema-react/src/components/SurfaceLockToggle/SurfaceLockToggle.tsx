import {useCallback, useState} from 'react';
import styles from './SurfaceLockToggle.module.css';

const PARAM = 'lockSurfaces';

/** On unless the URL has `?lockSurfaces=off`, and kept in the URL so a reload keeps the choice. */
export function useSurfaceLockSetting(): [boolean, (enabled: boolean) => void] {
  const [enabled, setEnabled] = useState(
    () => new URLSearchParams(window.location.search).get(PARAM) !== 'off'
  );
  const update = useCallback((next: boolean) => {
    const url = new URL(window.location.href);
    if (next) {
      url.searchParams.delete(PARAM);
    } else {
      url.searchParams.set(PARAM, 'off');
    }
    window.history.replaceState(window.history.state, '', url);
    setEnabled(next);
  }, []);
  return [enabled, update];
}

interface SurfaceLockToggleProps {
  checked: boolean;
  onChange: (enabled: boolean) => void;
  locked: boolean;
}

export function SurfaceLockToggle({checked, onChange, locked}: SurfaceLockToggleProps) {
  return (
    <div className={styles.toggle}>
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        Lock surfaces while a request is in flight
      </label>
      <span className={locked ? styles.busy : styles.idle} aria-live="polite">
        {locked ? 'Locked' : 'Idle'}
      </span>
    </div>
  );
}
