import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import type { Locale } from '../../types';
import { asset } from '../../lib/assets';
import { useSwipe } from '../../lib/useSwipe';
import { NoOrphans, prepareTypography } from '../../lib/typography';
import { ResumeArtwork } from './ResumeArtwork';
import './overlays.css';

type Props = { kind: 'resume' | 'case' | null; locale: Locale; onClose: () => void };

const resumeText = {
  ru: {
    name: 'Альбина Тимофеева', title: 'Продуктовый дизайнер', role: 'Роль', stack: 'Стек',
    download: 'Скачать', pdfTooltip: 'PDF скоро появится', experience: 'Опыт работы',
    languages: 'Языки', about: 'Обо мне', degree: 'Бакалавр 2025–2029', university: 'Гуманитарный институт, Сибирский федеральный университет',
    specialty: 'Прикладная информатика в искусстве и интерактивных медиа', english: 'Английский — B2', russian: 'Русский — родной',
    aboutText: 'Я продуктовый дизайнер с опытом более двух лет. Работала с B2C- и B2B-продуктами в FinTech, EdTech и MedTech. Имею опыт полного цикла разработки веб-интерфейсов: от исследования аудитории и проектирования User Flow до подготовки макетов к вёрстке и создания UI Kit. Регулярно участвую в продуктовых хакатонах и кейс-чемпионатах всероссийского уровня',
    months3: '3 месяца', months6: '6 месяцев', months17: '1 год 5 месяцев',
    jobs: [
      { period: 'Июль 2026 — Сентябрь 2026', company: 'Т-Банк · Spirit', intro: 'Работала в Spirit — внутренней PaaS-платформе Т-Банка для разработчиков, над фичами и повышением DevEx по LBaaS', bullets: ['Спроектировала 5 фич для LBaaS, устранив ручные операции и разрывы контекста в workflow разработчиков', 'Разработала 3 новых гайда в дизайн-систему Beaver, обеспечив консистентность интерфейсов в инженерных продуктах', 'Сформулировала 2 сложных user flow в создании маршрутов, что повысило скорость работы инженеров с платформой'], role: 'Продуктовый дизайнер', tags: ['Figma', 'Jira', 'Confluence', 'Scrum', 'User Story', 'JTBD', 'CJM', 'IA', 'User Flow'] },
      { period: 'Ноябрь 2025 — Апрель 2026', company: 'Мозг.лаб', intro: 'На роли ведущего дизайнера создала интерфейс EdTech-платформы для обучения школьников использованию нейросетей', bullets: ['Спроектировала конструктор курсов на платформе. Провела A/B-тестирование функционала, смогла снизить среднее время создания курса на 20%', 'Создала обучающий wizard для учеников, уменьшив bounce rate на 26%', 'Подготовила презентацию для инвесторов, финальный питч позволил привлечь 1,8 млн рублей инвестиций на платформу'], role: 'Ведущий продуктовый дизайнер', tags: ['Figma', 'Framer', 'Miro', 'GPT', 'JTBD', 'CJM', 'IA', 'User Flow', 'User Story', 'Kanban', 'GPT', 'Codex'] },
      { period: 'Июнь 2024 — Октябрь 2025', company: 'LadderEnjoyers', intro: 'На позиции продуктового дизайнера участвовала в разработке B2C-платформы по обучению школьников программированию. Работала над модулем конструктора контестов и существенно повысила продуктовые метрики модуля', bullets: ['Провела детальный разбор User Flow на платформах конкурентов. Подготовила детальный питчборд с обзором ключевых решений в сфере', 'Сформулировала пользовательский путь для конструктора контестов. Подготовила детальный UI-kit для frontend-разработчика. Эффективная деятельность позволила закончить работу над MVP на 2 недели раньше планируемого', 'Подготовила вариации интерфейса для A/B-тестирования. Проведённые тестирования позволили сократить среднее время создания контеста на 11,2%', 'Создала и подготовила к вёрстке макет лендинга компании, позволив выйти на рынок и привлечь 3 школы Красноярска к закрытому тестированию в первый месяц работы платформы'], role: 'UX/UI-дизайнер', tags: ['Figma', 'Jira', 'Confluence', 'User Story', 'JTBD', 'CJM', 'IA', 'User Flow'] },
    ],
  },
  en: {
    name: 'Albina Timofeeva', title: 'Product Designer', role: 'Role', stack: 'Toolkit',
    download: 'Download', pdfTooltip: 'PDF coming soon', experience: 'Experience',
    languages: 'Languages', about: 'About me', degree: 'Bachelor’s degree · 2025–2029', university: 'Institute of Humanities, Siberian Federal University',
    specialty: 'Applied Computer Science in Art and Interactive Media', english: 'English — B2', russian: 'Russian — native',
    aboutText: 'I am a product designer with over two years of experience. I have worked on B2C and B2B products in FinTech, EdTech, and MedTech. I have experience across the full web interface development cycle, from audience research and User Flow design to preparing layouts for implementation and creating UI Kits. I regularly take part in national product hackathons and case championships',
    months3: '3 months', months6: '6 months', months17: '1 year 5 months',
    jobs: [
      { period: 'July 2026 — September 2026', company: 'T-Bank · Spirit', intro: 'Worked on features and DevEx improvements for LBaaS at Spirit, T-Bank’s internal PaaS platform for developers', bullets: ['Designed 5 LBaaS features, removing manual operations and context switches in developer workflows', 'Created 3 new guides for the Beaver design system, improving interface consistency across engineering products', 'Defined 2 complex user flows for route creation, improving engineers’ speed when working with the platform'], role: 'Product Designer', tags: ['Figma', 'Jira', 'Confluence', 'Scrum', 'User Story', 'JTBD', 'CJM', 'IA', 'User Flow'] },
      { period: 'November 2025 — April 2026', company: 'Mozg.lab', intro: 'As Lead Designer, created the interface for an EdTech platform that teaches school students to use neural networks', bullets: ['Designed the platform’s course builder. A/B-tested its functionality and reduced the average course creation time by 20%', 'Created a learning wizard for students, reducing bounce rate by 26%', 'Prepared an investor presentation; the final pitch secured RUB 1.8 million in investment for the platform'], role: 'Lead Product Designer', tags: ['Figma', 'Framer', 'Miro', 'GPT', 'JTBD', 'CJM', 'IA', 'User Flow', 'User Story', 'Kanban', 'GPT', 'Codex'] },
      { period: 'June 2024 — October 2025', company: 'LadderEnjoyers', intro: 'As a Product Designer, contributed to a B2C platform for teaching school students programming. Worked on the contest builder module and substantially improved its product metrics', bullets: ['Analyzed competitor User Flows in detail and prepared a pitchboard reviewing key solutions in the field', 'Defined the user journey for the contest builder and prepared a detailed UI Kit for frontend development. This work helped finish the MVP two weeks ahead of schedule', 'Prepared interface variants for A/B testing. The tests reduced average contest creation time by 11.2%', 'Created and prepared the company landing page for implementation, helping launch the product and bring 3 Krasnoyarsk schools into closed testing in its first month'], role: 'UX/UI Designer', tags: ['Figma', 'Jira', 'Confluence', 'User Story', 'JTBD', 'CJM', 'IA', 'User Flow'] },
    ],
  },
} as const;

const caseText = {
  ru: {
    date: 'Мозг.лаб • 2025 — 2026', title: 'EdTech-платформа для обучения школьников работе с нейросетями', tags: ['B2B2C', 'EdTech'], project: 'Проект', role: 'Роль', stack: 'Стек', lead: 'Ведущий продуктовый дизайнер',
    projectText: 'Спроектировала образовательную AI-платформу для 4 ролей с интегрированной средой написания кода, конструктором курсов и системой аналитики — провела продукт от дискавери до рабочего MVP и помогла привлечь инвестиции на развитие',
    stackTags: ['Figma', 'Miro', 'Framer', 'GPT', 'JTBD', 'CJM', 'IA', 'User Flow', 'A/B-тестирование'], contextTitle: 'Контекст', research: 'Исследование', insights: 'Ключевые инсайты',
    contextItems: ['Платформа создавалась как единая среда, где подростки 14–17 лет осваивают ИИ через создание собственных проектов по траектории no-code → low-code → code', 'На старте мы проанализировали 8 прямых и косвенных конкурентов и выявили три системных барьера рынка:', 'Пользовательский. Большинство классических LMS дают сухую теорию без мгновенного результата и требуют базовых навыков программирования уже на входе. Учителя же сталкиваются с нехваткой времени и методической базы для интеграции нейросетей в уроки', 'Продуктовый и монетизационный. Основная платящая аудитория — это родители, однако они не доверяют ИИ и сомневаются в пользе курсов', 'Технический. Практически ни у одного конкурента нет встроенных ИИ-чатов и среды генерации проектов. Требовалось спроектировать интерфейс поверх единого прокси-оркестратора российских моделей, полностью скрыв API-ключи и настройки окружения'],
    researchItems: ['Проведение конкурентного анализа, сегментация аудитории и проработка JTBD и CJM для трёх ключевых ролей (ученик, учитель, родитель)', 'Проектирование информационной архитектуры (IA) и пользовательских сценариев для веб-платформы и маркетингового лендинга', 'Проектирование ключевых модулей: обучающего онбординг-визарда, конструктора курсов (LMS), ИИ-среды создания проектов с Python-sandbox и личных кабинетов всех ролей', 'Проведение A/B-тестирования функционала конструктора курсов и итеративная доработка UX', 'Формирование подробного ТЗ и спёк для команды разработки, сборка инвестиционного питч-дека'],
    insightItems: ['Мгновенный результат для ученика, переход к генерации проекта прямо с дашборда и внутри первых уроков', 'Экономия времени для учителя с помощью уже готовых системных курсов с возможностью копирования (Fork) и быстрой адаптации под класс', 'Прозрачность процессов прямо в родительском кабинете, ценность обучения и прозрачность траты токенов становятся очевидными без лишних объяснений'],
    students: 'Решения для учеников', teachers: 'Решения для учителей', parents: 'Решения для родителей',
    studentText: ['Сократили путь, ученик сразу вовлекается в практику и получает мгновенную помощь от встроенного ИИ-ассистента без ухода на сторонние ресурсы, чтобы подростки не бросали платформу из-за сложной теории до создания первого проекта', 'Коридорные тесты помогли вычистить лишние шаги на старте и упростить онбординг-визард, что снизило Bounce Rate на 26%'],
    teacherText: ['Разделили ежедневный контроль расписания и глубокое управление программами, простая настройка профиля и механики продвижения снизили барьер для педагогов, ускорив наполнение платформы авторским контентом', 'Отсеяв первичные барьеры на коридорках, провели A/B-тест двух вариантов конструктора. В итоге снизили Error Rate и сократили Time on Task на 20%'],
    parentText: ['Родитель видит регулярность занятий и готовые ИИ-проекты ребёнка, которые можно протестировать в один клик. Быстрая связка аккаунтов по коду приглашения убрала трение при семейном онбординге', 'На коридорных проверках и встречах со стейкхолдером именно прозрачность родительского кабинета сняла недоверие к ИИ и стала ключевым аргументом на питче, принёсшем проекту 1,8 млн ₽ инвестиций'],
    gallery: 'Галерея проекта', more: 'Подробнее', close: 'Закрыть',
  },
  en: {
    date: 'Mozg.lab • 2025 — 2026', title: 'EdTech platform teaching school students to work with neural networks', tags: ['B2B2C', 'EdTech'], project: 'Project', role: 'Role', stack: 'Toolkit', lead: 'Lead Product Designer',
    projectText: 'Designed an educational AI platform for 4 roles, with an integrated coding environment, course builder, and analytics system. Took the product from discovery to a working MVP and helped attract investment for its development',
    stackTags: ['Figma', 'Miro', 'Framer', 'GPT', 'JTBD', 'CJM', 'IA', 'User Flow', 'A/B testing'], contextTitle: 'Context', research: 'Research', insights: 'Key insights',
    contextItems: ['The platform was designed as a unified environment where teenagers aged 14–17 learn AI by creating their own projects along a no-code → low-code → code path', 'At the start, we analyzed 8 direct and indirect competitors and identified three systemic barriers in the market:', 'User barrier. Most traditional LMS platforms offer dry theory without an immediate result and require basic programming skills from the outset. Teachers also lack the time and teaching resources to integrate neural networks into lessons', 'Product and monetization barrier. Parents are the main paying audience, yet they do not trust AI and question the value of the courses', 'Technical barrier. Almost none of the competitors offer built-in AI chats or a project generation environment. We needed to design an interface for a unified proxy orchestrator of Russian models, fully hiding API keys and environment settings'],
    researchItems: ['Competitive analysis, audience segmentation, and JTBD and CJM work for three key roles (student, teacher, parent)', 'Designed the information architecture (IA) and user scenarios for the web platform and marketing landing page', 'Designed key modules: a learning onboarding wizard, course builder (LMS), AI project creation environment with a Python sandbox, and personal accounts for all roles', 'A/B-tested the course builder and iteratively refined the UX', 'Prepared a detailed specification and project estimate for the development team, and assembled an investment pitch deck'],
    insightItems: ['Immediate results for students: start generating a project directly from the dashboard and in the first lessons', 'Save teachers time with ready-made system courses that can be forked and quickly adapted for a class', 'Make processes transparent in the parent account so the value of learning and token usage are clear without extra explanation'],
    students: 'Solutions for students', teachers: 'Solutions for teachers', parents: 'Solutions for parents',
    studentText: ['Shortened the path to practice so students engage immediately and get help from the built-in AI assistant without leaving the platform. This helps teenagers stay through the theory and reach their first project', 'Corridor tests helped remove unnecessary onboarding steps and simplify the wizard, reducing Bounce Rate by 26%'],
    teacherText: ['Separated daily schedule oversight from deeper program management. Simple profile setup and promotion tools lowered the barrier for teachers and helped fill the platform with original content faster', 'After removing the initial barriers found in corridor tests, A/B-tested two builder options. This reduced Error Rate and Time on Task by 20%'],
    parentText: ['Parents can see attendance regularity and finished AI projects by their child, which they can try with one click. Linking accounts with an invitation code made family onboarding easier', 'In corridor tests and stakeholder meetings, transparency in the parent account addressed distrust of AI and became a key argument in the pitch that brought RUB 1.8 million in investment'],
    gallery: 'Project gallery', more: 'Learn more', close: 'Close',
  },
} as const;

function Tags({ items }: { items: readonly string[] }) {
  return <div className="overlay-tags">{items.map((item, i) => <span className="overlay-tag" key={`${item}-${i}`}>{item}</span>)}</div>;
}

function Resume({ locale, close, showStickyClose }: { locale: Locale; close: () => void; showStickyClose: boolean }) {
  const copy = locale === 'ru' ? prepareTypography(resumeText.ru) : resumeText.en;
  const pdfAvailable = __RESUME_PDF_AVAILABLE__;
  return <article className="overlay-sheet overlay-resume" aria-labelledby="overlay-resume-title">
    {showStickyClose && <button className="overlay-close overlay-close-resume-sticky" type="button" onClick={close} aria-label={locale === 'ru' ? 'Закрыть резюме' : 'Close resume'}>×</button>}
    <header className="overlay-resume-header">
      <img className="overlay-avatar" src={asset('figma/f29c3.png')} alt="" />
      <div className="overlay-profile">
        <h1 id="overlay-resume-title">{copy.name}</h1><p className="overlay-profile-title">{copy.title}</p>
        <div className="overlay-contact" aria-label={locale === 'ru' ? 'Контакты' : 'Contacts'}><a href="tel:+79509844129">+7 (950) 984 41-29</a><a href="mailto:albinatimofeeva11@gmail.com">albinatimofeeva11@gmail.com</a><a href="https://t.me/Timofeeva_Albina" target="_blank" rel="noreferrer">telegram: @Timofeeva_Albina</a></div>
      </div>
      {pdfAvailable ? <a className="overlay-download" href={asset('resume.pdf')} download>{copy.download}</a> : <button className="overlay-download" type="button" disabled aria-disabled="true" title={copy.pdfTooltip}>{copy.download}</button>}
      <button className="overlay-close overlay-close-resume" type="button" data-primary-resume-close onClick={close} aria-label={locale === 'ru' ? 'Закрыть резюме' : 'Close resume'}>×</button>
    </header>
    <section className="overlay-resume-body" aria-label={copy.experience}>
      {copy.jobs.map((job, index) => <section className="overlay-job" key={job.company}>
        <div className="overlay-job-main"><div className="overlay-job-period"><span>{job.period}</span><span>{[copy.months3, copy.months6, copy.months17][index]}</span></div><div className="overlay-job-details"><h2>{job.company}</h2><div className="overlay-body-copy"><p>{job.intro}</p><ul>{job.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></div></div></div>
        <div className="overlay-job-meta"><strong>{copy.role}</strong><span>{job.role}</span></div><div className="overlay-job-meta"><strong>{copy.stack}</strong><Tags items={job.tags} /></div>
      </section>)}
      <section className="overlay-education"><div className="overlay-education-degree"><strong>{copy.degree}</strong><div className="overlay-job-details"><h2>{copy.university}</h2><p>{copy.specialty}</p></div></div><div className="overlay-job-meta"><strong>{copy.languages}</strong><span>{copy.english}<br />{copy.russian}</span></div><div className="overlay-job-meta"><strong>{copy.about}</strong><p>{copy.aboutText}</p></div></section>
    </section>
    <div className="overlay-resume-art"><ResumeArtwork /></div>
  </article>;
}

type SlideSet = { id: string; label: string; files: readonly string[]; ratio: string };
function Gallery({ set, locale }: { set: SlideSet; locale: Locale }) {
  const [index, setIndex] = useState(0);
  const file = set.files[index];
  const change = (next: number) => setIndex((next + set.files.length) % set.files.length);
  const swipeHandlers = useSwipe({ onSwipeLeft: () => change(index + 1), onSwipeRight: () => change(index - 1) });
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); change(index - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); change(index + 1); }
  };
  return <div className="overlay-gallery" aria-label={`${caseText[locale].gallery}: ${set.label}`}>
    <div className="overlay-gallery-image" style={{ aspectRatio: set.ratio }} role="region" aria-roledescription={locale === 'ru' ? 'карусель' : 'carousel'} aria-label={`${set.label}: ${index + 1} / ${set.files.length}`} tabIndex={0} onKeyDown={onKeyDown} {...swipeHandlers}>
      <img src={asset(`figma/${file}`)} alt={`${set.label} ${index + 1} / ${set.files.length}`} />
      {set.files.length > 1 && <><button className="overlay-gallery-arrow overlay-gallery-prev" type="button" onClick={() => change(index - 1)} aria-label={locale === 'ru' ? 'Предыдущее изображение' : 'Previous image'} /><button className="overlay-gallery-arrow overlay-gallery-next" type="button" onClick={() => change(index + 1)} aria-label={locale === 'ru' ? 'Следующее изображение' : 'Next image'} /></>}
    </div>
    {set.files.length > 1 && <div className="overlay-gallery-dots" role="group" aria-label={locale === 'ru' ? 'Выбор изображения' : 'Choose image'}>{set.files.map((_, i) => <button key={i} type="button" className={i === index ? 'is-active' : ''} onClick={() => change(i)} aria-label={`${locale === 'ru' ? 'Изображение' : 'Image'} ${i + 1}`} aria-current={i === index ? 'true' : undefined} />)}</div>}
  </div>;
}

function Case({ locale, close, showStickyClose }: { locale: Locale; close: () => void; showStickyClose: boolean }) {
  const c = locale === 'ru' ? prepareTypography(caseText.ru) : caseText.en;
  const galleries: SlideSet[] = [
    { id: 'overview', label: locale === 'ru' ? 'Обзор платформы' : 'Platform overview', files: ['06560.png', '66a7b.png'], ratio: '808 / 337.068' },
    { id: 'student', label: c.students, files: ['c1fb1.png', 'fb3e6.png'], ratio: '808 / 576.179' },
    { id: 'teacher', label: c.teachers, files: ['5240f.png', 'e3535.png', 'e33d9.png'], ratio: '808 / 576.179' },
    { id: 'parent', label: c.parents, files: ['a8f59.png', 'd6c2c.png'], ratio: '808 / 576.179' },
  ];
  const section = (title: string, children: ReactNode) => <section className="overlay-case-section"><h2>{title}</h2>{children}</section>;
  const galleryById = (id: string) => <Gallery set={galleries.find((item) => item.id === id)!} locale={locale} />;
  return <article className="overlay-sheet overlay-case" aria-labelledby="overlay-case-title">
    {showStickyClose && <button className="overlay-close overlay-close-case-sticky" type="button" onClick={close} aria-label={c.close}>×</button>}
    <button className="overlay-close overlay-close-case" type="button" data-primary-case-close onClick={close} aria-label={c.close}>×</button>
    <div className="overlay-case-intro"><p className="overlay-overline">{c.date}</p><h1 id="overlay-case-title">{c.title}</h1><Tags items={c.tags} /></div>
    <div className="overlay-case-facts"><div className="overlay-fact"><strong>{c.project}</strong><p>{c.projectText}</p></div><div className="overlay-fact"><strong>{c.role}</strong><p>{c.lead}</p></div><div className="overlay-fact"><strong>{c.stack}</strong><Tags items={c.stackTags} /></div></div>
    {section(c.contextTitle, <div className="overlay-case-copy">{c.contextItems.map((p, i) => <p key={p}><NoOrphans>{i > 1 && <b>— </b>}{p}</NoOrphans></p>)}</div>)}
    {section(c.research, <ul className="overlay-case-list">{c.researchItems.map((p) => <li key={p}>{p}</li>)}</ul>)}
    {galleryById('overview')}
    {section(c.insights, <ul className="overlay-case-list">{c.insightItems.map((p) => <li key={p}>{p}</li>)}</ul>)}
    {[['students', c.students, c.studentText, 'student'], ['teachers', c.teachers, c.teacherText, 'teacher'], ['parents', c.parents, c.parentText, 'parent']].map(([id, title, paragraphs, galleryId]) => <section className="overlay-case-section overlay-role-section" key={id as string}><h2>{title as string}</h2><div className="overlay-case-copy"><p>— {(paragraphs as readonly string[])[0]}</p><p>{(paragraphs as readonly string[])[1]}</p></div>{galleryById(galleryId as string)}</section>)}
  </article>;
}

export function PortfolioOverlays({ kind, locale, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [showStickyClose, setShowStickyClose] = useState(false);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !kind) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true });
    };
  }, [kind]);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !kind) {
      setShowStickyClose(false);
      return;
    }
    const primaryClose = dialog.querySelector<HTMLElement>(kind === 'resume' ? '[data-primary-resume-close]' : '[data-primary-case-close]');
    if (!primaryClose || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      setShowStickyClose(entry.intersectionRatio < 0.5);
    }, { root: dialog, threshold: [0, 0.5, 1] });
    observer.observe(primaryClose);
    return () => observer.disconnect();
  }, [kind]);
  if (!kind) return null;
  return <dialog ref={dialogRef} className="overlay-backdrop" aria-modal="true" aria-labelledby={kind === 'resume' ? 'overlay-resume-title' : 'overlay-case-title'} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    {kind === 'resume' ? <Resume locale={locale} close={onClose} showStickyClose={showStickyClose} /> : <Case locale={locale} close={onClose} showStickyClose={showStickyClose} />}
  </dialog>;
}

export default PortfolioOverlays;
