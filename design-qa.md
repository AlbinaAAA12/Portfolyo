# Design QA — мобильные правки v4

27 октября 2026. Область: compact до1100px. Desktop сохранён. Baseline662da83; production preview http://127.0.0.1:4173/Portfolyo/.

## Visual truth и evidence

Source: восемь аннотированных JPG пользователя `C:/Users/Albina/Downloads/Telegram Desktop/photo_{1,2,3,4,5,6,7,8}_2026-10-27_20-00-23.jpg`. Семь1080×2126, photo7 —1080×2292. Это пометки о структуре поверх прежней версии, а не новые Figma-макеты. Последнее уточнение: три тега Веритас показывать в одном горизонтально прокручиваемом ряду с прежним размером текста. Новые пометки удаляют весь заголовок и сегменты меню, закрытие снаружи согласовано ранее.

Evidence root: `C:/Users/Albina/Alb_Codex/Portfolyo-research/mobile-v4-2026-10-27/`. Предыдущий QA сохранён там в design-qa-v3-archived.md. `compare-v4.jpg` совмещает исходные аннотации, before и implementation для меню, отступа, тегов, footer и отзывов; исходные изображения и browser captures уменьшены пропорционально. Browser chrome/scroll positions не сравниваются. Видео сняты в разные моменты. Screenshot18 показывает длинный заголовок320,19 —Spirit390. `preview-v4.jpg` — итоговая подборка.

CSS/native capture:320×568,390×844,1024×900,1280×832, один capturepixel наCSSpx. Scrollbar хоста15px: доступная scene305/375px. Реальные устройства и touch-эмуляция не использовались.

## Итерации

1. Меню содержит только4 проекта. Нет заголовка, сегментов и Close. Accessible name «Выбрать кейс»/«Choose a case». Нажатие на внутренний padding не закрывает; backdrop/Escape закрывают, фокус возвращается наМеню. Выбор проекта закрывает панель и сбрасывает scroll.
2. Footer содержит одну белую кнопку с названием следующего проекта без иконки. «К кейсам» удалено. Порядок и локализованное aria-label сохранены.
3. Первоначальные равные grid-колонки тегов давали лишние пустоты и ненужные переносы. Исправлено на две flex-строки по два hug-тега с gap8px. На320 пары Мозг.лаб/Future помещаются без переноса текста. Три тега Веритас остаются в одной строке, font14px. На390 rail client303/scroll345px; ArrowRight меняет scrollLeft на40; focusoutline розовый.
4. Заголовок и действие выровнены снизу. УSpirit внутренние плашки40/36px также выровнены вниз внутри44px статуса. На320Future первоначально переносил More под заголовок. Исправлено: nowrap-строка, кнопка может сжиматься и переносить полный текст. Итог h1/button bottom166.234px, width147.633/113.367px. На390Spirit все нижние края129.438px; nooverflow.
5. Белая плашка отзывов:343px на390, padding16/radius24. Slide311px, gap24; точка2 даёт scrollLeft335. Активные и неактивные dots отзывов и всех4галерей6×6px, центры через24px, цели24×44. Активная отличается цветом. GalleryImage2 работает; стрелки скрыты наcompact.
6. От profile-actions до первого проекта48px, прежде24px. Caption→media12px, между проектами40px. На1024 grid364+364px; scene client/scroll1009, горизонтального overflow нет.

## Пять поверхностей качества

- Typography: Manrope сохранён; intro24/600, title32/600, description18/500, tags14/500, отзывы14/500. Размер тегов не уменьшался. NoOrphans сохранён; длинный action на320 переносит текст внутри кнопки.
- Spacing/layout: menu4карточки/padding24, reviews16/r24, tagsgap8, footer minheight64/r24, раздел перед работами48px. Нет одинокого тега во втором ряду основных кейсов. Desktop1280×832: header1200×68 at40,40; блоки592×584 at40/648,124; brands1200×68 at40,724.
- Colors: прежние ink#202124, page#f6f7f8, surfacewhite, pink#f538a0, tertiaryrgba(118,118,128,.12). Отзывам возвращена белая поверхность. Dots ink/muted, одинаковый размер.
- Assets: фото, SVG, видео, коллаж и sourceкомпозицияSpirit не редактировались. Autoplay/muted/loop сохранены. Разница видеокадров обусловлена временем capture.
- Copy: const copyRU/EN совпадает сbaseline после нормализацииCRLF. Удалены только запрошенные navigationlabels. Desktop tagDOM прежний. Резюме доступно под вступлением; открытие/закрытие проверено.

## Верификация

- npm run build: TypeScript/Vite pass. Финальные index-BDqf0KDf.js / index-DPm9Nw22.css. git diff --check pass; console errors [].
-320RU/EN: все4кейса, теги2+2 либо scrollrow, footer1button/0images. После последних исправлений повторно проверены320RUFuture и390Future/Spirit/Mozg. Этапы initial/postTagPairs/finalHeader разделены в case-checks.json.
- Base desktopCSS доcompactquery и overlayCSS до последнегоcompactблока неизменны; source-checks.json. Desktop04→21: неподвижные header/intro/brand crops MAE0 и100%samePixels. Анимированные портрет/коллаж исключены. desktop-comparison.json.
- Browser: dots/Image2, keyboardscrolltags, menuinside/outside/Escape/focus, nextnavigation, resume. Горизонтального переполнения страницы на320/390/1024 нет.

Реальные iOS/Android, Safari и screen reader не тестировались. Свайп на физическом телефоне не проверялся; useSwipe не менялся. PDF и временные отзывы вне итерации. Публикация/publicsmoke — VERIFICATION.md.

- [x] Аннотации сопоставлены с before/after
- [x] Меню, footer, теги, отзывы, dots, отступ
- [x] Нижнее выравнивание, включая320RUFuture
- [x] RU/EN, compact/tablet/desktop, build/console
- [x] Desktop/sourcecopy/assets сохранены

final result: passed

Publication:07e663d via [workflow40515621094](https://github.com/AlbinaAAA12/Portfolyo/actions/runs/40515621094), success/build20s/deploy35s. Root/versioned HTTP200 with exact final JS/CSS. Public browser390×844 smoke passed: same bundle, Manrope, menu4cards, gap48, tags2+2, nextSpirit, footer1button/0images, white reviews, dot3→scrollLeft670/6px, scene375/375, console errors[]. Evidence23/24; see VERIFICATION.md.
