const MOON_FALLBACK_TEXTURE = '/textures/moon/moon_color.jpg';
const CANVAS_VISIBLE_OPACITY = 0.6;

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
        className="relative h-[86%] w-[86%] max-h-[760px] max-w-[760px] rounded-full transition-opacity duration-1000 ease-out"
        style={{
          opacity: isCanvasVisible ? CANVAS_VISIBLE_OPACITY : 1,
          backgroundImage: `url(${MOON_FALLBACK_TEXTURE})`,
          backgroundSize: '170% 100%',
          backgroundPosition: '50% 50%',
          boxShadow: `
            inset -34px -24px 58px rgba(3,7,18,0.38),
            inset 24px 18px 52px rgba(255,255,255,0.12),
            0 0 38px rgba(118,156,255,0.15),
            0 0 120px rgba(59,130,246,0.10)
          `,
          filter: 'saturate(0.88) contrast(1.12) brightness(1.04)',
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(126deg, rgba(255,255,255,0.14), transparent 48%, rgba(3,7,18,0.26) 86%)',
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
