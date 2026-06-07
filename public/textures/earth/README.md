# Earth terraform texture

The terraform shader looks for an optional Earth colour texture at:

```txt
public/textures/earth/earth_color.jpg
```

No binary Earth image is committed in this repo because the PR tooling used for this project rejects binary-file diffs. `components/MoonSphere.tsx` therefore defaults to a lightweight runtime-generated CanvasTexture fallback so the hover reveal works without requesting a missing binary asset.

## Adding a production Earth texture

If you want a more realistic production texture, place a web-optimised equirectangular JPEG at `public/textures/earth/earth_color.jpg` outside this PR flow or in a deployment asset step, then set `USE_OPTIONAL_EARTH_TEXTURE` in `components/MoonSphere.tsx` to `true`.

Recommended source/license:

- Public-domain NASA/Blue Marble style imagery, or another texture with clear public website usage rights.
- Keep it to 1024px or 2048px wide for hero performance.
- Avoid huge uncompressed files.

## Tuning the effect

Terraform controls live near the top of `components/MoonSphere.tsx`:

- `TERRAFORM_RADIUS` — circular reveal size around the cursor.
- `TERRAFORM_SOFTNESS` — feathered edge width.
- `TERRAFORM_DISTORTION_STRENGTH` — procedural liquid UV wobble intensity.
- `TERRAFORM_RIPPLE_STRENGTH` / `TERRAFORM_RIPPLE_SPEED` — edge ripple amount and animation speed.
- `TERRAFORM_ENABLED_ON_MOBILE` — keep disabled by default so coarse/touch pointers do not run hover tracking.

The shader uses screen-space cursor coordinates for the mask, then distorts only the Earth overlay UVs inside/near that soft circular mask. Reduced-motion users keep the normal moon without animated liquid ripples.
