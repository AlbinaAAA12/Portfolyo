import { useState } from 'react';
import type { CaseId, Locale } from '../../types';
import { asset } from '../../lib/assets';

const items: Array<{ id: CaseId; label: (locale: Locale) => string; compact: string; normal: string; hover: string; pressed: string }> = [
  { id: 'spirit', label: () => 'Spirit LBaaS', compact: 'aea4f.svg', normal: '1f14c.svg', hover: 'a36fb.svg', pressed: '2e13d.svg' },
  { id: 'future', label: (locale) => locale === 'ru' ? 'ИИдеи Будущего' : 'Ideas for the Future', compact: '0e3ca.svg', normal: '408ab.svg', hover: '7d776.svg', pressed: 'fcb0d.svg' },
  { id: 'mozglab', label: () => 'Mozg.lab', compact: '417e0.svg', normal: '5c3b8.svg', hover: 'fb8f9.svg', pressed: '1829f.svg' },
  { id: 'veritas', label: (locale) => locale === 'ru' ? 'Веритас' : 'Veritas', compact: '5d561.svg', normal: '1b4c5.svg', hover: '1b4c5.svg', pressed: '56b99.svg' },
];

function RailLogo({ item, state = 'default' }: { item: typeof items[number]; state?: 'default' | 'hover' | 'pressed' }) {
  const source = state === 'pressed' ? item.pressed : state === 'hover' ? item.hover : item.normal;
  return <span className={`rail-logo rail-logo--${item.id}`}><img src={asset(`figma/${source}`)} alt="" /></span>;
}

export default function CaseRail({ locale, active, onSelect }: { locale: Locale; active: CaseId; onSelect: (id: CaseId) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [latched, setLatched] = useState(false);
  const open = () => { if (!latched) setExpanded(true); };
  const close = () => { setExpanded(false); setLatched(false); };
  const navigate = (id: CaseId) => { onSelect(id); setExpanded(false); setLatched(true); };
  const activeItem = items.find((item) => item.id === active) ?? items[0];

  return <aside className={`case-rail ${expanded ? 'is-expanded' : ''}`} aria-label={locale === 'ru' ? 'Навигация по кейсам' : 'Case navigation'} onPointerEnter={open} onPointerLeave={close} onFocusCapture={open} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close(); }}>
    <button className="rail-collapsed" type="button" aria-label={locale === 'ru' ? 'Открыть навигацию по кейсам' : 'Open case navigation'} aria-expanded={expanded} onClick={() => { if (expanded) { setExpanded(false); setLatched(true); } else { setExpanded(true); setLatched(false); } }}><img src={asset(`figma/${activeItem.compact}`)} alt="" /></button>
    <div className="rail-track" aria-hidden={!expanded}>
      {items.map((item) => <button key={item.id} className={`rail-item ${item.id === active || (item.id === 'future' && active === 'outsourcing') ? 'is-active' : ''}`} type="button" title={item.label(locale)} aria-label={item.label(locale)} aria-current={item.id === active || (item.id === 'future' && active === 'outsourcing') ? 'page' : undefined} tabIndex={expanded ? 0 : -1} onClick={() => navigate(item.id)}>
        <RailLogo item={item} />
        <span className="rail-logo-state rail-logo-state--hover"><RailLogo item={item} state="hover" /></span>
        <span className="rail-logo-state rail-logo-state--pressed"><RailLogo item={item} state="pressed" /></span>
      </button>)}
    </div>
  </aside>;
}
