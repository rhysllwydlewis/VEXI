# Moon texture assets

These assets support the visible WebGL hero moon and its non-WebGL/loading fallback.

| Asset | Source page | Licence / usage note | Original resolution | Deployed resolution | Processing |
| --- | --- | --- | --- | --- | --- |
| `moon_color.jpg` | Existing checked-in lunar surface texture from the earlier NASA-derived texture workflow | Same NASA public-use note as above; no NASA branding included. | 1024 × 512 | 1024 × 512 JPEG, ~45 KB | Primary visible moon texture for `components/MoonSphere.tsx` and the static fallback in `components/MoonFallback.tsx`. |
| `moon_normal.jpg` | Historical generated normal-map helper from the previous texture-based implementation | Not used by the current production renderer. | 512 × 256 | 512 × 256 | Retained only for backwards compatibility. |
| `public/models/moon.glb` | NASA / Goddard Scientific Visualization Studio CGI Moon Kit: https://svs.gsfc.nasa.gov/4720 | NASA imagery is generally available for public use; do not use NASA logos/seals or imply endorsement. | Embedded `Moon_8k_Color_v001` JPEG plus sphere geometry | 5.6 MB GLB with embedded colour map | Retained as a reference/legacy model asset, but the current live hero does not depend on GLB material loading. |

## Rendering notes

`components/MoonSphere.tsx` renders a controlled React Three Fiber sphere using `moon_color.jpg` directly, with shader-based contrast and capped limb shading so the moon cannot collapse into a black disk. The fallback in `components/MoonFallback.tsx` uses the same lunar texture as a static safety layer while WebGL warms up or if WebGL fails.

Do not replace these with CSS craters, procedural noise, generated planets, or NASA logos/seals.
