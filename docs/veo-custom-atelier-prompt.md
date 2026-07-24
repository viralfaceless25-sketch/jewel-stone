# Google Flow / Veo prompt — custom atelier hero film

Target: the middle hero slide at `/` (Jewel Stone homepage). Replaces the placeholder
`/videos/hero-v3.mp4` referenced in `components/home/HeroSlideshow.tsx`.

## Specs to request

- Aspect ratio **16:9**, 4K, 24 fps
- Duration **8 seconds** (loopable — first and last frame should be visually similar)
- No on-screen text, no logos, no readable faces
- Warm champagne/gold key light, deep charcoal background, shallow depth of field

## Prompt

> Cinematic macro sequence inside a high-end jewelry atelier, warm champagne key light
> against deep charcoal shadow, shallow depth of field, anamorphic look, 4K, 24fps.
>
> Shot 1 (0–2s): extreme close-up of a jeweler's hands in soft focus sketching a ring
> profile in graphite on cream paper; pencil tip catches a warm rim light; slow push-in.
>
> Shot 2 (2–4s): macro of loose brilliant-cut diamonds being nudged into a matched row
> with fine tweezers on a matte grey bench mat; each stone throws a small warm spectral
> flare; camera drifts slowly right.
>
> Shot 3 (4–6s): micro-setter's view of a rose-gold setting under a bench lamp; a stone
> is seated and a prong is burnished; tiny metal highlights bloom; rack focus from the
> tool to the stone.
>
> Shot 4 (6–8s): finished diamond piece rotating a quarter turn on a dark polished stone
> surface, light sweeping across the pavé, settling into stillness.
>
> Style: restrained luxury, documentary realism, no CGI sparkle overlays, no lens dirt,
> no text, no watermarks, no visible faces, no rapid cuts. Colour palette: champagne
> gold, warm ivory, charcoal, soft rose highlight.

## Negative prompt

> text, watermark, logo, captions, human face, fast cuts, strobing, cartoon sparkle,
> plastic-looking gems, oversaturated colour, jitter, motion blur artifacts

## After the file is delivered

1. Save as `public/videos/custom-atelier.mp4` (H.264, faststart, ≤ 6 MB if possible).
2. Add a poster frame at `public/images/new/custom-atelier-poster.jpg`.
3. In `components/home/HeroSlideshow.tsx`, update the `custom` slide's `src` and `poster`.
