# Moon Textures

Real NASA/USGS lunar surface textures derived from the LROC WAC (Wide Angle Camera) mosaic
— the same imagery used in the Three.js official examples and trusted by millions of WebGL apps.

## Files

| File | Resolution | Description |
|---|---|---|
| `moon_color.jpg` | 1024 × 512 | Diffuse/albedo map (greyscale lunar surface, contrast-enhanced) |
| `moon_normal.jpg` | 512 × 256 | Normal map (tangent-space, derived via Sobel filter from height data) |

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
