export default function MoonPlaceholder() {
  return (
    <div
      aria-hidden="true"
      className="w-full h-full rounded-full"
      style={{
        background:
          'radial-gradient(circle at 35% 40%, #3a3a3a, #1a1a1a 60%, #0d0d0d)',
        animation: 'moonPulse 3s ease-in-out infinite',
      }}
    />
  );
}
