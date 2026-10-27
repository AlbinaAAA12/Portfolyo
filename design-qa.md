# Design QA — мобильные правки v3

27 октября 2026. Область: компактная компоновка до1100px; десктоп сохранён.

## Визуальная цель и evidence

Source visual truth: восемь аннотированных JPG пользователя `C:/Users/Albina/Downloads/Telegram Desktop/photo_{1,2,3,4,5,7,10,11}_2026-10-27_16-09-32.jpg`, каждый1080×2126. Это пометки о структуре и действиях поверх предыдущей версии, а не новые pixel-perfect макеты. Текстовое уточнение пользователя: удалить кнопку закрытия меню, закрывать нажатием вне панели. Три сегмента расположены в один ряд, как обозначено общей линией на аннотации.

Implementation: production preview `http://127.0.0.1:4173/Portfolyo/`; baseline71bb90c. Evidence root: `C:/Users/Albina/Alb_Codex/Portfolyo-research/mobile-v3-2026-10-27/`. Предыдущий QA сохранён там в design-qa-v2-archived.md.

Phone CSS/capture390×844 и320×568, по одному capture pixel наCSSpx. Desktop CSS/capture1280×832. Tablet CSS1024×1366, видимый native capture1024×1238: нижняя часть ограничена хостом, полная пиксельная проверка высоты не заявляется. В сравнительных листах полные исходные JPG уменьшены пропорционально доширины300–350px; browser chrome и разные scroll positions не считаются дефектами. Видео показаны в разных моментах времени, их содержимое не редактировалось.

## Совместные сравнения

- compare-home.jpg: аннотация заголовков и стрелок, текущий-run before01 и implementation14.
- compare-menu.jpg: аннотация удаления/переименования, before02 и implementation15. Проверены общее основание сегментов, центрирование, выбранный чёрный пункт, отсутствие Close/дублей.
- compare-reviews-gallery.jpg: source photo5/photo10 и implementation13/09. Сравниваются внешний фрейм, ширина отзывов, расстояние точек и отсутствие стрелок.
- compare-fixes.jpg: initial320heading06 и fixed08; полная композиция Spirit12.
- compare-desktop.jpg: baseline03 и after17. Неподвижные header/intro/brand crops совпадают на100%, MAE0; animated portrait/video excluded. Два основных блока592×584 at40/648,124, нижние логотипы1200×68 at40,724.

Focused checks: DOM dimensions confirm caption→media gap12px vs40px between project rows. Spirit img computed108.18%/108.493%, object-fit fill, aspect592/668; sourceSVG остаётся векторным. Dots centres24px, hitarea24×44. Menu controls44px high, same row, source trim cap/alphabetic. Source copy block RU/EN unchanged.

## Findings / исправления

1. [P2, initial implementation] Общий `.mobile-project-media img` перебивал crop и размеры вложенных изображений Spirit, задавал cover и100%. Повышена специфичность локальных селекторов. После: backdrop368.891px приparent341, frame294.336px приparent271.297, обаfill; screenshot12.
2. [P2, initial implementation] При320px More уходила под Мозг.лаб из-за фиксированного flex-basis220px, хотя контент помещался. Заменено на intrinsic min-content и выравнивание по нижнему краю названия. Screenshot06→08; future320EN переносит длинное название без overlap и overflow.
3. [P2, source fidelity] Veritas в новой строке наследовал Manrope600 вместо исходногоArial700. Исправлено; финальный browser computed Arial,sans-serif /700,16px. Все группы после изменения676.367px, поэтому цикл по-прежнему состыкован.

4. [P2, финальная проверка] Нажатие на внутренний белый padding меню ошибочно считалось нажатием на backdrop. Handler теперь сравнивает координаты с прямоугольником dialog. В финальной сборке click(22,320) внутри оставляет меню открытым (screenshot18), click(8,80) снаружи закрывает и возвращает фокус на Меню.

5. [P2, планшет] Две короткие группы логотипов не покрывали всю широкую плашку в конце цикла. Добавлена третья aria-hidden группа, шаг цикла — ровно одна группа /40s. На1024×900 проверены ширинаframe752 и остаточное покрытие1352.734px, screenshot19-tablet-marquee-final.jpg; compare-marquee-tablet.jpg.

No actionable P0/P1/P2 findings remain in this scope.

## Пять поверхностей качества

- Typography: Manrope загружен; исходная иерархия24px вступления,20px названия карточек,32px case title,18px description,14px отзывов сохранена. Сегменты16px, на<=36014px; Vertical trim применяется к внутреннемуspan. VeritasArial700. Нет обрезанного контента при320RU/EN; NoOrphans/исходные тексты сохранены.
- Spacing/layout: видимого «Кейсы» на главной нет; caption и стрелка над своим превью. 12px внутри связки,40px между карточками. Отзывы без белой обёртки; viewport0…375 при390viewport/15px scrollbar; каждый slide375px, зазор24. Pagination не растягивается по ширине. One-row logo frame343×68, overflowhidden. Tablet364px tracks; Spirit выше других из-за сохранённых исходных пропорций.
- Colors/tokens: прежние --ink/#202124, --page/#f6f7f8, --surface/white, --tertiary и --pink/#f538a0. Сегменты на общей tertiary-плашке, selectedblack/white; активный пункт не получает hover-перекраску. Отзывы на исходном сером фоне, лишняя белая поверхность удалена.
- Image/asset fidelity: Spirit повторяет оригинальную сцену case-page из cdbc0.png + spirit-empty-state.svg. Остальные изображения, видео и иконки исходные. Не добавлялась новая графика. В ленте те же пять логотипов, две повторные группы aria-hidden.
- Copy/content: const copy RU/EN unchanged. Меню переименовано Инфа/Info, дубли языка/контактов удалены только из dialog, utility-language и прямые контакты работают. У next-link оставлены имя проекта и стрелка, текст Next case/Следующий кейс удалён. Десктопная copy/markup ветка сохранена.

## Проверенные взаимодействия

- Выбор кейса закрывает меню, focus h1 /scrollTop0. Возврат фокусирует section#mobile-projects на16px, без удалённогоh2. Menu→Resume→close возвращает фокус на живой Menu trigger.
- Native menu withoutClose: backdrop иEscape закрывают; initialfocus наИнфа/Info. При320EN три сегмента в одной строке, dialogscrollWidth=clientWidth296.
- More возле case-title открывает подробный кейс. Галерейные стрелки computednone на320/390, grid на1280. КнопкаImage2 меняет1/2→2/2, горизонтальный drag меняет2/2→1/2. Dots24×44, центры24px.
- Отзывы: точка2 даётscrollLeft399; native горизонтальный scroll переходит наотзыв4 /1197, gap24. Страница не переполняется по горизонтали.
- Marquee: три одинаковые группы; widthtrack=3×group, цикл сдвигает трек на одну группу. На1024px frame752, group676.367, track2029.102; после полного сдвига остаётся1352.734px покрытия, что больше frame. Transform меняется при40s linear animation и останавливается приhover/focus. После ухода фокуса продолжает. Все лого наодномy, clipping внутрибелогоframe. Reduced-motion CSS отключает animation, разрешает native horizontal scroll; системная настройка в этой сессии не менялась.
- Сборка npm run build и git diff --check pass. Base desktop CSS доcompact query unchanged; прежнийoverlayCSS retained verbatim с добавлением толькоcompact rules. Финальные bundles index-DSK2HtJ3.js / index-D1wSFMmR.css. Browser console errors: [].

## Границы / дальнейшая проверка

Реальные телефоны, iOS/Safari и screen reader не использовались; touchсвайп отдельно наустройстве не тестировался, проверен pointerdrag существующегоuseSwipe. Плавность строки проверена визуально и поtransform, profilingFPS не проводился. Тексты временных отзывов и PDF не менялись. Публикация и publicsmoke записываются в VERIFICATION.md.

## Checklist

- [x] Все запрошенные мобильные перестановки
- [x] Меню безкнопкиClose, segmentcontrol, workingdismiss/resume
- [x] Spirit sourcecomposition, fullwidthreviews, compactdots, onelinelogos
- [x] Mobile/tablet/desktop QA и исправления P2
- [x] RU/EN, gallery dots/drag, navigation/focus, build/console

Publication: 34c99ca via workflow40496255203, build/deploy success. HTTP GET root and versioned URL returned200 with final index-DSK2HtJ3.js / index-D1wSFMmR.css. Public browser showed cached prior v3, then CDP/navigation stopped responding; full browser smoke of the final public bundle is not claimed. Final build was browser-tested locally. See VERIFICATION.md.

final result: passed
