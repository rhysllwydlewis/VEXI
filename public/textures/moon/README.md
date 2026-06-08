# Moon texture assets

These assets support the photoreal hero moon and its non-WebGL fallback.

| Asset | Source page | Licence / usage note | Original resolution | Deployed resolution | Processing |
| --- | --- | --- | --- | --- | --- |
| `public/models/moon.glb` | NASA / Goddard Scientific Visualization Studio CGI Moon Kit: https://svs.gsfc.nasa.gov/4720 | NASA imagery is generally available for public use; do not use NASA logos/seals or imply endorsement. | Embedded `Moon_8k_Color_v001` JPEG plus sphere geometry | 5.6 MB GLB with embedded colour map | Primary visible moon renderer; material preserves the embedded photoreal texture. |
| `moon_color.jpg` | Existing checked-in lunar surface texture from the earlier NASA-derived texture workflow | Same NASA public-use note as above; no NASA branding included. | 1024 × 512 | 1024 × 512 JPEG, ~45 KB | Reused for the non-WebGL fallback to keep this PR text-only/binary-free. Do not replace it with CSS craters or generated artwork. |
| `moon_normal.jpg` | Historical generated normal-map helper from the previous texture-based implementation | Not used by the current production renderer. | 512 × 256 | 512 × 256 | Retained only for backwards compatibility; the live moon uses the GLB. |

## Rendering notes

`components/MoonSphere.tsx` uses the GLB material's embedded colour texture for the default moon. The fallback in `components/MoonFallback.tsx` uses `moon_color.jpg` as a static real lunar texture if WebGL/model loading fails or while the canvas warms up.

Do not replace these with CSS craters, procedural noise, gradients, generated planets, or NASA logos/seals.
