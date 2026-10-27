import { useEffect, useRef } from 'react';
import type { CaseId, Locale } from '../../types';
import { asset } from '../../lib/assets';
import './MobileNavigation.css';

type Screen = 'about' | CaseId;
type Props = {
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  screen: Screen;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  caseNames: Record<CaseId, string>;
  onAbout: () => void;
  onProjects: () => void;
  onCase: (id: CaseId) => void;
  onResume: () => void;
};

const projects: Array<{ id: CaseId; image: string }> = [
  { id: 'mozglab', image: 'card-mozglab-landing.png' },
  { id: 'spirit', image: '28781.png' },
  { id: 'future', image: 'card-iidei-landing.png' },
  { id: 'veritas', image: 'card-veritas-landing.png' },
];

export default function MobileNavigation({ menuOpen, onMenuOpenChange, screen, locale, setLocale, caseNames, onAbout, onProjects, onCase, onResume }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const isCase = screen !== 'about';
  const switchLabel = locale === 'ru' ? 'Switch to English' : 'Переключить на русский';
  const closeText = locale === 'ru' ? 'Закрыть' : 'Close';

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (menuOpen && !dialog.open) dialog.showModal();
    else if (!menuOpen && dialog.open) dialog.close();
  }, [menuOpen]);

  const closeAndSelect = (callback: () => void, focusMenuTrigger = false) => {
    onMenuOpenChange(false);
    if (focusMenuTrigger) menuTriggerRef.current?.focus({ preventScroll: true });
    callback();
  };
  const openMenu = () => onMenuOpenChange(true);
  const localeButton = <button className="mobile-locale-control" type="button" aria-label={switchLabel} onClick={() => setLocale(locale === 'ru' ? 'en' : 'ru')}>{locale === 'ru' ? 'Рус' : 'Eng'}</button>;

  return <>
    <div className="mobile-utility-row">
      {isCase ? <><button className="mobile-back-control" type="button" onClick={() => closeAndSelect(onProjects)}>{locale === 'ru' ? 'Все кейсы' : 'All cases'}</button><span className="mobile-utility-spacer" /><button className="mobile-menu-trigger" type="button" ref={menuTriggerRef} onClick={openMenu}>{locale === 'ru' ? 'Меню' : 'Menu'}</button>{localeButton}</> : <><button className="mobile-menu-trigger" type="button" ref={menuTriggerRef} onClick={openMenu}>{locale === 'ru' ? 'Меню' : 'Menu'}</button><span className="mobile-utility-spacer" />{localeButton}</>}
    </div>
    <dialog className="mobile-navigation-dialog" ref={dialogRef} aria-labelledby="mobile-navigation-title" onCancel={(event) => { event.preventDefault(); onMenuOpenChange(false); }} onClose={() => { if (menuOpen) onMenuOpenChange(false); }} onClick={(event) => { if (event.target === dialogRef.current) onMenuOpenChange(false); }}>
      <div className="mobile-navigation-content">
        <div className="mobile-navigation-heading"><h2 id="mobile-navigation-title">{locale === 'ru' ? 'Меню' : 'Menu'}</h2><button className="mobile-navigation-close" type="button" onClick={() => onMenuOpenChange(false)}>{closeText}</button></div>
        <nav className="mobile-navigation-secondary" aria-label={locale === 'ru' ? 'Разделы' : 'Sections'}>
          <button type="button" aria-current={screen === 'about' ? 'page' : undefined} onClick={() => closeAndSelect(onAbout)}>{locale === 'ru' ? 'Обо мне' : 'About'}</button>
          <button type="button" aria-current={screen !== 'about' ? 'page' : undefined} onClick={() => closeAndSelect(onProjects)}>{locale === 'ru' ? 'Кейсы' : 'Projects'}</button>
          <button type="button" onClick={() => closeAndSelect(onResume, true)}>{locale === 'ru' ? 'Резюме' : 'Resume'}</button>
        </nav>
        <div className="mobile-navigation-projects" aria-label={locale === 'ru' ? 'Проекты' : 'Projects'}>
          {projects.map(({ id, image }) => <button className="mobile-navigation-project" type="button" key={id} aria-current={screen === id ? 'page' : undefined} onClick={() => closeAndSelect(() => onCase(id))}>
            <img src={asset(`figma/${image}`)} alt="" /><span>{caseNames[id]}</span>
          </button>)}
        </div>
        <div className="mobile-navigation-locale" aria-label={locale === 'ru' ? 'Язык' : 'Language'}>
          <button type="button" aria-pressed={locale === 'ru'} onClick={() => setLocale('ru')}>Рус</button>
          <button type="button" aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>Eng</button>
        </div>
        <div className="mobile-navigation-contacts"><a href="https://t.me/Timofeeva_Albina" target="_blank" rel="noreferrer">{locale === 'ru' ? 'тг' : 'telegram'}</a><a href="mailto:albinatimofeeva11@gmail.com">{locale === 'ru' ? 'почта' : 'email'}</a></div>
      </div>
    </dialog>
  </>;
}
