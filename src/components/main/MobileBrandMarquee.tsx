import { useEffect, useRef, useState, type FocusEvent } from 'react';
import type { CaseId, Locale } from '../../types';
import { asset } from '../../lib/assets';
import './MobileBrandMarquee.css';

function caseLabel(locale: Locale, name: string) {
  return `${locale === 'ru' ? 'Открыть кейс' : 'Open case'}: ${name}`;
}

function BrandGroup({ locale, onCase, copy = false }: { locale: Locale; onCase: (id: CaseId) => void; copy?: boolean }) {
  const tabIndex = copy ? -1 : undefined;
  return <div className="mobile-brand-marquee__group">
    <button className="mobile-brand-marquee__logo" type="button" tabIndex={tabIndex} aria-label={caseLabel(locale, locale === 'ru' ? 'Т-Банк' : 'T-Bank')} onClick={() => onCase('spirit')}>
      <span className="mobile-brand-marquee__mark"><img className="mobile-brand-marquee__default" src={asset('figma/0c323.svg')} alt="" /><img className="mobile-brand-marquee__hover" src={asset('figma/brand-tbank-hover.svg')} alt="" /></span>
    </button>
    <button className="mobile-brand-marquee__logo mobile-brand-marquee__spirit" type="button" tabIndex={tabIndex} aria-label={caseLabel(locale, 'Spirit')} onClick={() => onCase('spirit')}>
      <img className="mobile-brand-marquee__spirit-default" src={asset('figma/564e3.svg')} alt="" /><img className="mobile-brand-marquee__spirit-hover" src={asset('figma/31715.svg')} alt="" />
    </button>
    <button className="mobile-brand-marquee__logo" type="button" tabIndex={tabIndex} aria-label={caseLabel(locale, 'Ladder Enjoyers')} onClick={() => onCase('future')}>
      <span className="mobile-brand-marquee__mark"><img className="mobile-brand-marquee__default" src={asset('figma/35873.svg')} alt="" /><img className="mobile-brand-marquee__hover" src={asset('figma/brand-ladder-hover.svg')} alt="" /></span>
    </button>
    <button className="mobile-brand-marquee__logo" type="button" tabIndex={tabIndex} aria-label={caseLabel(locale, locale === 'ru' ? 'Мозг.лаб' : 'Mozg.lab')} onClick={() => onCase('mozglab')}>
      <span className="mobile-brand-marquee__mark"><img className="mobile-brand-marquee__default" src={asset('figma/f3350.svg')} alt="" /><img className="mobile-brand-marquee__hover" src={asset('figma/brand-mozg-hover.svg')} alt="" /></span>
    </button>
    <button className="mobile-brand-marquee__logo mobile-brand-marquee__veritas" type="button" tabIndex={tabIndex} aria-label={caseLabel(locale, locale === 'ru' ? 'Веритас' : 'Veritas')} onClick={() => onCase('veritas')}>
      <span className="mobile-brand-marquee__mark"><img className="mobile-brand-marquee__default" src={asset('figma/45b85.svg')} alt="" /><img className="mobile-brand-marquee__hover" src={asset('figma/brand-veritas-hover.svg')} alt="" /></span><span>{locale === 'ru' ? 'ВЕРИТАС' : 'VERITAS'}</span>
    </button>
  </div>;
}

export default function MobileBrandMarquee({ locale, onCase }: { locale: Locale; onCase: (id: CaseId) => void }) {
  const [keyboardMode, setKeyboardMode] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const focusFrameRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (focusFrameRef.current !== null) cancelAnimationFrame(focusFrameRef.current);
  }, []);

  const handleFocusCapture = (event: FocusEvent<HTMLDivElement>) => {
    if (!(event.target instanceof HTMLElement) || !event.target.matches(':focus-visible')) return;
    setKeyboardMode(true);
    const button = event.target.closest('button');
    if (!button) return;
    if (focusFrameRef.current !== null) cancelAnimationFrame(focusFrameRef.current);
    focusFrameRef.current = requestAnimationFrame(() => {
      focusFrameRef.current = null;
      const root = rootRef.current;
      if (!root || !root.contains(button)) return;
      const frameRect = root.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      if (buttonRect.right > frameRect.right - 4) {
        root.scrollLeft += buttonRect.right - (frameRect.right - 4);
      } else if (buttonRect.left < frameRect.left + 4) {
        root.scrollLeft -= frameRect.left + 4 - buttonRect.left;
      }
    });
  };

  const handleBlurCapture = (event: FocusEvent<HTMLDivElement>) => {
    const root = event.currentTarget;
    if (!(event.relatedTarget instanceof Node) || !root.contains(event.relatedTarget)) {
      if (focusFrameRef.current !== null) cancelAnimationFrame(focusFrameRef.current);
      focusFrameRef.current = null;
      setKeyboardMode(false);
      root.scrollLeft = 0;
    }
  };

  return <div ref={rootRef} className={`mobile-brand-marquee${keyboardMode ? ' mobile-brand-marquee--keyboard' : ''}`} role="group" tabIndex={0} aria-label={locale === 'ru' ? 'Клиенты и проекты' : 'Clients and projects'} onFocusCapture={handleFocusCapture} onBlurCapture={handleBlurCapture}>
    <div className="mobile-brand-marquee__track">
      <BrandGroup locale={locale} onCase={onCase} />
      <div className="mobile-brand-marquee__copy" aria-hidden="true"><BrandGroup locale={locale} onCase={onCase} copy /></div>
      <div className="mobile-brand-marquee__copy" aria-hidden="true"><BrandGroup locale={locale} onCase={onCase} copy /></div>
    </div>
  </div>;
}
