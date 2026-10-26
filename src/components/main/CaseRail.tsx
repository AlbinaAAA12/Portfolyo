import { useState } from 'react';
import type { CaseId, Locale } from '../../types';
import { asset } from '../../lib/assets';
import './CaseRail.css';

type RailState = 'default' | 'hover' | 'pressed';

const items: Array<{ id: CaseId; label: (locale: Locale) => string; compact: string; normal: string; hover: string; pressed: string }> = [
  { id: 'mozglab', label: () => 'Mozg.lab', compact: 'aea4f.svg', normal: '5c3b8.svg', hover: '97059.svg', pressed: 'af5df.svg' },
  { id: 'spirit', label: () => 'Spirit LBaaS', compact: '0e3ca.svg', normal: '1f14c.svg', hover: '2e13d.svg', pressed: '2e13d.svg' },
  { id: 'future', label: (locale) => locale === 'ru' ? 'ИИдеи Будущего' : 'Ideas for the Future', compact: '417e0.svg', normal: '408ab.svg', hover: 'fcb0d.svg', pressed: 'fcb0d.svg' },
  { id: 'veritas', label: (locale) => locale === 'ru' ? 'Веритас' : 'Veritas', compact: '5d561.svg', normal: '1b4c5.svg', hover: '56b99.svg', pressed: '56b99.svg' },
];

function RailLogo({ item, state = 'default' }: { item: typeof items[number]; state?: RailState }) {
  const source = state === 'pressed' ? item.pressed : state === 'hover' ? item.hover : item.normal;
  return <span className={`project-rail__logo project-rail__logo--${item.id} project-rail__logo--${state}`}><img src={asset(`figma/${source}`)} alt="" /></span>;
}

export default function CaseRail({ locale, active, onSelect }: { locale: Locale; active: CaseId; onSelect: (id: CaseId) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [latched, setLatched] = useState(false);
  const open = () => { if (!latched) setExpanded(true); };
  const close = () => { setExpanded(false); setLatched(false); };
  const navigate = (id: CaseId, button: HTMLButtonElement) => {
    onSelect(id);
    setExpanded(false);
    setLatched(true);
    requestAnimationFrame(() => button.closest('.project-rail')?.querySelector<HTMLButtonElement>('.project-rail__compact')?.focus());
  };
  const isCurrent = (id: CaseId) => id === active;
  const activeItem = items.find((item) => item.id === active) ?? items[0];

  return <aside
    className={`project-rail${expanded ? ' project-rail--expanded' : ''}`}
    aria-label={locale === 'ru' ? 'Навигация по кейсам' : 'Case navigation'}
    onPointerEnter={(event) => { if (event.pointerType === 'mouse') open(); }}
    onPointerLeave={(event) => { if (event.pointerType === 'mouse') close(); }}
    onFocusCapture={(event) => { if (!(event.target instanceof HTMLButtonElement && event.target.classList.contains('project-rail__compact'))) open(); }}
    onBlurCapture={(event) => {
      const rail = event.currentTarget;
      requestAnimationFrame(() => {
        if (!rail.contains(document.activeElement)) close();
      });
    }}
    onKeyDown={(event) => { if (event.key === 'Escape') { const rail = event.currentTarget; close(); requestAnimationFrame(() => rail.querySelector<HTMLButtonElement>('.project-rail__compact')?.focus()); } }}
  >
    <button className="project-rail__compact" type="button" aria-label={locale === 'ru' ? 'Открыть навигацию по кейсам' : 'Open case navigation'} aria-expanded={expanded} onClick={(event) => { setExpanded(true); setLatched(false); const rail = event.currentTarget.closest('.project-rail'); requestAnimationFrame(() => rail?.querySelector<HTMLButtonElement>('.project-rail__item')?.focus()); }}>
      <img src={asset(`figma/${activeItem.compact}`)} alt="" />
    </button>
    <div className="project-rail__panel" aria-hidden={!expanded}>
      {items.map((item) => <button key={item.id} className={`project-rail__item${isCurrent(item.id) ? ' is-current' : ''}`} type="button" title={item.label(locale)} aria-label={item.label(locale)} aria-current={isCurrent(item.id) ? 'page' : undefined} tabIndex={expanded ? 0 : -1} onClick={(event) => navigate(item.id, event.currentTarget)}>
        <RailLogo item={item} />
        <RailLogo item={item} state="hover" />
        <RailLogo item={item} state="pressed" />
      </button>)}
    </div>
  </aside>;
}
