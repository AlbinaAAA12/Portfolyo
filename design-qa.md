# Design QA — mobile v2

27 октября 2026. Final result относится к этой адаптации, не к историческому аудиту всего портфолио.

## Source visual truth и нормализация

- Восемь предоставленных пользователем JPG: `C:/Users/Albina/Downloads/Telegram Desktop/photo_1_2026-10-27_15-26-03.jpg` … `photo_8_2026-10-27_15-26-03.jpg`, каждый 1080×2340. Это композиционные референсы, не макеты для точного копирования. В сравнительных листах убраны верхние 240px browser chrome и нижняя системная панель, показан crop 1080×1965; изображения уменьшены с сохранением пропорций. Не выносятся pixel-perfect замечания о разных текстах, палитрах и размерах чужих сайтов.
- Источник собственного стиля и baseline: код `70b7fd3`, screenshots `01-about-before.jpg`, `02-case-before.jpg` (390×844), `03-desktop-before.jpg` (1280×832).
- Implementation: `http://127.0.0.1:4173/Portfolyo/`, React/Vite production build. Screenshot/evidence root: `C:/Users/Albina/Alb_Codex/Portfolyo-research/mobile-v2-2026-10-27/`.
- Phone CSS viewport 390×844, capture 390×844, 1 capture pixel per CSS px. Extra 320×568, 430×932 captures same dimensions. Desktop CSS/capture 1280×832. Tablet CSS 1024×1366, native screenshot 1024×1238 (visible host capture clipped at bottom); full-height tablet pixel fidelity is not claimed.
- State: About, menu open, each case, both locales, resume/detail dialogs. Videos continue playing, so comparison frames differ in time; media timeline differences are not layout defects.

## Full-view и focused evidence

- `compare-reference-about.jpg`: two reference introductions and rendered About in one input.
- `compare-reference-navigation-case.jpg`: labelled reference menu, implementation menu, preview-first reference case, rendered case in one input.
- `compare-mobile-v2.jpg`, `compare-case-v2.jpg`: current-run before and after. The blank first video frame in the old About capture is a frame of the existing video, not a claimed fixed defect.
- `compare-style-details.jpg`: own original typography/navigation and mobile text/actions, focused comparison. Keeps Manrope and the black/white/gray/pink language.
- `compare-menu-final.jpg`: reference, initial v2 menu and final token-correct menu after fixes.
- `compare-desktop-v2.jpg`: original and current desktop. Header, intro crop and brand-strip raster comparisons each MAE 0, 100% pixels identical; animated portrait/video regions excluded. Layout geometry remains header1200×68 at40,40; panels592×584 at40/648,124; brand1200×68 at40,724.

## Findings и история исправлений

1. [P2, initial v2] Utility language hit area was35.1×44. Fixed to min44×44; menu contact links also min44 high. Verified computed min-width44 and final menu screenshot19.
2. [P2, initial v2] More still competed with case title in the top heading instead of the agreed description→tags→action order. Split compact placement from desktop; moved More after tags. Screenshot06 records initial state, screenshot12 records fix. More opens detailed Mozg case, other cases show bounded hint.
3. [P2, initial v2] New menu used #ec6594 and #f5f5f5 instead of existing project tokens. Replaced with --pink #f538a0 and --tertiary rgba(118,118,128,.12); existing --ink/--surface reused. Verified computed colors and screenshot19; combined input `compare-menu-final.jpg`.

No actionable P0/P1/P2 findings remain in this scope. Intentional differences from references: original portrait, font/palette/content, text menu instead of bespoke icon, centered native dialog rather than full-screen branded menu. These preserve the requested original style.

## Five fidelity surfaces

- Typography: Manrope loaded; intro600 24/31.2, case500 18/26.1, utility500 16, headings600. No content truncation observed at320RU/EN; long case title wraps. Source NoOrphans unchanged. Antialiasing inspected in screenshots; no claim of cross-platform identical rendering.
- Spacing/layout: one-column phone; two-column tablet with364px tracks at1024; 16px phone edges/24px tablet; 24px section rhythm. Static utility row, no header mask, no mobile chip strip. Preview first, original media aspect ratios, card captions below previews; menu scrolls on short screen. No page horizontal overflow at320/390/430/1024.
- Color/tokens: #202124, #f6f7f8, white, existing tertiary and #f538a0. Menu states use project tokens after fix3. Existing desktop CSS before compact media query is byte-identical apart from hiding two new mobile-only classes.
- Assets: unchanged source photos, videos, original Figma SVGs/icons. No substitute art. Spirit original SVG text stays sharp and relative composition remains inside its panel; video slots retain source ratio/border/shadow. Existing video content itself is not edited.
- Copy: original `const copy` RU/EN block programmatically unchanged; four cases in original order. New utility/menu words localized; English telegram/email lowercase. No new claims or case metrics.

## Interaction verification

- Four case choices close menu, focus h1 and reset scene scroll0. Back/All cases focuses project heading at16px. Language changes current view, no case reset.
- Menu native modal: initial focus Close; Escape, close and backdrop dismiss. Page width remains375 while locked at390 viewport. Background stays modal/inert. Browser chrome can receive native keyboard focus; no custom cyclic focus-trap claim. Resizing to desktop unmounts menu and clears scroll lock.
- Menu→Resume→close returns focus to live Menu. Direct Resume→close returns to Resume. Detailed case→Escape returns to More and keeps reading position. Existing modal content remains vertically scrollable.
- Testimonial horizontal scroll moves scrollLeft310; gap24; vertical scene remains native scroll. All four project cards and media stay available in one page.
- Videos observed playing with increasing time, loop/muted and no media errors. Offscreen pause/fallback implementation unchanged.
- Browser console errors `[]`; `npm run build` and `git diff --check` pass. Final bundles index-5S2LFC2E.js / index-BM1qhuNh.css. Production files contain no Visual Truth / source bridge references.

## Remaining test gaps / P3

No real iOS/Safari/Android hardware, screen reader or recruited user study. Native touch gestures and browser text enlargement were not newly simulated in this iteration. Existing placeholder testimonials and missing PDF behavior remain out of scope. Supplementary menu is not sticky: use the visible in-page actions and footer next/back while reading. Post-deploy evidence is recorded in VERIFICATION.md.

## Implementation checklist

- [x] Quiet mobile navigation and separate menu
- [x] Original style/content/media retained
- [x] Preview-first cases and direct profile actions
- [x] Fix/recheck P2 issues
- [x] Mobile/tablet/desktop comparison, build and console checks

final result: passed
