# Earth terraform texture

The terraform reveal is only allowed to show real satellite imagery. It never generates continent shapes, cartoon fallback colours, CSS Earths, or procedural maps.

| Asset | Source page | Licence / usage note | Original resolution | Deployed resolution | Processing |
| --- | --- | --- | --- | --- | --- |
| `earth_day.jpg` | Required local NASA Blue Marble / Blue Marble Next Generation style equirectangular texture. Recommended source: https://commons.wikimedia.org/wiki/File:Land_ocean_ice_2048.jpg or NASA Visible Earth record https://visibleearth.nasa.gov/images/57730/the-blue-marble-land-surface-ocean-color-and-sea-ice | Wikimedia metadata identifies NASA Goddard Space Flight Center imagery by Reto Stöckli and Robert Simmon and lists GFDL / CC BY-SA 3.0. Do not use NASA logos/seals or imply endorsement. | 2048 × 1024 JPEG for `Land_ocean_ice_2048.jpg` | Add as 2048 × 1024 web-optimised JPEG at `public/textures/earth/earth_day.jpg` | Not committed in this environment because the container proxy blocks binary downloads from Wikimedia/NASA. Do **not** substitute generated/procedural art. |

## Fallback behaviour

`components/MoonSphere.tsx` tries only `/textures/earth/earth_day.jpg`. If that real local texture is missing or fails to load, the terraform reveal is disabled and the photoreal moon remains visible. The code does **not** request third-party runtime textures and does **not** create procedural continents, generated colour maps, black disks, or cartoon Earth fallbacks.

## Adding the production texture

When binary downloads are available, add the real source image directly:

```bash
curl -L -o public/textures/earth/earth_day.jpg \
  https://upload.wikimedia.org/wikipedia/commons/c/cd/Land_ocean_ice_2048.jpg
```

Then verify it is a 2048 × 1024 JPEG and update the table above if you resize or recompress it.

## Swapping textures and tuning the effect

Texture paths and interaction constants live near the top of `components/MoonSphere.tsx`:

- `MOON_TEXTURE_PATH` — documented lunar colour texture path for future swaps.
- `EARTH_TEXTURE_PATH` — required local photoreal Earth map path.
- `TERRAFORM_RADIUS` — cursor reveal radius.
- `TERRAFORM_SOFTNESS` — feathered edge width.
- `TERRAFORM_DISTORTION_STRENGTH` — liquid UV distortion amount.
- `TERRAFORM_RIPPLE_STRENGTH` — ripple displacement amount.
- `TERRAFORM_RIPPLE_SPEED` — ripple animation speed.
- `TERRAFORM_FADE_SPEED` — pointer enter/leave fade speed.
- `TERRAFORM_ENABLED_ON_MOBILE` — keep `false` unless mobile performance has been tested.
