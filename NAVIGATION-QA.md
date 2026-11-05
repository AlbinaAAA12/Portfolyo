# Navigation and scroll QA — 5 ноября 2026

Baseline b176d7a. Область: desktop scroll-кейсы, логотипы и ссылка скачивания. Мобильная лента/контент/токены сохранены. Клиент подтвердил прямую связь движения с прокруткой и мягкое доведение до ближайшего кейса.

## Реализация и проверки

- Нативный scrollport под хедером, sticky stage, MotionValue и useSpring без App setState каждый кадр. Четыре слоя с translateY/rotateX/translateZ/scale. Остановка через200ms quiet к ближайшему из4слотов. Первый выбранный кейс выставляется после коммита высоты track, без показа нулевого слота. Явные request revisions отделены от onActiveChange, чтобы не возникало обратной связи.
- На1280×832 header остаётся1200×68 at40,40; оба блока592×668 at40/648,124. Проверены прямые входы во все4кейса из логобара, wheel вниз/вверх, snap доscrollTop668/1336/2004, PageUp через клавиатурный фокус. Mid-scroll обе панели имеют общую перспективу; хедер не двигается.
- Compact rail: активный14px/#202124, остальные6px/#B3B4B8; на промежуточной позиции1.48 две соседние линии плавно меняют длину/цвет. Открытие/выбор/закрытие expanded-панели сохранены, direct select Веритас завершаетoffset2004.
- Пять логотипов кликабельны. Т-Банк/Spirit→spirit; Ladder→future; Мозг.лаб/Веритас→свои кейсы. ВсеhoverSVG сохраняют исходную геометрию, изменён только цвет; XML comparison pass. Pink focus проверен в браузере. Spirit использует исходные564e3/31715 с подмигиванием.
- Marquee40s/3группы сохраняется; клоны кликабельны мышью и не имеют Tab-stop. Keyboard focus включает статичный нативно прокручиваемый ряд, одноразовая коррекция делает кнопку полностью видимой. На320 последний Веритас172.99…284.87 внутриframe16…289. Зона нажатия44px, SVG30px, высота плашки68px.
- Mobile390/320: отдельного desktop deck нет, вертикальная лента и переходы сохранены, scrollWidth==clientWidth375/305. Переход из логотипа открывает нужный мобильный кейс сscrollTop0. RU/EN проверены.
- Резюме: прозрачная ссылка с download-иконкой слева20px; текст18px desktop/16px mobile, hitheight44. PDF отсутствует, поэтому aria-disabled безhref/download. Существующий PDF build gate сохранён.
- Resume и подробный Мозг.лаб открываются; deck disabled. Wheel внутриresume меняет только overlayScroll832, underlying остаётсяВеритас/offset2004. При закрытии позиция сохранена. Неактивные слои inert/aria-hidden: доступны только1из4.

## Сохранность стиля

Manrope, цвета/радиусы/отступы, исходный контент RU/EN и медиа не изменены. В покое перспектива даёт transform:none и прежние размеры. Новая анимация поддерживает reduced motion; системный режим в этой проверке не переключался. Удалённые медиа остаются на паузе, active±1 разрешены с прежним IntersectionObserver.

## Evidence и ограничения

`C:/Users/Albina/Alb_Codex/Portfolyo-research/navigation-scroll-2026-11-05/`:01pinkfocus,02Spiritentry,03snap,04perspective,05/06resume,08mobile320focus, desktop-checks.json, final-deck-check.json и scroll-preview.gif из22реальных browser captures. CSS/native capture1280×832,390×844,320×568. Прокрутка браузера проверена; физические мышь/трекпад, реальные iOS/Android и Safari не тестировались.

npm run build (TS/Vite) и git diff --check pass. Console errors[]. Финальные index-DcTZSVX2.js / index-DHv8Rww-.css. Vite сообщает advisory chunk>500kB; сборка успешна. Публикация/public smoke записываются в VERIFICATION.md.
