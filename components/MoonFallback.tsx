const MOON_FALLBACK_TEXTURE = '/textures/moon/moon_color.jpg';
const CANVAS_VISIBLE_OPACITY = 0;

interface MoonFallbackProps {
  isCanvasVisible?: boolean;
}

export default function MoonFallback({ isCanvasVisible = false }: MoonFallbackProps) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-visible"
      aria-hidden="true"
      style={{ zIndex: 1 }}
    >
      <div
        className="relative h-[86%] w-[86%] max-h-[760px] max-w-[760px] rounded-full transition-opacity duration-700 ease-out"
        style={{
          // Loading and non-WebGL safety layer only. The WebGL moon owns the final state.
          opacity: isCanvasVisible ? CANVAS_VISIBLE_OPACITY : 1,
          backgroundColor: '#8f96a3',
          backgroundImage: `url(${MOON_FALLBACK_TEXTURE})`,
          backgroundSize: '180% 100%',
          backgroundPosition: '53% 50%',
          boxShadow: `
            inset -22px -18px 44px rgba(3,7,18,0.24),
            inset 16px 12px 36px rgba(255,255,255,0.10),
            0 0 34px rgba(118,156,255,0.13),
            0 0 110px rgba(59,130,246,0.09)
          `,
          filter: 'grayscale(0.12) saturate(0.92) contrast(1.18) brightness(1.08)',
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 48% 42%, transparent 0%, rgba(3,7,18,0.04) 58%, rgba(3,7,18,0.20) 100%)',
          }}
        />
        <div
          className="absolute inset-[-4%] rounded-full"
          style={{
            border: '1px solid rgba(186,207,255,0.12)',
            boxShadow: '0 0 30px rgba(147,197,253,0.14)',
          }}
        />
      </div>
    </div>
  );
}
