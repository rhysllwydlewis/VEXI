const MOON_FALLBACK_TEXTURE = '/textures/moon/moon_color.jpg';

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
          opacity: isCanvasVisible ? 0 : 1,
          backgroundImage: `url(${MOON_FALLBACK_TEXTURE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: `
            inset -48px -34px 86px rgba(3,7,18,0.62),
            inset 26px 18px 58px rgba(255,255,255,0.10),
            0 0 36px rgba(118,156,255,0.14),
            0 0 118px rgba(59,130,246,0.10)
          `,
          filter: 'saturate(0.82) contrast(1.04) brightness(0.96)',
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(126deg, rgba(255,255,255,0.14), transparent 46%, rgba(3,7,18,0.48) 84%)',
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
