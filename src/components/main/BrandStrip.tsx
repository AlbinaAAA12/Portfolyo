import type { CaseId, Locale } from '../../types';
import { asset } from '../../lib/assets';
import './BrandStrip.css';

const brands: Array<{ id: CaseId; key: string; source?: string; name: (locale: Locale) => string }> = [
  { id: 'spirit', key: 'tbank', source: '0c323', name: (locale) => locale === 'ru' ? 'Т-Банк' : 'T-Bank' },
  { id: 'spirit', key: 'spirit', name: () => 'Spirit' },
  { id: 'future', key: 'ladder', source: '35873', name: () => 'Ladder Enjoyers' },
  { id: 'mozglab', key: 'mozg', source: 'f3350', name: (locale) => locale === 'ru' ? 'Мозг.лаб' : 'Mozg.lab' },
  { id: 'veritas', key: 'veritas', source: '45b85', name: (locale) => locale === 'ru' ? 'Веритас' : 'Veritas' },
];

function label(locale: Locale, name: string) {
  return `${locale === 'ru' ? 'Открыть кейс' : 'Open case'}: ${name}`;
}

export default function BrandStrip({ locale, onCase }: { locale: Locale; onCase: (id: CaseId) => void }) {
  return <footer className="brand-strip" aria-label={locale === 'ru' ? 'Клиенты и проекты' : 'Clients and projects'}>
    {brands.map(({ id, key, source, name }) => <button className={`brand-strip__logo${key === 'spirit' ? ' brand-spirit' : ''}${key === 'veritas' ? ' veritas-brand' : ''}`} type="button" key={key} aria-label={label(locale, name(locale))} onClick={() => onCase(id)}>
      {key === 'spirit' ? <span className="brand-strip__mark"><img className="brand-strip__default" src={asset('figma/564e3.svg')} alt="" /><img className="brand-strip__hover" src={asset('figma/31715.svg')} alt="" /></span>
        : <><span className="brand-strip__mark"><img className="brand-strip__default" src={asset(`figma/${source}.svg`)} alt="" /><img className="brand-strip__hover" src={asset(`figma/brand-${key}-hover.svg`)} alt="" /></span>{key === 'veritas' && <span>{locale === 'ru' ? 'ВЕРИТАС' : 'VERITAS'}</span>}</>}
    </button>)}
  </footer>;
}
