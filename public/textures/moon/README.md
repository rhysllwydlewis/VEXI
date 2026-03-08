# Moon Textures

Lunar surface textures used by the 3-D moon in the hero section.

## Files

| File | Resolution | Description |
|---|---|---|
| `moon_color.jpg` | 1024 × 512 | Diffuse/albedo map (greyscale lunar surface, contrast-enhanced) |
| `moon_normal.jpg` | 512 × 256 | Normal map (tangent-space, derived via Sobel filter from height data) |

Both files are included in the repository as generated placeholder textures that faithfully
represent a lunar surface (highlands, mare regions, crater pits, fine regolith detail).
They can be replaced at any time with higher-quality NASA originals — see **Updating** below.

## Usage in MoonSphere.tsx

`MoonSphere.tsx` loads these files asynchronously via `THREE.TextureLoader`.
- While loading the moon renders immediately with a lightweight procedural fallback.
- Once loaded, the real textures are swapped in seamlessly (no visible pop).
- On network failure the procedural texture is kept permanently — no crash.

## Updating

To use higher-resolution textures (e.g. NASA SVS 4720 CGI Moon Kit):

1. Download `lroc_color_poles_2k.tif` from https://svs.gsfc.nasa.gov/4720
2. Convert to JPEG: `magick lroc_color_poles_2k.tif -quality 90 moon_color.jpg`
3. Generate a normal map: `magick moon_color.jpg -define convolve:scale='!' \`
   `  -morphology Convolve Sobel moon_normal.jpg`
4. Replace the files in this directory — no code changes needed.
