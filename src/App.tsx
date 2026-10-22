import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { CaseId, Locale } from './types';
import { asset } from './lib/assets';
import PortfolioOverlays from './components/overlays/PortfolioOverlays';
import Onboarding from './components/onboarding/Onboarding';

type Screen = 'about' | CaseId;
type OverlayKind = 'resume' | 'case' | null;

const caseOrder: CaseId[] = ['spirit', 'future', 'outsourcing', 'mozglab', 'veritas'];

const copy = {
  ru: {
    navAbout: 'Инфа', navCases: 'Кейсы', navResume: 'Резюме', aboutAria: 'Обо мне', casesAria: 'Открыть кейсы', resumeAria: 'Открыть резюме',
    greeting: 'Привет! Я продуктовый и веб дизайнер с 2+ годами опыта создания интерфейсов и проведения UX-исследований',
    quote: '“Lorem ipsum dolor sit amet consectetur. Pellentesque pretium ut enim at elementum. Eget tortor tempor elementum amet nisi amet vel gravida sed. Ipsum maecenas nec nunc duis morbi non. Lectus sit dolor semper bibendum diam libero.”',
    designer: 'Дизайнер', contactTelegram: 'тг', contactEmail: 'почта', profileName: 'Альбина Тимофеева', testimonialName: 'Лилия Абдуллина', soon: 'Совсем скоро, оформляю', more: 'Больше', moreSoon: 'Больше скоро', onRequest: 'По запросу',
    loading: 'Макеты проекта', togglePreview: 'Макеты', toggleDescription: 'Описание',
    cases: {
    spirit: { name: 'Spirit LBaaS', meta: 'Т-БАНК', description: 'Улучшение DevEx внутренней PaaS-платформы Т-Банка, проект NDA', tags: ['FinTech', 'PaaS', 'DevEx', 'B2B'] },
    future: { name: 'ИИдеи Будущего', meta: 'LADDER ENJOYERS • 2025', description: 'Лендинг для привлечения школьников к образовательным интенсивам и курсам крупнейшего IT-сообщества СФУ — Ladder Enjoyers.', secondParagraph: 'Я спроектировала одностраничный сайт для набора участников на образовательный фестиваль, благодаря которому к программе присоединились более 100 школьников из 5 школ Красноярского края.', tags: ['Лендинг', 'EdTech', 'Веб'] },
    outsourcing: { name: 'Аутсорс компания', meta: 'LADDER ENJOYERS • 2024', description: 'Здесь описание проекта: практикующий веб дизайнер с опытом создания интерфейсов и проведения UX-исследований.', secondParagraph: 'И принесённые результаты.', tags: ['Web', 'Design System', 'B2C'] },
      mozglab: { name: 'Мозг.лаб', meta: 'МОЗГ.ЛАБ • 2026', description: 'Онлайн-платформа для обучения и создания ИИ-проектов с возможностью публикации курсов, отслеживания прогресса и аналитики.', secondParagraph: 'Я создала понятный путь учебной среды для пользователя с анализом прогресса, а также спроектировала платформу, продвигающую курсы преподавателей.', tags: ['B2C', 'EdTech'] },
    veritas: { name: 'Веритас', meta: 'ВЕРИТАС • 2026', description: 'Здесь описание проекта: практикующий веб дизайнер с опытом создания интерфейсов и проведения UX-исследований.', secondParagraph: 'И принесённые результаты.', tags: ['UI дизайн', 'UX дизайн', 'Web'] },
    },
  },
  en: {
    navAbout: 'About', navCases: 'Cases', navResume: 'Resume', aboutAria: 'About me', casesAria: 'Open cases', resumeAria: 'Open resume',
    greeting: 'Hi! I’m a product and web designer with 2+ years of experience creating interfaces and conducting UX research',
    quote: '“Lorem ipsum dolor sit amet consectetur. Pellentesque pretium ut enim at elementum. Eget tortor tempor elementum amet nisi amet vel gravida sed. Ipsum maecenas nec nunc duis morbi non. Lectus sit dolor semper bibendum diam libero.”',
    designer: 'Designer', contactTelegram: 'Telegram', contactEmail: 'Email', profileName: 'Albina Timofeeva', testimonialName: 'Lilia Abdullina', soon: 'Coming soon — putting the case study together', more: 'More', moreSoon: 'More soon', onRequest: 'On request',
    loading: 'Project mockups', togglePreview: 'Previews', toggleDescription: 'Details',
    cases: {
    spirit: { name: 'Spirit LBaaS', meta: 'T-BANK', description: 'Improving developer experience for T-Bank’s internal PaaS platform. NDA project.', tags: ['FinTech', 'PaaS', 'DevEx', 'B2B'] },
    future: { name: 'Ideas for the Future', meta: 'LADDER ENJOYERS • 2025', description: 'A landing page to attract school students to educational intensives and courses from SFU’s largest IT community, Ladder Enjoyers.', secondParagraph: 'I designed a one-page site to recruit participants for an educational festival; more than 100 students from 5 schools in the Krasnoyarsk region joined the program.', tags: ['Landing page', 'EdTech', 'Web'] },
    outsourcing: { name: 'Outsourcing company', meta: 'LADDER ENJOYERS • 2024', description: 'Project description: a practicing web designer with experience creating interfaces and conducting UX research.', secondParagraph: 'And the results delivered.', tags: ['Web', 'Design System', 'B2C'] },
      mozglab: { name: 'Mozg.lab', meta: 'MOZG.LAB • 2026', description: 'An online platform for learning and creating AI projects, with course publishing, progress tracking, and analytics.', secondParagraph: 'I created a clear learning journey with progress analysis and designed a platform to promote instructors’ courses.', tags: ['B2C', 'EdTech'] },
    veritas: { name: 'Veritas', meta: 'VERITAS • 2026', description: 'Project description: a practicing web designer with experience creating interfaces and conducting UX research.', secondParagraph: 'And the results delivered.', tags: ['UI design', 'UX design', 'Web'] },
    },
  },
} as const;

function Header({ locale, setLocale, screen, onNavigate, onResume }: {
  locale: Locale; setLocale: (locale: Locale) => void; screen: Screen;
  onNavigate: (screen: Screen) => void; onResume: () => void;
}) {
  const t = copy[locale];
  return <header className="topbar" aria-label={locale === 'ru' ? 'Основная навигация' : 'Main navigation'}>
    <div className="locale-switch" aria-label={locale === 'ru' ? 'Язык' : 'Language'}>
      {(['ru', 'en'] as const).map((item) => <button className={locale === item ? 'locale-option is-active' : 'locale-option'} key={item} type="button" aria-pressed={locale === item} aria-label={item === 'ru' ? 'Русский' : 'English'} onClick={() => setLocale(item)}>{item === 'ru' ? 'Рус' : 'Eng'}</button>)}
    </div>
    <nav className="primary-nav">
      <button className={`nav-pill ${screen === 'about' ? 'is-active' : ''}`} type="button" onClick={() => onNavigate('about')} aria-label={t.aboutAria} aria-current={screen === 'about' ? 'page' : undefined}><span>{t.navAbout}</span><img src={asset(screen === 'about' ? 'figma/b6393.svg' : 'figma/d63af.svg')} alt="" /></button>
      <button className={`nav-pill ${screen !== 'about' ? 'is-active' : ''}`} type="button" onClick={() => onNavigate(screen === 'about' ? 'spirit' : caseOrder[(caseOrder.indexOf(screen) + 1) % caseOrder.length])} aria-label={t.casesAria} aria-current={screen !== 'about' ? 'page' : undefined}><span>{t.navCases}</span><img src={asset(screen === 'about' ? 'figma/d63af.svg' : 'figma/b6393.svg')} alt="" /></button>
      <button className="nav-pill nav-pill--muted" type="button" onClick={onResume} aria-label={t.resumeAria}><span>{t.navResume}</span><img src={asset('figma/d63af.svg')} alt="" /></button>
    </nav>
  </header>;
}

function CaseRail({ locale, active, onSelect }: { locale: Locale; active: CaseId; onSelect: (id: CaseId) => void }) {
  const railCases: Array<{ id: CaseId; icon: string; label: string }> = [
    { id: 'spirit', icon: '1f14c.svg', label: locale === 'ru' ? 'Spirit LBaaS' : 'Spirit LBaaS' },
    { id: 'future', icon: '408ab.svg', label: locale === 'ru' ? 'ИИдеи Будущего' : 'Ideas for the Future' },
    { id: 'mozglab', icon: '5c3b8.svg', label: locale === 'ru' ? 'Мозг.лаб' : 'Mozg.lab' },
    { id: 'veritas', icon: '1b4c5.svg', label: locale === 'ru' ? 'Веритас' : 'Veritas' },
  ];
  return <aside className="case-rail" aria-label={locale === 'ru' ? 'Навигация по кейсам' : 'Case navigation'}>
    <img className="rail-collapsed" src={asset(active === 'spirit' ? 'figma/319d8.svg' : active === 'mozglab' || active === 'veritas' ? 'figma/10dff.svg' : 'figma/52987.svg')} alt="" />
    <div className="rail-track">{railCases.map(({ id, icon, label }) => <button key={id} className={`rail-item ${id === active || (id === 'future' && active === 'outsourcing') ? 'is-active' : ''}`} type="button" title={label} aria-label={label} aria-current={id === active ? 'page' : undefined} onClick={() => onSelect(id)}><img src={asset(`figma/${icon}`)} alt="" /></button>)}</div>
  </aside>;
}

function About({ locale, onCase }: { locale: Locale; onCase: (id: CaseId) => void }) {
  const [showProjects, setShowProjects] = useState(false);
  const suppressClick = useRef(false);
  const t = copy[locale];
  const beginCardDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.dataset.dragging = 'true';
    event.currentTarget.dataset.startX = String(event.clientX);
    event.currentTarget.dataset.startY = String(event.clientY);
    event.currentTarget.style.setProperty('--drag-x', '0px');
    event.currentTarget.style.setProperty('--drag-y', '0px');
  };
  const moveCardDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.dataset.dragging !== 'true') return;
    const dx = event.clientX - Number(event.currentTarget.dataset.startX);
    const dy = event.clientY - Number(event.currentTarget.dataset.startY);
    event.currentTarget.style.setProperty('--drag-x', `${dx}px`);
    event.currentTarget.style.setProperty('--drag-y', `${dy}px`);
  };
  const endCardDrag = (event: ReactPointerEvent<HTMLButtonElement>, id: CaseId) => {
    const button = event.currentTarget;
    if (button.dataset.dragging !== 'true') return;
    const dx = event.clientX - Number(button.dataset.startX);
    const dy = event.clientY - Number(button.dataset.startY);
    const didDrag = Math.hypot(dx, dy) >= 50;
    button.dataset.dragging = 'false';
    button.style.removeProperty('--drag-x');
    button.style.removeProperty('--drag-y');
    if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
    if (didDrag) {
      suppressClick.current = true;
      window.setTimeout(() => { suppressClick.current = false; }, 0);
      onCase(id);
    }
  };
  const cancelCardDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.currentTarget.dataset.dragging = 'false';
    event.currentTarget.style.removeProperty('--drag-x');
    event.currentTarget.style.removeProperty('--drag-y');
  };
  const projects: Array<{ id: CaseId; file: string; className: string; label: string }> = [
    { id: 'future', file: 'card-iidei-landing.png', className: 'poster-future', label: t.cases.future.name },
    { id: 'spirit', file: '28781.png', className: 'poster-spirit', label: t.cases.spirit.name },
    { id: 'mozglab', file: 'card-mozglab-landing.png', className: 'poster-mozglab', label: t.cases.mozglab.name },
    { id: 'veritas', file: 'card-veritas-landing.png', className: 'poster-veritas', label: t.cases.veritas.name },
    { id: 'future', file: 'card-iidei-promo.png', className: 'poster-iidei-second', label: t.cases.future.name },
    { id: 'mozglab', file: 'card-mozglab-dashboard.png', className: 'poster-mozglab-second', label: t.cases.mozglab.name },
    { id: 'veritas', file: 'card-veritas-login.png', className: 'poster-veritas-second', label: t.cases.veritas.name },
    { id: 'outsourcing', file: 'card-outsourcing.png', className: 'poster-outsourcing', label: t.cases.outsourcing.name },
  ];
  return <>
    <main className={`about-layout ${showProjects ? 'is-projects' : ''}`}>
      <section className="profile-card surface">
        <div className="profile-top">
          <div className="profile-heading"><img className="portrait" src={asset('figma/f29c3.png')} alt={t.profileName} /><div className="profile-identity"><h1>{t.profileName}</h1><div className="contact-links"><a href="https://t.me/Timofeeva_Albina" target="_blank" rel="noreferrer">{t.contactTelegram}</a><a href="mailto:albinatimofeeva11@gmail.com">{t.contactEmail}</a></div></div></div>
          <p className="intro">{t.greeting}</p>
        </div>
        <div className="testimonial-wrap"><article className="testimonial"><p className="testimonial-quote">“Lorem ipsum dolor sit amet consectetur. <strong>Pellentesque pretium ut enim at elementum.</strong> Eget tortor tempor elementum amet nisi amet vel gravida sed. Ipsum maecenas nec nunc duis morbi non. <strong>Lectus sit dolor semper bibendum diam libero.</strong>”</p><div className="testimonial-author"><span className="testimonial-mark"><img src={asset('figma/ada21.svg')} alt="" /></span><div><strong>{t.testimonialName}</strong><span>{t.designer}</span></div></div></article><div className="pagination-dots" aria-label={locale === 'ru' ? 'Отзыв 1 из 5' : 'Testimonial 1 of 5'}><i className="current" /><i /><i /><i /><i /></div></div>
      </section>
      <section className="collage-panel" aria-label={locale === 'ru' ? 'Проекты' : 'Selected projects'}>
        <div className="poster-controls">{projects.map((project) => <button key={project.className} className={`poster-hit ${project.className}`} type="button" onPointerDown={beginCardDrag} onPointerMove={moveCardDrag} onPointerUp={(event) => endCardDrag(event, project.id)} onPointerCancel={cancelCardDrag} onClick={() => { if (suppressClick.current) { suppressClick.current = false; return; } onCase(project.id); }} aria-label={`${locale === 'ru' ? 'Открыть кейс' : 'Open case'}: ${project.label}`}><span>{project.label}<b aria-hidden="true">↗</b></span><img src={asset(`figma/${project.file}`)} alt="" /></button>)}</div>
      </section>
      <button className="about-mobile-toggle" type="button" aria-pressed={showProjects} onClick={() => setShowProjects((value) => !value)}>{showProjects ? t.navAbout : locale === 'ru' ? 'Проекты' : 'Projects'}</button>
    </main>
    <footer className="brand-strip" aria-label={locale === 'ru' ? 'Клиенты и проекты' : 'Clients and projects'}>
      <button type="button" onClick={() => onCase('spirit')} aria-label={locale === 'ru' ? 'Т-Банк' : 'T-Bank'}><img src={asset('figma/0c323.svg')} alt={locale === 'ru' ? 'Т-Банк' : 'T-Bank'} /></button>
      <button type="button" onClick={() => onCase('spirit')} aria-label="Spirit"><img src={asset('figma/4266e.svg')} alt="Spirit" /></button>
      <button type="button" onClick={() => onCase('future')} aria-label="Ladder Enjoyers"><img src={asset('figma/35873.svg')} alt="Ladder Enjoyers" /></button>
      <button type="button" onClick={() => onCase('mozglab')} aria-label={t.cases.mozglab.name}><img src={asset('figma/f3350.svg')} alt={t.cases.mozglab.name} /></button>
      <button className="veritas-brand" type="button" onClick={() => onCase('veritas')} aria-label={t.cases.veritas.name}><img src={asset('figma/45b85.svg')} alt="" /><span>{locale === 'ru' ? 'ВЕРИТАС' : 'VERITAS'}</span></button>
    </footer>
  </>;
}

function ProjectGallery({ id, locale }: { id: CaseId; locale: Locale }) {
  const t = copy[locale];
  const posters: Record<CaseId, Array<{ file: string; height: string }>> = {
    spirit: [{ file: 'cdbc0.png', height: '100%' }],
    future: [{ file: 'poster-iidei-landing.png', height: '298px' }, { file: 'poster-iidei-promo.png', height: '298px' }],
    outsourcing: [{ file: 'poster-outsourcing.png', height: '387.263px' }],
    mozglab: [{ file: 'poster-mozglab-landing.png', height: '330.791px' }, { file: 'poster-mozglab-dashboard.png', height: '273.209px' }],
    veritas: [{ file: 'poster-veritas-landing.png', height: '304.679px' }, { file: 'poster-veritas-login.png', height: '283.24px' }],
  };
  const files = posters[id];
  if (id === 'spirit') return <section className="gallery-panel gallery-panel--spirit" aria-label={locale === 'ru' ? `Макет: ${t.cases[id].name}` : `Mockup: ${t.cases[id].name}`}>
    <img className="spirit-backdrop" src={asset('figma/cdbc0.png')} alt="" />
    <div className="spirit-empty-state">
      <img className="empty-illustration" src={asset('figma/9dc51.svg')} alt="" />
      <div className="empty-copy"><strong>{locale === 'ru' ? 'Добавьте сущность' : 'Add an entity'}</strong><span>{locale === 'ru' ? 'После создания сущности вы сможете настроить ее параметры' : 'Once an entity is created, you can configure its parameters'}</span></div>
      <div className="empty-action"><span className="empty-action-icon" aria-hidden="true" />{locale === 'ru' ? 'Сущность' : 'Entity'}</div>
    </div>
    <img className="spirit-pointer" src={asset('figma/38ba5.svg')} alt="" />
  </section>;
  return <section className={`gallery-panel gallery-panel--${id}`} aria-label={locale === 'ru' ? `Макеты: ${t.cases[id].name}` : `Mockups: ${t.cases[id].name}`}>
    {files.map(({ file, height }, index) => {
      return <div className={`poster-slot poster-slot--${id}`} key={file} style={{ '--slot-height': height } as CSSProperties & Record<`--${string}`, string | number>}><img src={asset(`figma/${file}`)} alt={`${t.cases[id].name} — ${locale === 'ru' ? 'макет' : 'mockup'} ${index + 1}`} /></div>;
    })}
  </section>;
}

function CasePage({ id, locale, onMore }: { id: CaseId; locale: Locale; onMore: () => void }) {
  const t = copy[locale];
  const item = t.cases[id];
  const [showPreview, setShowPreview] = useState(false);
  const hasRequestAccess = id === 'spirit';
  const showSoon = id !== 'mozglab' && id !== 'spirit';
  const labelSoon = id === 'future' || id === 'outsourcing';
  return <>
    <main className={`case-layout ${showPreview ? 'is-preview' : ''}`}>
      <section className="case-info surface">
        <div className="case-copy">
          <div className="case-heading-row"><div><p className="case-meta">{item.meta}</p><h1>{item.name}</h1></div>
            {hasRequestAccess ? <div className="access-status"><span className="lock-icon"><img src={asset('figma/1f4f8.svg')} alt="" /></span><span>{t.onRequest}</span></div> : <button className="more-button" type="button" onClick={onMore} onMouseEnter={id === 'mozglab' ? onMore : showSoon ? (event) => event.currentTarget.dataset.hint = 'true' : undefined} onMouseLeave={showSoon ? (event) => event.currentTarget.dataset.hint = 'false' : undefined} onFocus={showSoon ? (event) => event.currentTarget.dataset.hint = 'true' : undefined} onBlur={showSoon ? (event) => event.currentTarget.dataset.hint = 'false' : undefined} title={showSoon ? t.soon : t.more}>{labelSoon ? t.moreSoon : t.more}<img src={asset('figma/371d6.svg')} alt="" /><span className="tooltip" role="tooltip">{t.soon}</span></button>}
          </div>
          <div className={`case-description case-description--${id}`}>
            {id === 'spirit' ? <p>{item.description}</p> : id === 'veritas' ? <>{[0, 1].map((index) => <p className="muted-description" key={index}>{locale === 'ru' ? <>Здесь описание проекта: <span>практикующий</span> веб дизайнер <span>с опытом создания</span> интерфейсов <span>и</span> проведения UX-исследований.<br /><span>И принесённые</span> результаты.</> : <>Project description: <span>a practicing</span> web designer <span>with experience creating</span> interfaces <span>and</span> conducting UX research.<br /><span>And the results delivered.</span></>}</p>)}</> : <><p>{item.description}</p>{'secondParagraph' in item && <p>{item.secondParagraph}</p>}</>}
          </div>
        </div>
        <div className="tag-list">{item.tags.map((tag) => <span className="tag" key={tag}><span>{tag}</span></span>)}</div>
      </section>
      <ProjectGallery id={id} locale={locale} />
      <div className="case-mobile-toggle" aria-label={locale === 'ru' ? 'Вид кейса' : 'Case view'}>
        <button className={!showPreview ? 'selected' : ''} type="button" aria-pressed={!showPreview} onClick={() => setShowPreview(false)}>{t.toggleDescription}</button>
        <button className={showPreview ? 'selected' : ''} type="button" aria-pressed={showPreview} onClick={() => setShowPreview(true)}>{t.togglePreview}</button>
      </div>
    </main>
    {(id === 'future' || id === 'outsourcing') && <div className="case-switcher" aria-label={locale === 'ru' ? 'Переключить кейс' : 'Switch case'}><button className={id === 'future' ? 'selected' : ''} type="button" aria-label={locale === 'ru' ? 'ИИдеи Будущего' : 'Ideas for the Future'} onClick={() => window.dispatchEvent(new CustomEvent('portfolio-case', { detail: 'future' }))} /><button className={id === 'outsourcing' ? 'selected' : ''} type="button" aria-label={locale === 'ru' ? 'Аутсорс компания' : 'Outsourcing company'} onClick={() => window.dispatchEvent(new CustomEvent('portfolio-case', { detail: 'outsourcing' }))} /></div>}
  </>;
}

export default function App() {
  const [locale, setLocale] = useState<Locale>('ru');
  const [screen, setScreen] = useState<Screen>('about');
  const [overlay, setOverlay] = useState<OverlayKind>(null);
  const [onboarding, setOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false;
    try { return !window.localStorage.getItem('portfolio-onboarding-seen'); } catch { return true; }
  });
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = locale === 'ru' ? 'Альбина Тимофеева — портфолио' : 'Albina Timofeeva — Portfolio';
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = locale === 'ru'
      ? 'Портфолио Альбины Тимофеевой — продуктовый и веб-дизайнер.'
      : 'Portfolio of Albina Timofeeva, product and web designer.';
  }, [locale]);
  useEffect(() => {
    const changeCase = (event: Event) => setScreen((event as CustomEvent<CaseId>).detail);
    window.addEventListener('portfolio-case', changeCase);
    return () => window.removeEventListener('portfolio-case', changeCase);
  }, []);
  const completeOnboarding = () => {
    try { window.localStorage.setItem('portfolio-onboarding-seen', 'true'); } catch { /* The current session still completes onboarding. */ }
    setOnboarding(false);
  };
  return <div className="app-shell" lang={locale}>
    <div className="app-content">
      <Header locale={locale} setLocale={setLocale} screen={screen} onNavigate={setScreen} onResume={() => setOverlay('resume')} />
      {screen === 'about' ? <About locale={locale} onCase={setScreen} /> : <CasePage key={screen} id={screen} locale={locale} onMore={() => screen === 'mozglab' ? setOverlay('case') : undefined} />}
    </div>
    {screen !== 'about' && <CaseRail locale={locale} active={screen} onSelect={setScreen} />}
    <PortfolioOverlays kind={overlay} locale={locale} onClose={() => setOverlay(null)} />
    {onboarding && <Onboarding locale={locale} onComplete={completeOnboarding} />}
  </div>;
}
