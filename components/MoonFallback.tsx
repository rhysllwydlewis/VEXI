const MOON_COLOR_TEXTURE = '/textures/moon/moon_color.jpg';

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
          opacity: isCanvasVisible ? 0.18 : 1,
          backgroundImage: `
            radial-gradient(circle at 68% 25%, rgba(245,248,255,0.5) 0 4%, transparent 9%),
            radial-gradient(circle at 36% 34%, rgba(8,12,24,0.42) 0 7%, transparent 12%),
            radial-gradient(circle at 58% 62%, rgba(8,12,24,0.34) 0 5%, transparent 11%),
            radial-gradient(circle at 30% 72%, rgba(255,255,255,0.22) 0 3%, transparent 9%),
            radial-gradient(circle at 30% 28%, rgba(238,243,255,0.98) 0%, rgba(200,211,232,0.86) 28%, rgba(104,122,154,0.65) 55%, rgba(29,39,62,0.86) 78%, rgba(5,8,17,0.95) 100%),
            url(${MOON_COLOR_TEXTURE})
          `,
          backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'screen, multiply, multiply, screen, soft-light, luminosity',
          boxShadow: `
            inset -58px -40px 90px rgba(3,7,18,0.88),
            inset 34px 24px 64px rgba(255,255,255,0.16),
            0 0 38px rgba(118,156,255,0.20),
            0 0 120px rgba(59,130,246,0.14)
          `,
          filter: 'saturate(0.82) contrast(1.12)',
        }}
      >
        <div
          className="absolute inset-[-3%] rounded-full"
          style={{
            background:
              'radial-gradient(circle at 28% 22%, rgba(255,255,255,0.32), transparent 20%), radial-gradient(circle at 74% 70%, rgba(2,6,23,0.75), transparent 44%)',
            mixBlendMode: 'screen',
          }}
        />
        <div
          className="absolute inset-[-1px] rounded-full"
          style={{
            background: 'linear-gradient(128deg, rgba(255,255,255,0.18), transparent 42%, rgba(3,7,18,0.74) 78%)',
          }}
        />
        <div
          className="absolute inset-[-5%] rounded-full"
          style={{
            border: '1px solid rgba(186,207,255,0.20)',
            boxShadow: '0 0 34px rgba(147,197,253,0.26)',
          }}
        />
      </div>
    </div>
  );
}
