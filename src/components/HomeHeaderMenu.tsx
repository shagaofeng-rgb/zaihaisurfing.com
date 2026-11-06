'use client';

import {CaretDownIcon, DotsThreeIcon} from '@phosphor-icons/react';
import {useId, useRef, useState} from 'react';
import {Link} from '@/i18n/navigation';

type MenuItem = {href: string; label: string};

export default function HomeHeaderMenu({label, items, compact = false}: {label: string; items: MenuItem[]; compact?: boolean}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  return (
    <div
      className="operations-only operations-header-menu"
      onPointerEnter={(event) => { if (!compact && event.pointerType === 'mouse') setOpen(true); }}
      onPointerLeave={(event) => { if (!compact && event.pointerType === 'mouse') setOpen(false); }}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          setOpen(false);
          buttonRef.current?.focus();
        }
      }}
    >
      <button
        className="operations-header-trigger"
        ref={buttonRef}
        type="button"
        aria-label={compact ? label : undefined}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={(event) => {
          if (!compact && event.detail > 0 && window.matchMedia('(hover: hover)').matches) setOpen(true);
          else setOpen((previous) => !previous);
        }}
      >
        {compact ? <DotsThreeIcon size={21} weight="bold" aria-hidden="true" /> : <>{label}<CaretDownIcon size={12} weight="bold" aria-hidden="true" /></>}
      </button>
      <div className="operations-header-panel" id={panelId} hidden={!open}>
        {items.map(({href, label: itemLabel}) => href.startsWith('/account') ? (
          <a key={href} href={href} onClick={() => setOpen(false)}>{itemLabel}</a>
        ) : (
          <Link key={href} href={href} prefetch={false} onClick={() => setOpen(false)}>{itemLabel}</Link>
        ))}
      </div>
    </div>
  );
}
