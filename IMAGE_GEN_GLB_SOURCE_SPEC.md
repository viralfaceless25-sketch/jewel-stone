# CODEX TASK — Clean image-to-3D SOURCE render of a diamond (for GLB conversion)

Use your **imagegen** / `image_gen` tool. Images only — do NOT edit any code.

## Purpose
This image will be fed into an **image-to-3D service** (Meshy / Luma / Rodin / Tripo) to generate a `.glb` of a diamond for the homepage's hero 3D scene. Image-to-3D tools need a CLEAN, unambiguous silhouette — NOT a moody editorial shot. Optimize for geometry extraction, not for beauty.

## Hard requirements (these matter for a good mesh)
- **Single object only** — one diamond, nothing else in frame. No hands, no props, no other stones, no packaging.
- **Plain seamless NEUTRAL background** — flat mid-gray (around `#8f8f8f`). NOT black, NOT pure white, NO gradient, NO vignette, NO bokeh, NO scene.
- **Even, soft, diffuse studio lighting** — the whole object clearly lit, facets readable. Avoid blown-out hotspots, heavy dark shadows, strong colored light, or big mirror reflections that hide the shape.
- **¾ elevated "hero" angle** — camera slightly above, looking down at ~30°, so the TOP TABLE + CROWN FACETS and the SIDE/PAVILION are both visible. This gives the 3D tool the most surface info.
- **Whole object in frame with even margin** — the diamond centered, ~15% empty margin all around, not cropped at any edge.
- **Sharp focus front-to-back** — deep depth of field, no blur. Realistic faceted **round brilliant cut** diamond, colorless, crisp facet edges.
- Square, high resolution **~1600×1600**.

**Negatives (repeat strongly):** no text, no watermark, no logos, no reflections of a scene, no dark background, no black background, no gradient background, no shallow depth of field, no motion blur, no extra objects, no hands, no jewelry setting/metal (loose stone only), no cropping.

## Save to EXACT path (.jpg)
`public/models/source/diamond-source.jpg`

## Done
Report the file written + pixel dimensions. No code edits.
