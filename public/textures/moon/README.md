# Moon Textures

This directory is reserved for optional high-resolution lunar surface textures.

The `MoonSphere` component uses a **fully procedural moon** generated at runtime
via simplex noise — no external texture files are required.

If you wish to substitute real NASA textures for an even higher-fidelity appearance:

1. Download `2k_moon.jpg` (or `8k_moon.jpg`) from:
   https://www.solarsystemscope.com/textures/
2. Place the file(s) in this directory.
3. Update `MoonSphere.tsx` to load them via `THREE.TextureLoader` instead of the
   procedural generator.

## Recommended textures

| File | Resolution | Size |
|---|---|---|
| `2k_moon.jpg` | 2048 × 1024 | ~1 MB |
| `8k_moon.jpg` | 8192 × 4096 | ~10 MB |
