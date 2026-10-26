# Design QA — UI / Header, Component 24, Component 11

Дата: 26 октября 2026. Область — три указанных компонента и запрет hover у выбранной кнопки хедера. Остальной интерфейс сохранён.

## Source visual truth

Figma MCP, файл ngodoFRwbYo2LClGrPbitG: UI / Header1:14179, Component241:14284, Component111:14251. Для всех получены новые get_design_context с изображениями, высокоточными свойствами и SVG; размеры/состояния/reactions сверены через use_figma. Использована текущая сессия59aa838e-ed85-4e2f-8564-b24b22c943f6. Figma в браузере не открывалась.

## Evidence and normalization

Папка evidence: C:/Users/Albina/Alb_Codex/Portfolyo-research/header-rail-2026-10-26/.

- figma-header-ru.png и figma-header-en.png:1200×68, состояния Cases selected. Browser desktop-header-ru.jpg/en.jpg:1280×832 CSS/physical pixels,DPR1; crops(40,40)-(1240,108)1200×68.
- comparison-header-ru.png/en.png: источник и реализация помещены вместе при масштабе1:1 и просмотрены совместно.
- figma-rail-expanded.png:112×236 с контекстом/полями эффектов; natural layout48×180. Центральный crop(32,20)-(80,200) сопоставлен с browser crop(8,326)-(56,506)48×180 в comparison-rail.png; обе панели показаны при одинаковом увеличении×4 и просмотрены вместе. Разные цвета внешнего фона в скруглённых углах вызваны контекстом Figma canvas и страницы, не токенами панели.
- desktop-rail-mozglab-hover.jpg, desktop-rail-veritas-hover.jpg, desktop-rail-spirit-hover.jpg: дополнительные состояния. figma-rail-mozglab-hover.png и figma-rail-veritas-hover.png — оригинальные MCP reference-изображения.
- mobile-header-390-ru.jpg, mobile-header-320-ru.jpg/en.jpg: соответствующие CSS viewport390×844 и320×568,DPR1. production-header-rail.jpg: финальная сборка на:4173.
- Browser captures — JPEG, reference captures — PNG. Мелкая разница сжатия/сглаживания не интерпретируется как изменение SVG или цвета. Focused rail×4 и полные header crops нужны для оценки стрелок, логотипов, отступов и выбранного состояния.

## Findings and iteration history

1. [P2, corrected] У выбранной кнопки Header работали pink hover/focus fill и подмена стрелки. Все hover/focus правила теперь ограничены :not(.is-active). Выбранные Info/Cases сохраняют#202124/white и белую b6393.svg, переход в selected мгновенный. Это явное уточнение пользователя. Keyboard outline сохранён отдельно.
2. [P2, corrected] В Header переключатель языка и Resume использовали page-fill вместо tertiary; padding не менялся с языком; английские подписи отличались от Figma. Теперь locale138×52, RU padding8/16, EN16/8, общий tertiary rgba(118,118,128,.12); EN Info/Case/Resume. Мобильная компоновка сохранена.
3. [P2, corrected] Component24 содержал старые hover/pressed-иконки. Spirit и Ladder hover используют актуальные малые цветные SVG на background.2; Mozg.lab97059/af5df; Veritas hover/pressed56b99 с розовым знаком. Intrinsic размеры SVG сохранены.
4. [P2, corrected] Текущий кейс в Component11 помечался aria-current, но не имел постоянного pressed visual. Теперь current использует Pressed-вариант; после выбора он перемещается на новый кейс. Future/outsourcing сохраняют общий пункт LE.
5. [P2, corrected] Blur боковой панели был перенесён из filter drop-shadow в box-shadow с половинными значениями. Для box-shadow установлены полные радиусы11/20/27/32/35 из Figma; offset/alpha/stroke совпадают с источником.
6. После исправлений повторно просмотрены чистые изображения Header RU/EN и панели, mobile и production; открытых P0/P1/P2 нет. Один тестовый screenshot с выделением текста при mouse-drag был отброшен и переснят без выделения; он не использован для приёмки.

## Required fidelity surfaces

- Fonts/typography: Manrope600/24/normal/−.48 в primary navigation; locale500/24/normal/−.48. Locale label widths40/42 дают ровно138px. Общая ширина группы навигации отличается от reference на несколько пикселей вследствие font metrics/AA, без изменения ритма или переноса (P3). В логотипах используются исходные SVG.
- Spacing/layout: Header1200×68,pad8,r100; primary pills h52,gap8,pad8/8/8/16,r100. Compact rail24×180, expanded48×180,pad4,gap4,r14; items40×40,r10. Геометрия сверена DOM. Mobile390/320 без переполнения, все кнопки находятся внутри header.
- Colors/tokens: selected Header#202124/white без hover; невыбранный hover#F538A0 сохранён. Locale и обычные pills tertiary. Component24 default.12/hover.20/pressed#eeeeef; Veritas hover#FC69A0, Mozg.lab hover#141413. Shadow и insetstroke#ebebec получены из MCP.
- Image quality/assets: два новых оригинальных SVG97059/af5df, остальные точные существующие Figma assets; root dimensions не изменены, width/height overrides у логотипов сняты. Малые цветные знаки22.9929×23 и16.9442×23 расположены по инспектору;88×88 exports учитывают поля тени. Новых рисованных замен нет.
- Copy/content: видимые английские подписи Header приведены к Info/Case/Resume. Русские подписи, aria labels, тексты кейсов и модалок не изменены. Скрытый в Figma «Привет!» не добавлялся.

## Interaction verification

- RU: About и Cases действительно имели:hover=true при проверке, сохраняя black/white, default icon opacity1/hover0. EN selected Case при focus-visible сохраняет black/white и отдельный outline. Невыбранный Resume при реальном hover остаётся pink.
- Панель раскрывается наведением и через Enter на compact. Hover всех четырёх пунктов проверен через видимый SVG/background; current остаётся Pressed. Десктопный выбор Mozg.lab и Ideas for the Future закрывает панель; compact меняет соответствующую длинную черту.
- После перехода на Outsourcing company compact остаётся LE, current — общий LE. Escape закрывает панель и возвращает фокус compact.
- Mobile390×844: выбор Spirit из панели открывает его и закрывает rail.320×568 RU/EN: document scrollWidth320/scrollHeight568, границы всех header buttons внутри окна; selected Case black.
- npm run build и git diff --check проходят. Production bundle index-CB6d-eZP.js проверен через CUA IAB: selected hover без смены заливки, expanded/current state, нет console errors/warnings.

## Limits and follow-up polish

- Настоящий аппаратный touch не проверялся; mobile viewport проверен мышью/клавиатурой.
- Несколько пикселей font metrics и артефакты JPEG в увеличенных browser captures — P3/ограничения evidence, а не повод изменять точные токены Figma.
- Остальные экраны и замечания прежнего аудита вне области этой итерации.

## Implementation checklist

- [x] Все три компонента заново прочитаны через Figma MCP.
- [x] Selected Header исключён из hover/focus fill и подмены иконки.
- [x] Header fills, padding и EN labels синхронизированы.
- [x] Component24 state assets и Component11 current/shadow обновлены.
- [x] Наведение, выбор, закрытие, keyboard, mobile, production и совместное визуальное сравнение.

## Published verification

Реализация `5184695`; [workflow40313889163](https://github.com/AlbinaAAA12/Portfolyo/actions/runs/40313889163) завершился успешно (build/deploy success). GitHub Pages отдаёт bundle `index-CB6d-eZP.js`. При1280×832 выбранные Инфа/Кейсы с реальным:hover=true сохраняют rgb(32,33,36)/white. Панель раскрывается, Spirit сохраняет current/Pressed с исходным2e13d.svg; console errors/warnings отсутствуют. Итоговый снимок live-header-rail.jpg сохранён в evidence-папке и просмотрен.

final result: passed
