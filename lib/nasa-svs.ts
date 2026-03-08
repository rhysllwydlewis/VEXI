/** NASA Scientific Visualization Studio (SVS) API utilities */

const SVS_API_BASE = 'https://svs.gsfc.nasa.gov/api';
const SVS_PAGE_BASE = 'https://svs.gsfc.nasa.gov';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SvsMediaItem {
  uri?: string;
  mime_type?: string;
  width?: number;
  height?: number;
  file_size?: number;
}

export interface SvsMediaGroup {
  name?: string;
  media: SvsMediaItem[];
}

export interface SvsVisualization {
  id: number;
  title?: string;
  description?: string;
  release_date?: string;
  keywords?: string[];
  media_groups?: SvsMediaGroup[];
  /** Convenience fields sometimes present at the top level */
  image?: string;
  url?: string;
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

/**
 * Fetch a NASA SVS visualization record by its numeric ID.
 * Results are cached for 24 hours via Next.js ISR (revalidate: 86400).
 */
export async function fetchSvsVisualization(
  id: number,
): Promise<SvsVisualization | null> {
  try {
    const res = await fetch(`${SVS_API_BASE}/${id}`, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      console.error(`NASA SVS API returned ${res.status} for id ${id}`);
      return null;
    }

    const data: SvsVisualization = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to fetch NASA SVS visualization:', err);
    return null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract the best available still-image URL from an SVS record.
 * Prefers a high-resolution PNG/JPEG from the first media group that contains
 * images, falling back to any URI available, then to null.
 */
export function extractImageUrl(viz: SvsVisualization): string | null {
  // Some records surface a top-level image field directly
  if (viz.image) return viz.image;

  const groups = viz.media_groups ?? [];
  for (const group of groups) {
    const images = (group.media ?? []).filter((m) => {
      const mime = (m.mime_type ?? '').toLowerCase();
      const uri = (m.uri ?? '').toLowerCase();
      return (
        mime.startsWith('image/') ||
        uri.endsWith('.jpg') ||
        uri.endsWith('.jpeg') ||
        uri.endsWith('.png') ||
        uri.endsWith('.webp')
      );
    });

    if (images.length === 0) continue;

    // Prefer the largest image (by pixel area) if dimensions are available
    const sorted = [...images].sort((a, b) => {
      const areaA = (a.width ?? 0) * (a.height ?? 0);
      const areaB = (b.width ?? 0) * (b.height ?? 0);
      return areaB - areaA;
    });

    const chosen = sorted[0];
    if (chosen?.uri) return chosen.uri;
  }

  return null;
}

/**
 * Build the canonical SVS page URL for a given visualization ID.
 */
export function svsPageUrl(id: number): string {
  return `${SVS_PAGE_BASE}/${id}`;
}

/**
 * Strip HTML tags from a string returned by the NASA SVS API.
 * Handles the most common HTML entities and converts `<br>` to spaces.
 *
 * The output is intended for React JSX **text content** (not
 * `dangerouslySetInnerHTML`).  React escapes all text nodes before writing to
 * the DOM, so any `<…>` fragments that survive tag stripping are rendered as
 * literal characters — there is no XSS vector in this usage.
 *
 * NOTE: This is a lightweight display sanitizer for a trusted source (NASA).
 * Do not repurpose it as an XSS defence for untrusted user-generated content.
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return (
    html
      // Normalise line-breaks before stripping
      .replace(/<br\s*\/?>/gi, ' ')
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Decode named entities — &amp; is intentionally decoded LAST so that
      // double-encoded sequences like &amp;lt; resolve to &lt; (one level),
      // not to < (two levels / double-unescaping).
      // &lt; and &gt; are deliberately left as HTML entities: decoding them to
      // < / > would reintroduce angle-bracket sequences after tag stripping.
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      // Collapse whitespace
      .replace(/\s{2,}/g, ' ')
      .trim()
  );
}

/**
 * Format a raw SVS release-date string (ISO 8601 or similar) as a
 * human-readable date.  Returns null when the string is absent or unparseable.
 */
export function formatReleaseDate(dateStr: string | undefined | null): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
