import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, FocusEvent, MouseEvent } from 'react';
import type { CaseId, Locale } from './types';
import { asset } from './lib/assets';
import { ProjectMedia } from './components/media/ProjectMedia';
import InteractivePortrait from './components/main/InteractivePortrait';
import { NoOrphans, prepareTypography } from './lib/typography';
import PortfolioOverlays from './components/overlays/PortfolioOverlays';
import Onboarding from './components/onboarding/Onboarding';
import TestimonialSlider from './components/main/TestimonialSlider';
import CaseRail from './components/main/CaseRail';
import ProjectCollage from './components/main/ProjectCollage';

type Screen = 'about' | CaseId;
type OverlayKind = 'resume' | 'case' | null;

const caseOrder: CaseId[] = ['mozglab', 'spirit', 'future', 'veritas'];

const copy = prepareTypography({
  ru: {
    navAbout: 'Инфа', navCases: 'Кейсы', navResume: 'Резюме', aboutAria: 'Обо мне', casesAria: 'Открыть кейсы', resumeAria: 'Открыть резюме',
    greeting: 'Привет! Я продуктовый и веб дизайнер с 2+\u00a0годами опыта проектирования сложных веб-сценариев для EdTech и FinTech',
    quote: '“Lorem ipsum dolor sit amet consectetur. Pellentesque pretium ut enim at elementum. Eget tortor tempor elementum amet nisi amet vel gravida sed. Ipsum maecenas nec nunc duis morbi non. Lectus sit dolor semper bibendum diam libero.”',
    designer: 'Дизайнер', contactTelegram: 'тг', contactEmail: 'почта', profileName: 'Альбина Тимофеева', testimonialName: 'Лилия Абдуллина', soon: 'Совсем скоро, оформляю', more: 'Больше', moreSoon: 'Больше скоро', onRequest: 'По запросу',
    loading: 'Макеты проекта', togglePreview: 'Макеты', toggleDescription: 'Описание',
    cases: {
    spirit: { name: 'Spirit LBaaS', meta: 'Т-БАНК', description: 'Улучшение DevEx внутренней PaaS-платформы Т-Банка, проект NDA', tags: ['FinTech', 'PaaS', 'DevEx', 'B2B'] },
    future: { name: 'ИИдеи Будущего', meta: 'LADDER ENJOYERS • 2025', description: 'Образовательная платформа IT-сообщества. Исследовала пользовательские сценарии конкурентов и спроектировала конструктор контестов для обучения школьников программированию', secondParagraph: 'Подготовила UI-kit для frontend-разработчика и варианты интерфейса для тестирования. Среднее время создания контеста сократилось на 11,2%', tags: ['Product design', 'UX research', 'EdTech', 'B2C'] },
      mozglab: { name: 'Мозг.лаб', meta: 'МОЗГ.ЛАБ • 2026', description: 'Платформа для обучения школьников работе с ИИ. Спроектировала онбординг, конструктор курсов и кабинеты ученика, учителя и родителя для рабочего MVP', secondParagraph: 'С командой привлекла 1,8\u00a0млн\u00a0₽ на развитие продукта', tags: ['Product design', 'EdTech', 'B2C / B2B', 'Веб-платформа'] },
    veritas: { name: 'Веритас', meta: 'ВЕРИТАС • 2026', description: 'Сервис предварительной оценки самочувствия. Я спроектировала веб-приложение с анкетой, загрузкой анализов, проверкой распознанных данных и историей результатов', secondParagraph: 'Использовала ИИ для прототипирования, подготовила полный дизайн приложения и лендинга', tags: ['Product design', 'HealthTech', 'AI prototyping'] },
    },
  },
  en: {
    navAbout: 'Info', navCases: 'Case', navResume: 'Resume', aboutAria: 'About me', casesAria: 'Open cases', resumeAria: 'Open resume',
    greeting: 'Hi! I’m a product and web designer with 2+ years of experience designing complex web experiences for EdTech and FinTech',
    quote: '“Lorem ipsum dolor sit amet consectetur. Pellentesque pretium ut enim at elementum. Eget tortor tempor elementum amet nisi amet vel gravida sed. Ipsum maecenas nec nunc duis morbi non. Lectus sit dolor semper bibendum diam libero.”',
    designer: 'Designer', contactTelegram: 'Telegram', contactEmail: 'Email', profileName: 'Albina Timofeeva', testimonialName: 'Lilia Abdullina', soon: 'Coming soon — putting the case study together', more: 'More', moreSoon: 'More soon', onRequest: 'On request',
    loading: 'Project mockups', togglePreview: 'Previews', toggleDescription: 'Details',
    cases: {
    spirit: { name: 'Spirit LBaaS', meta: 'T-BANK', description: 'Improving developer experience for T-Bank’s internal PaaS platform. NDA project', tags: ['FinTech', 'PaaS', 'DevEx', 'B2B'] },
    future: { name: 'Ideas for the Future', meta: 'LADDER ENJOYERS • 2025', description: 'An educational platform for an IT community. I researched competitor user flows and designed a contest builder to teach school students programming', secondParagraph: 'I prepared a UI kit for the frontend developer and interface variants for testing. The average time to create a contest decreased by 11.2%', tags: ['Product design', 'UX research', 'EdTech', 'B2C'] },
      mozglab: { name: 'Mozg.lab', meta: 'MOZG.LAB • 2026', description: 'A platform teaching school students to work with AI. I designed onboarding, a course builder, and student, teacher, and parent dashboards for a working MVP', secondParagraph: 'Together with the team, I raised ₽1.8 million to develop the product', tags: ['Product design', 'EdTech', 'B2C / B2B', 'Web platform'] },
    veritas: { name: 'Veritas', meta: 'VERITAS • 2026', description: 'A service for a preliminary wellbeing assessment. I designed a web app with a questionnaire, lab result uploads, verification of extracted data, and a history of results', secondParagraph: 'I used AI for prototyping and prepared the complete design for the app and landing page', tags: ['Product design', 'HealthTech', 'AI prototyping'] },
    },
  },
} as const);

function Header({ locale, setLocale, screen, onNavigate, onResume }: {
  locale: Locale; setLocale: (locale: Locale) => void; screen: Screen;
  onNavigate: (screen: Screen) => void; onResume: () => void;
}) {
  const t = copy[locale];
  return <header className="topbar" aria-label={locale === 'ru' ? 'Основная навигация' : 'Main navigation'}>
    <div className={`locale-switch locale-switch--${locale}`} aria-label={locale === 'ru' ? 'Язык' : 'Language'}>
      {(['ru', 'en'] as const).map((item) => <button className={locale === item ? 'locale-option is-active' : 'locale-option'} key={item} type="button" aria-pressed={locale === item} aria-label={item === 'ru' ? 'Русский' : 'English'} onClick={() => setLocale(item)}><span className={`locale-label locale-label--${item}`}>{item === 'ru' ? 'Рус' : 'Eng'}</span></button>)}
    </div>
    <nav className="primary-nav">
      <button className={`nav-pill ${screen === 'about' ? 'is-active' : ''}`} type="button" onClick={() => onNavigate('about')} aria-label={t.aboutAria} aria-current={screen === 'about' ? 'page' : undefined}><span>{t.navAbout}</span><span className="nav-pill-icon" aria-hidden="true"><img className="nav-pill-icon-default" src={asset(screen === 'about' ? 'figma/b6393.svg' : 'figma/nav-primary-default.svg')} alt="" /><img className="nav-pill-icon-hover" src={asset('figma/nav-primary-hover.svg')} alt="" /></span></button>
      <button className={`nav-pill ${screen !== 'about' ? 'is-active' : ''}`} type="button" onClick={() => onNavigate(screen === 'about' ? caseOrder[0] : caseOrder[(caseOrder.indexOf(screen) + 1) % caseOrder.length])} aria-label={t.casesAria} aria-current={screen !== 'about' ? 'page' : undefined}><span>{t.navCases}</span><span className="nav-pill-icon" aria-hidden="true"><img className="nav-pill-icon-default" src={asset(screen === 'about' ? 'figma/nav-primary-default.svg' : 'figma/b6393.svg')} alt="" /><img className="nav-pill-icon-hover" src={asset('figma/nav-primary-hover.svg')} alt="" /></span></button>
      <button className="nav-pill" type="button" onClick={onResume} aria-label={t.resumeAria}><span>{t.navResume}</span><span className="nav-pill-icon" aria-hidden="true"><img className="nav-pill-icon-default" src={asset('figma/nav-primary-default.svg')} alt="" /><img className="nav-pill-icon-hover" src={asset('figma/nav-primary-hover.svg')} alt="" /></span></button>
    </nav>
  </header>;
}

function About({ locale, playbackEnabled, onCase }: { locale: Locale; playbackEnabled: boolean; onCase: (id: CaseId) => void }) {
  const [showProjects, setShowProjects] = useState(false);
  const t = copy[locale];
  const projects: Array<{ id: CaseId; file: string; media?: 'iidei-landing' | 'mozglab-landing' | 'veritas-landing' }> = [
    { id: 'future', file: 'card-iidei-landing.png', media: 'iidei-landing' },
    { id: 'spirit', file: '28781.png' },
    { id: 'mozglab', file: 'card-mozglab-landing.png', media: 'mozglab-landing' },
    { id: 'veritas', file: 'card-veritas-landing.png', media: 'veritas-landing' },
  ];
  return <>
    <main className={`about-layout ${showProjects ? 'is-projects' : ''}`}>
      <section className="profile-card surface">
        <div className="profile-top">
          <div className="profile-heading"><InteractivePortrait className="portrait" alt={t.profileName} playbackEnabled={playbackEnabled} /><div className="profile-identity"><h1>{t.profileName}</h1><div className="contact-links"><a href="https://t.me/Timofeeva_Albina" target="_blank" rel="noreferrer">{t.contactTelegram}</a><a href="mailto:albinatimofeeva11@gmail.com">{t.contactEmail}</a></div></div></div>
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
    media?: 'mozglab-landing' | 'mozglab-dashboard' | 'iidei-landing' | 'iidei-promo' | 'veritas-landing' | 'veritas-login';
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
    <div className="spirit-backdrop-wrap"><img className="spirit-backdrop" src={asset('figma/cdbc0.png')} alt="" /></div>
    <div className="spirit-empty-frame">
      <img src={asset('figma/spirit-empty-state.svg')} alt={locale === 'ru' ? 'Пустое состояние проекта Spirit LBaaS' : 'Spirit LBaaS project empty state'} />
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
  const labelSoon = id === 'future';
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
    <main className={`case-layout ${showPreview ? 'is-preview' : ''}`}>
      <section className="case-info surface">
        <div className="case-copy">
          <div className="case-heading-row"><div><p className="case-meta">{item.meta}</p><h1>{item.name}</h1></div>
            {hasRequestAccess ? <div className="access-status"><span className="lock-icon"><img src={asset('figma/1f4f8.svg')} alt="" /></span><span>{t.onRequest}</span></div> : <button className={`more-button ${id === 'mozglab' ? 'more-button--mozglab' : ''}`} type="button" data-hint="false" onClick={onMore} onMouseEnter={showSoon ? showTooltip : undefined} onMouseLeave={showSoon ? hideTooltip : undefined} onFocus={showSoon ? showTooltip : undefined} onBlur={showSoon ? hideTooltip : undefined} title={showSoon ? t.soon : t.more}>{labelSoon ? t.moreSoon : t.more}<img src={asset('figma/371d6.svg')} alt="" /><span className="tooltip" role="tooltip">{t.soon}</span></button>}
          </div>
          <div className={`case-description case-description--${id}`}>
            <p><NoOrphans>{item.description}</NoOrphans></p>{'secondParagraph' in item && <p><NoOrphans>{item.secondParagraph}</NoOrphans></p>}
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
