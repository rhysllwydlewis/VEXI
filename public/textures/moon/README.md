# Moon Textures

Lunar surface textures previously used by the 3-D moon in the hero section.

> **Note:** `MoonSphere.tsx` now loads the NASA LRO GLB model from
> `/public/models/moon.glb` directly via `useGLTF`. The JPEG texture files in
> this directory (`moon_color.jpg`, `moon_normal.jpg`) are no longer loaded at
> runtime and are kept only as reference assets.

## Files

| File | Resolution | Description |
|---|---|---|
| `moon_color.jpg` | 1024 × 512 | Diffuse/albedo map (greyscale lunar surface, contrast-enhanced) |
| `moon_normal.jpg` | 512 × 256 | Normal map (tangent-space, derived via Sobel filter from height data) |

## Model

The live rendering uses `/public/models/moon.glb` (NASA LRO 8k moon model,
~5.7 MB). PBR materials in the GLB are adjusted at runtime (metalness → 0,
roughness → 1) to render correctly without an environment map.
