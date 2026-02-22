export default function AnimatedBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, #3b82f6, #6366f1)',
          top: '-100px',
          right: '-100px',
          filter: 'blur(80px)',
          mixBlendMode: 'screen',
          animation: 'blob1 20s infinite ease-in-out',
        }}
      />
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, #6366f1, #8b5cf6)',
          bottom: '-150px',
          left: '-100px',
          filter: 'blur(80px)',
          mixBlendMode: 'screen',
          animation: 'blob2 25s infinite ease-in-out',
        }}
      />
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, #06b6d4, #3b82f6)',
          bottom: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
          filter: 'blur(80px)',
          mixBlendMode: 'screen',
          animation: 'blob3 30s infinite ease-in-out',
        }}
      />
    </div>
  );
}
