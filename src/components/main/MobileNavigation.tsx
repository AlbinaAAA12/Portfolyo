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
  onProjects: () => void;
  onCase: (id: CaseId) => void;
};

const projects: Array<{ id: CaseId; image: string }> = [
  { id: 'mozglab', image: 'card-mozglab-landing.png' },
  { id: 'spirit', image: '28781.png' },
  { id: 'future', image: 'card-iidei-landing.png' },
  { id: 'veritas', image: 'card-veritas-landing.png' },
];

export default function MobileNavigation({ menuOpen, onMenuOpenChange, screen, locale, setLocale, caseNames, onProjects, onCase }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const isCase = screen !== 'about';
  const switchLabel = locale === 'ru' ? 'Switch to English' : 'Переключить на русский';

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (menuOpen && !dialog.open) dialog.showModal();
    else if (!menuOpen && dialog.open) dialog.close();
  }, [menuOpen]);

  const closeAndSelect = (callback: () => void) => {
    if (dialogRef.current?.open) dialogRef.current.close();
    onMenuOpenChange(false);
    callback();
  };
  const openMenu = () => onMenuOpenChange(true);
  const localeButton = <button className="mobile-locale-control" type="button" aria-label={switchLabel} onClick={() => setLocale(locale === 'ru' ? 'en' : 'ru')}>{locale === 'ru' ? 'Рус' : 'Eng'}</button>;

  return <>
    <div className="mobile-utility-row">
      {isCase ? <><button className="mobile-back-control" type="button" onClick={() => closeAndSelect(onProjects)}>{locale === 'ru' ? 'Все кейсы' : 'All cases'}</button><span className="mobile-utility-spacer" /><button className="mobile-menu-trigger" type="button" ref={menuTriggerRef} onClick={openMenu}>{locale === 'ru' ? 'Меню' : 'Menu'}</button>{localeButton}</> : <><button className="mobile-menu-trigger" type="button" ref={menuTriggerRef} onClick={openMenu}>{locale === 'ru' ? 'Меню' : 'Menu'}</button><span className="mobile-utility-spacer" />{localeButton}</>}
    </div>
    <dialog className="mobile-navigation-dialog" ref={dialogRef} aria-label={locale === 'ru' ? 'Выбрать кейс' : 'Choose a case'} onCancel={(event) => { event.preventDefault(); onMenuOpenChange(false); }} onClose={() => { if (menuOpen) onMenuOpenChange(false); }} onClick={(event) => {
      if (event.target !== dialogRef.current) return;
      const rect = dialogRef.current?.getBoundingClientRect();
      if (rect && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) {
        onMenuOpenChange(false);
      }
    }}>
      <div className="mobile-navigation-content">
        <div className="mobile-navigation-projects" aria-label={locale === 'ru' ? 'Проекты' : 'Projects'}>
          {projects.map(({ id, image }) => <button className="mobile-navigation-project" type="button" key={id} aria-current={screen === id ? 'page' : undefined} onClick={() => closeAndSelect(() => onCase(id))}>
            <img src={asset(`figma/${image}`)} alt="" /><span>{caseNames[id]}</span>
          </button>)}
        </div>
      </div>
    </dialog>
  </>;
}
