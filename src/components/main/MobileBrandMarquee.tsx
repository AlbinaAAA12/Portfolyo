import type { Locale } from '../../types';
import { asset } from '../../lib/assets';
import './MobileBrandMarquee.css';

function BrandGroup({ locale }: { locale: Locale }) {
  return <div className="mobile-brand-marquee__group">
    <div className="mobile-brand-marquee__logo"><img src={asset('figma/0c323.svg')} alt={locale === 'ru' ? 'Т-Банк' : 'T-Bank'} /></div>
    <div className="mobile-brand-marquee__logo mobile-brand-marquee__spirit"><img className="mobile-brand-marquee__spirit-default" src={asset('figma/564e3.svg')} alt="Spirit" /><img className="mobile-brand-marquee__spirit-hover" src={asset('figma/31715.svg')} alt="" /></div>
    <div className="mobile-brand-marquee__logo"><img src={asset('figma/35873.svg')} alt="Ladder Enjoyers" /></div>
    <div className="mobile-brand-marquee__logo"><img src={asset('figma/f3350.svg')} alt={locale === 'ru' ? 'Мозг.лаб' : 'Mozg.lab'} /></div>
    <div className="mobile-brand-marquee__logo mobile-brand-marquee__veritas"><img src={asset('figma/45b85.svg')} alt="" /><span>{locale === 'ru' ? 'ВЕРИТАС' : 'VERITAS'}</span></div>
  </div>;
}

export default function MobileBrandMarquee({ locale }: { locale: Locale }) {
  return <div className="mobile-brand-marquee" role="group" tabIndex={0} aria-label={locale === 'ru' ? 'Клиенты и проекты' : 'Clients and projects'}>
    <div className="mobile-brand-marquee__track">
      <BrandGroup locale={locale} />
      <div className="mobile-brand-marquee__copy" aria-hidden="true"><BrandGroup locale={locale} /></div>
      <div className="mobile-brand-marquee__copy" aria-hidden="true"><BrandGroup locale={locale} /></div>
    </div>
  </div>;
}
