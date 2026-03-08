import Image from 'next/image';
import {
  fetchSvsVisualization,
  extractImageUrl,
  svsPageUrl,
} from '@/lib/nasa-svs';

interface NasaVisualizationProps {
  /** NASA SVS visualization ID, e.g. 14959 */
  id: number;
}

export default async function NasaVisualization({
  id,
}: NasaVisualizationProps) {
  const viz = await fetchSvsVisualization(id);

  // ── Fallback ──────────────────────────────────────────────────────────────
  if (!viz) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 text-center">
        <p className="text-slate-400 text-sm">
          NASA visualization could not be loaded at this time.{' '}
          <a
            href={svsPageUrl(id)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
          >
            View on NASA SVS ↗
          </a>
        </p>
      </div>
    );
  }

  const imageUrl = extractImageUrl(viz);
  const pageUrl = svsPageUrl(id);

  return (
    <article className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300">
      {/* Image */}
      {imageUrl && (
        <div className="relative w-full aspect-video bg-white/5">
          <Image
            src={imageUrl}
            alt={viz.title ?? `NASA SVS Visualization ${id}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
            priority={false}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-8">
        {/* Badge */}
        <span className="inline-block px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 mb-4">
          NASA SVS
        </span>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white leading-snug">
          {viz.title ?? `Visualization #${id}`}
        </h3>

        {/* Release date */}
        {viz.release_date && (
          <p className="text-xs text-slate-500 mt-1">
            {new Date(viz.release_date).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}

        {/* Description */}
        {viz.description && (
          <p className="text-sm text-slate-400 mt-4 leading-relaxed line-clamp-5">
            {viz.description}
          </p>
        )}

        {/* Keywords */}
        {viz.keywords && viz.keywords.length > 0 && (
          <ul className="flex flex-wrap gap-2 mt-4" aria-label="Keywords">
            {viz.keywords.slice(0, 6).map((kw) => (
              <li
                key={kw}
                className="px-2 py-0.5 rounded-full text-xs bg-white/5 border border-white/10 text-slate-400"
              >
                {kw}
              </li>
            ))}
          </ul>
        )}

        {/* Link + Attribution */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            View on NASA SVS ↗
          </a>
          <p className="text-xs text-slate-600">
            Credit: NASA&apos;s Scientific Visualization Studio
          </p>
        </div>
      </div>
    </article>
  );
}
