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
          opacity: isCanvasVisible ? 0.2 : 1,
          backgroundImage: `
            radial-gradient(circle at 68% 25%, rgba(245,248,255,0.5) 0 4%, transparent 9%),
            radial-gradient(circle at 36% 34%, rgba(8,12,24,0.30) 0 7%, transparent 12%),
            radial-gradient(circle at 58% 62%, rgba(8,12,24,0.24) 0 5%, transparent 11%),
            radial-gradient(circle at 30% 72%, rgba(255,255,255,0.22) 0 3%, transparent 9%),
            radial-gradient(circle at 30% 28%, rgba(248,251,255,1) 0%, rgba(214,224,242,0.92) 30%, rgba(134,151,184,0.74) 58%, rgba(48,61,92,0.76) 82%, rgba(16,23,42,0.88) 100%),
            url(${MOON_COLOR_TEXTURE})
          `,
          backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'screen, multiply, multiply, screen, soft-light, luminosity',
          boxShadow: `
            inset -46px -34px 78px rgba(3,7,18,0.66),
            inset 34px 24px 64px rgba(255,255,255,0.16),
            0 0 38px rgba(118,156,255,0.20),
            0 0 120px rgba(59,130,246,0.14)
          `,
          filter: 'saturate(0.9) contrast(1.08) brightness(1.08)',
        }}
      >
        <div
          className="absolute inset-[-3%] rounded-full"
          style={{
            background:
              'radial-gradient(circle at 28% 22%, rgba(255,255,255,0.34), transparent 20%), radial-gradient(circle at 74% 70%, rgba(2,6,23,0.48), transparent 44%)',
            mixBlendMode: 'screen',
          }}
        />
        <div
          className="absolute inset-[-1px] rounded-full"
          style={{
            background: 'linear-gradient(128deg, rgba(255,255,255,0.2), transparent 46%, rgba(3,7,18,0.48) 82%)',
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
