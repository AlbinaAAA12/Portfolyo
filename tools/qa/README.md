# Mobile section swipes

Run `npm run dev`, then open `/tools/qa/mobile-swipes.html` at a mobile viewport
(320–1100 CSS pixels wide). Keep the browser visible and click **Run swipe checks**.

The 17 checks exercise the actual App using synthetic touch pointer events:
section order and boundaries, both transition layers, full viewport width,
stationary header, vertical/short/mouse/canceled gestures, and unchanged resume
button modal behavior. The fixture is not a production build entry point.

Also check on a physical phone: native vertical scrolling, pinch zoom, diagonal
gestures, and browser-owned back gestures at the screen edges. Synthetic events
do not verify the browser's native touch arbitration.

## Desktop section swipes

Open `/tools/qa/desktop-swipes.html` at a desktop viewport and click **Run desktop
checks**. Its 22 checks cover horizontal wheel input, wheel inertia, mouse drags,
full browser width, fixed header, original case dimensions and bottom clipping,
native vertical wheel/zoom handling, nested collage priority, and button routes.
The wheel events are synthetic. Also exercise a physical trackpad and drag with
the mouse in the normal app. Project collage gestures remain local to the collage.
