import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, FocusEvent, MouseEvent } from 'react';
import type { CaseId, Locale } from './types';
import { asset } from './lib/assets';
import { ProjectMedia } from './components/media/ProjectMedia';
import { useSwipe } from './lib/useSwipe';
import { NoOrphans, prepareTypography } from './lib/typography';
import PortfolioOverlays from './components/overlays/PortfolioOverlays';
import Onboarding from './components/onboarding/Onboarding';
import TestimonialSlider from './components/main/TestimonialSlider';
import CaseRail from './components/main/CaseRail';
import ProjectCollage from './components/main/ProjectCollage';

type Screen = 'about' | CaseId;
type OverlayKind = 'resume' | 'case' | null;

const caseOrder: CaseId[] = ['spirit', 'future', 'outsourcing', 'mozglab', 'veritas'];

const copy = prepareTypography({
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
} as const);

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

function About({ locale, playbackEnabled, onCase }: { locale: Locale; playbackEnabled: boolean; onCase: (id: CaseId) => void }) {
  const [showProjects, setShowProjects] = useState(false);
  const t = copy[locale];
  const projects: Array<{ id: CaseId; file: string; media?: 'iidei-landing' | 'mozglab-landing' | 'veritas-landing' | 'outsourcing' }> = [
    { id: 'future', file: 'card-iidei-landing.png', media: 'iidei-landing' },
    { id: 'spirit', file: '28781.png' },
    { id: 'mozglab', file: 'card-mozglab-landing.png', media: 'mozglab-landing' },
    { id: 'veritas', file: 'card-veritas-landing.png', media: 'veritas-landing' },
    { id: 'outsourcing', file: 'card-outsourcing.png', media: 'outsourcing' },
  ];
  return <>
    <main className={`about-layout ${showProjects ? 'is-projects' : ''}`}>
      <section className="profile-card surface">
        <div className="profile-top">
          <div className="profile-heading"><ProjectMedia media="portrait" poster="figma/f29c3.png" className="portrait" alt={t.profileName} playbackEnabled={playbackEnabled} /><div className="profile-identity"><h1>{t.profileName}</h1><div className="contact-links"><a href="https://t.me/Timofeeva_Albina" target="_blank" rel="noreferrer">{t.contactTelegram}</a><a href="mailto:albinatimofeeva11@gmail.com">{t.contactEmail}</a></div></div></div>
          <p className="intro"><NoOrphans>{t.greeting}</NoOrphans></p>
        </div>
        <TestimonialSlider locale={locale} name={t.testimonialName} />
      </section>
      <ProjectCollage projects={projects} locale={locale} caseName={(id) => t.cases[id].name} onCase={onCase} playbackEnabled={playbackEnabled} />
      <button className="about-mobile-toggle" type="button" aria-pressed={showProjects} onClick={() => setShowProjects((value) => !value)}>{showProjects ? t.navAbout : locale === 'ru' ? 'Проекты' : 'Projects'}</button>
    </main>
    <footer className="brand-strip" aria-label={locale === 'ru' ? 'Клиенты и проекты' : 'Clients and projects'}>
      <div><img src={asset('figma/0c323.svg')} alt={locale === 'ru' ? 'Т-Банк' : 'T-Bank'} /></div>
      <div className="brand-spirit"><img className="brand-spirit-default" src={asset('figma/564e3.svg')} alt="Spirit" /><img className="brand-spirit-hover" src={asset('figma/31715.svg')} alt="" /></div>
      <div><img src={asset('figma/35873.svg')} alt="Ladder Enjoyers" /></div>
      <div><img src={asset('figma/f3350.svg')} alt={t.cases.mozglab.name} /></div>
      <div className="veritas-brand"><img src={asset('figma/45b85.svg')} alt="" /><span>{locale === 'ru' ? 'ВЕРИТАС' : 'VERITAS'}</span></div>
    </footer>
  </>;
}

function ProjectGallery({ id, locale }: { id: CaseId; locale: Locale }) {
  const t = copy[locale];
  const posters: Record<CaseId, Array<{
    file: string;
    media?: 'mozglab-landing' | 'mozglab-dashboard' | 'iidei-landing' | 'iidei-promo' | 'veritas-landing' | 'veritas-login' | 'outsourcing';
    height: string;
    fit: 'fill' | 'crop';
    stroke: 'rgba(32,33,36,.12)' | 'rgba(0,16,36,.12)';
    background?: string;
    crop?: { sy: number; ty: number };
  }>> = {
    spirit: [{ file: 'cdbc0.png', height: '100%', fit: 'fill', stroke: 'rgba(32,33,36,.12)' }],
    future: [
      { file: 'card-iidei-landing.png', media: 'iidei-landing', height: '298px', fit: 'fill', stroke: 'rgba(32,33,36,.12)' },
      { file: 'card-iidei-promo.png', media: 'iidei-promo', height: '298px', fit: 'crop', stroke: 'rgba(32,33,36,.12)', crop: { sy: 1.0000003576278687, ty: -0.00000020793295618659613 } },
    ],
    outsourcing: [{ file: 'card-outsourcing.png', media: 'outsourcing', height: '387.263px', fit: 'crop', stroke: 'rgba(32,33,36,.12)', crop: { sy: 1.0000003576278687, ty: -0.00000020793295618659613 } }],
    mozglab: [
      { file: 'card-mozglab-landing.png', media: 'mozglab-landing', height: '330.791px', fit: 'crop', stroke: 'rgba(32,33,36,.12)', crop: { sy: 0.9515335559844971, ty: 0.03059546835720539 } },
      { file: 'card-mozglab-dashboard.png', media: 'mozglab-dashboard', height: '273.209px', fit: 'fill', stroke: 'rgba(0,16,36,.12)', background: '#0d0d11' },
    ],
    veritas: [
      { file: 'card-veritas-landing.png', media: 'veritas-landing', height: '304.679px', fit: 'crop', stroke: 'rgba(32,33,36,.12)', background: '#f1f1f1', crop: { sy: 1.0694719552993774, ty: -0.034735970199108124 } },
      { file: 'card-veritas-login.png', media: 'veritas-login', height: '283.24px', fit: 'crop', stroke: 'rgba(0,16,36,.12)', background: '#f1f1f1', crop: { sy: 1.000000238418579, ty: 0 } },
    ],
  };
  const files = posters[id];
  if (id === 'spirit') return <section className="gallery-panel gallery-panel--spirit" aria-label={locale === 'ru' ? `Макет: ${t.cases[id].name}` : `Mockup: ${t.cases[id].name}`}>
    <img className="spirit-backdrop" src={asset('figma/cdbc0.png')} alt="" />
    <div className="spirit-empty-frame">
      <img src={asset('figma/spirit-empty-state.png')} alt={locale === 'ru' ? 'Пустое состояние проекта Spirit LBaaS' : 'Spirit LBaaS project empty state'} />
    </div>
  </section>;
  return <section className={`gallery-panel gallery-panel--${id}`} aria-label={locale === 'ru' ? `Макеты: ${t.cases[id].name}` : `Mockups: ${t.cases[id].name}`}>
    {files.map(({ file, height, fit, stroke, background, crop }, index) => {
      const slotStyle = {
        '--slot-height': height,
        '--media-stroke': stroke,
        '--media-background': background ?? '#fff',
        '--video-height': crop ? `${100 / crop.sy}%` : '100%',
        '--video-top': crop ? `${-100 * crop.ty / crop.sy}%` : '0%',
      } as CSSProperties & Record<`--${string}`, string | number>;
      return <div className={`poster-slot poster-slot--${id}`} data-fit={fit} key={file} style={slotStyle}><ProjectMedia media={posters[id][index].media!} poster={`figma/${file}`} alt={`${t.cases[id].name} — ${locale === 'ru' ? 'макет' : 'mockup'} ${index + 1}`} /></div>;
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
  const swipe = useSwipe({
    onSwipeLeft: id === 'future' ? () => window.dispatchEvent(new CustomEvent('portfolio-case', { detail: 'outsourcing' })) : undefined,
    onSwipeRight: id === 'outsourcing' ? () => window.dispatchEvent(new CustomEvent('portfolio-case', { detail: 'future' })) : undefined,
  });
  const showTooltip = (event: MouseEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>) => {
    event.currentTarget.dataset.hint = 'true';
    const button = event.currentTarget;
    const tooltip = button.querySelector<HTMLElement>('.tooltip');
    if (window.innerWidth > 600 || !tooltip) return;
    const bounds = button.getBoundingClientRect();
    const center = bounds.left + bounds.width / 2;
    const maxWidth = 2 * Math.max(0, Math.min(center - 12, window.innerWidth - 12 - center));
    tooltip.style.setProperty('--tooltip-max-width', `${maxWidth}px`);
  };
  const hideTooltip = (event: MouseEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>) => {
    event.currentTarget.dataset.hint = 'false';
    event.currentTarget.querySelector<HTMLElement>('.tooltip')?.style.removeProperty('--tooltip-max-width');
  };
  return <>
    <main className={`case-layout ${showPreview ? 'is-preview' : ''}`} {...swipe}>
      <section className="case-info surface">
        <div className="case-copy">
          <div className="case-heading-row"><div><p className="case-meta">{item.meta}</p><h1>{item.name}</h1></div>
            {hasRequestAccess ? <div className="access-status"><span className="lock-icon"><img src={asset('figma/1f4f8.svg')} alt="" /></span><span>{t.onRequest}</span></div> : <button className={`more-button ${id === 'mozglab' ? 'more-button--mozglab' : ''}`} type="button" data-hint="false" onClick={onMore} onMouseEnter={showSoon ? showTooltip : undefined} onMouseLeave={showSoon ? hideTooltip : undefined} onFocus={showSoon ? showTooltip : undefined} onBlur={showSoon ? hideTooltip : undefined} title={showSoon ? t.soon : t.more}>{labelSoon ? t.moreSoon : t.more}<img src={asset('figma/371d6.svg')} alt="" /><span className="tooltip" role="tooltip">{t.soon}</span></button>}
          </div>
          <div className={`case-description case-description--${id}`}>
            {id === 'spirit' ? <p><NoOrphans>{item.description}</NoOrphans></p> : id === 'veritas' ? <>{[0, 1].map((index) => <p className="muted-description" key={index}><NoOrphans>{locale === 'ru' ? <>Здесь описание проекта: <span>практикующий</span> веб дизайнер <span>с опытом создания</span> интерфейсов <span>и</span> проведения UX-исследований.<br /><span>И принесённые</span> результаты.</> : <>Project description: <span>a practicing</span> web designer <span>with experience creating</span> interfaces <span>and</span> conducting UX research.<br /><span>And the results delivered.</span></>}</NoOrphans></p>)}</> : <><p><NoOrphans>{item.description}</NoOrphans></p>{'secondParagraph' in item && <p><NoOrphans>{item.secondParagraph}</NoOrphans></p>}</>}
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
  const [onboarding, setOnboarding] = useState(true);
  const [sceneScale, setSceneScale] = useState(1);
  const viewportRef = useRef<HTMLDivElement>(null);
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
  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      const height = entry.contentRect.height;
      setSceneScale(width <= 600 ? 1 : Math.min(1, width / 1280, height / 832));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div className="scene-viewport" ref={viewportRef} style={{ '--scene-scale': sceneScale } as CSSProperties}>
    <div className="app-shell" lang={locale}>
    <div className="app-content">
      <Header locale={locale} setLocale={setLocale} screen={screen} onNavigate={setScreen} onResume={() => setOverlay('resume')} />
      {screen === 'about' ? <About locale={locale} playbackEnabled={!onboarding} onCase={setScreen} /> : <CasePage key={screen} id={screen} locale={locale} onMore={() => screen === 'mozglab' ? setOverlay('case') : undefined} />}
    </div>
    {screen !== 'about' && <CaseRail locale={locale} active={screen} onSelect={setScreen} />}
    <PortfolioOverlays kind={overlay} locale={locale} onClose={() => setOverlay(null)} />
    {onboarding && <Onboarding locale={locale} onComplete={() => setOnboarding(false)} />}
    </div>
  </div>;
}
