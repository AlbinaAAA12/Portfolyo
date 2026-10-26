# Design QA — навигация, галерея и Spirit

Дата: 26 октября 2026. Область: hover primary navigation, физика и сглаживание ProjectCollage, превью Spirit, точки в левых описаниях пяти кейсов. Остальные замечания продуктового аудита не входят в эту итерацию.

## Source visual truth

- Figma MCP: файл ngodoFRwbYo2LClGrPbitG, UI / Link / Primary1:14146 и Spirit visual panel1:13159. Получены высокоточные get_design_context со скриншотами, параметры слоёв и reactions через use_figma. Сессия59aa838e-ed85-4e2f-8564-b24b22c943f6. Браузер для доступа к Figma не использовался.
- Hover1:14163: #F538A0, текст#202124, Manrope600/24px/normal/−.48px, h52, padding8/8/8/16, gap8, r100. Прототип задаёт300ms EASE_IN_AND_OUT. get_motion_context не содержит timeline-узлов; это interactive variant transition.
- Spirit1:13159:592×668/r34. Backdrop wrapper x−.61328125/y307.187805/w592.613281/h360.812195; внутренний crop left−2.49%,width108.18%. Empty state1:13161:471×312 в60.5/178, r20, тень0/5/20 rgba(32,33,36,.1), исходная рамка.
- Галерея сохраняет ранее утверждённую пользователем композицию по C:/Users/Albina/Desktop/photo_2026-10-23_22-03-25.jpg (735×542). Новое условие: подъём без смены слоя, более плавный scroll. Прямоугольные видео вместо абстрактной графики — намеренная адаптация.

## Rendered evidence

Папка: C:/Users/Albina/Alb_Codex/Portfolyo-research/navigation-spirit-2026-10-26/.

- figma-nav-hover.png130×52 и figma-spirit.png592×668 — PNG непосредственно из Figma MCP.
- desktop-nav-hover.png, desktop-spirit.png, production-spirit.png, production-gallery-hover.png — browser-rendered1280×832 CSS/physical pixels, DPR1. CUA screenshot возвращает JPEG-байты, несмотря на используемое расширение.png; это учтено при оценке мелких цветовых артефактов.
- comparison-nav.png: Figma hover130×52 и точный browser crop130×52, показаны рядом при одинаковом увеличении×3.
- comparison-spirit-final.png: reference592×668 и production crop(648,124)-(1240,792)592×668 рядом в одном изображении, без масштабирования. Просмотрены совместно.
- comparison-gallery-final.png: исходный JPEG вписан в592×584 с сохранением пропорций, рядом production crop592×584 из(648,124)-(1240,708). Это сравнение направления композиции, не пиксельная копия и не образец hover из статичного JPEG.
- mobile-spirit-final.png и mobile-gallery.png:390×844 CSS/physical pixels, DPR1.
- Focused evidence: Spirit detail crops, comparison-nav×3, full-panel Spirit comparison; рассмотрены края, шрифт в превью, иконка, crop, рамка и тень. Новые SVG сохранены локально; временных MCP URL в runtime нет.

## Findings and comparison history

1. [P2, corrected] Навигация использовала старый серый hover и старую стрелку. Теперь фон/текст и оригинальная новая SVG-иконка соответствуют варианту Figma; hover/focus300ms ease-in-out. Idle-selected остаётся чёрным. Проверены active About, active Cases и keyboard-focus Resume, RU/EN.
2. [P2, corrected] Wheel мгновенно применял крупный шаг, а общий modulo переносил видимые копии видео. Теперь15 стабильных слотов с периодом1680 и индивидуальным переносом за границей; короткое экспоненциальное сглаживание tau32ms и ограничение отставания224px. wheel-samples.json содержит промежуточные позиции и окончательную остановку. Программной инерции скорости нет.
3. [P2, corrected] Hover поднимал z-index в1000. В production сравнение всех15 z-index до/после hover подтвердило полное совпадение. Подъём64px, матрица и раздвижение сохранены. Отдельно исправлено направление раздвижения после wrap: рассчитывается по physicalX, не номеру слота.
4. [P2, corrected] Пустое состояние Spirit было PNG1×. Заменено оригинальным SVG-экспортом node1:13161 с outline-текстом:23path,0image,0text, нет ограничений растрового разрешения и зависимости от отсутствующих T-Sans/Neue Haas webfonts. Фон1672×941 сохранён с точным crop; в mobile preview object-fit:cover исключает растягивание.
5. [P2, corrected] Концевые точки оставались в левых описаниях. Проверены10 сочетаний (5кейсов×2языка), включая строки Veritas передbr. Концевых точек нет, внутренняя пунктуация и NoOrphans сохранены.
6. После исправлений повторно просмотрены production Spirit, физический hover и mobile, выполнены совместные сравнения. Открытых P0/P1/P2 в текущей области нет.

## Required fidelity surfaces

- Fonts/typography: Manrope600/24/normal/−.48 навигации сохранён. Ширина браузерного «Инфа» отличается от Figma менее1px из-за font metrics, без изменения переносов/ритма (P3). Тексты Spirit — исходные векторные outlines из Figma. Общая типографика кейсов не менялась.
- Spacing/layout: primary h52/r100 и36px icon slot; mobile28px через scale без изменения intrinsic SVG. Spirit592×668, карточка471×312 и её положение подтверждены DOM. Галерея480px/native aspect ratios, общий592×584/r34, исходная matrix(.94,.16,0,.84,0,0), lift64 и recoil±40/∓24. Mobile390×844 без переполнения.
- Colors/tokens: hover rgb245,56,160 и текст32,33,36 подтверждены computed style, hover SVG opacity1/default0. Галерея.88/.99/.80 сохранена; active не меняет глубину. Рамка/тень Spirit экспортированы из Figma, не дублируются CSS.
- Image quality/assets:3 новых оригинальных SVG (nav default/hover, Spirit empty state), исходный backdrop PNG1672×941,4 реальных видео и Spirit poster. Нет новых нарисованных замен. JPEG-компрессия browser evidence не является компрессией SVG в приложении.
- Copy/content: изменены только terminal periods описаний, смысл и заглушки сохранены. Тексты внутри статичного Spirit mockup оставлены как в Figma, включая английский интерфейс портфолио; это исходные данные демонстрируемого продукта.

## Interaction verification

- Hover не выводит карточку вперёд: production z-index всего ряда неизменен. Соседи смещаются по физическому порядку; после циклического переноса направление сохраняется.
- Реальный native wheel: измерены промежуточные DOM positions, затем постоянная позиция без длительного дрейфа и active0 под неподвижной мышью. При пересечении границы в wheel-wrap-check.json перенесённая карточка была вне экрана с обеих сторон, видимый ряд сохранил движение.
-40 быстрых keys (20Right+20Left): конечные позиции всех15 слотов равны начальным, контрольная точка900/420 покрыта во всех40 выборках.
- Desktop drag240px дал240logicalpx; mobile drag120px дал194.098logicalpx при scale366/592. Drag не открывает кейс; мобильный клик по Ideas for the Future открыл соответствующий заголовок.
- Resume focus-visible получает ту же pink/ink пару без открытия модалки. Активные и неактивные навигационные состояния сохраняются.
- Spirit mobile: frame342×226.547, native пропорции карточки сохранены, SVG371.039×255.586 с исходными теневыми полями; body390×844. Галерея366×698; страница остаётся неподвижной.
- npm run build и git diff --check проходят. Production document:4173 не содержит console error/warn. Браузер проверен через CUA IAB.

## Limits and follow-up polish

- Системный reduced motion отдельно не эмулировался; код учитывает его и отключает wheel smoothing и hover transitions.
- Настоящий аппаратный touch/trackpad не тестировался; mobile viewport проверен мышью. Запись motion DOM подтверждает сглаживание, но не является замером FPS на устройстве пользователя.
- Interactive Smart Animate в навигации передан crossfade двух оригинальных SVG; финальное состояние, цвета и300ms easing совпадают, путь между SVG не морфируется.
- Известные логотипы внизу mobile и заглушки из прежнего аудита остаются вне этой итерации.

## Implementation checklist

- [x] Новый Figma hover/иконка и focus primary navigation.
- [x] Плавный бесконечный scroll, стабильные видимые медиа и физические слои.
- [x] Оригинальный SVG Spirit и точная desktop-геометрия.
- [x]10 описаний RU/EN без конечных точек.
- [x] Повторный production/mobile QA, build/diff-check, совместные сравнения.

final result: passed
