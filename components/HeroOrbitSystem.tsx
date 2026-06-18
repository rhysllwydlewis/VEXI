import { motion } from 'framer-motion';

const ORBIT_NODES = [
  {
    label: 'Event Flow',
    detail: 'Events marketplace',
    className: 'left-[8%] top-[30%] sm:left-[12%] sm:top-[28%] lg:left-[16%]',
  },
  {
    label: 'Chlo',
    detail: 'Commerce platform',
    className: 'right-[9%] top-[31%] sm:right-[14%] sm:top-[26%] lg:right-[17%]',
  },
  {
    label: 'Future Platform',
    detail: 'Next launch',
    className: 'bottom-[22%] left-[14%] sm:bottom-[20%] sm:left-[22%] lg:left-[26%]',
  },
  {
    label: 'Automation',
    detail: 'Operating layer',
    className: 'bottom-[22%] right-[13%] sm:bottom-[19%] sm:right-[22%] lg:right-[27%]',
  },
] as const;

const CONSTELLATION_LINES = [
  'left-[24%] top-[35%] w-[22%] rotate-[18deg]',
  'right-[24%] top-[36%] w-[20%] -rotate-[18deg]',
  'left-[27%] bottom-[31%] w-[19%] -rotate-[26deg]',
  'right-[27%] bottom-[31%] w-[19%] rotate-[26deg]',
  'left-[39%] top-[24%] w-[22%] rotate-[4deg]',
] as const;

const SIGNAL_DOTS = [
  'left-[18%] top-[20%]',
  'left-[29%] top-[16%]',
  'right-[21%] top-[18%]',
  'right-[12%] top-[46%]',
  'left-[10%] top-[55%]',
  'left-[35%] bottom-[16%]',
  'right-[36%] bottom-[15%]',
  'right-[18%] bottom-[28%]',
] as const;

interface HeroOrbitSystemProps {
  reduceMotion: boolean;
}

export default function HeroOrbitSystem({ reduceMotion }: HeroOrbitSystemProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[4] flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      <div className="relative h-[min(76svh,760px)] w-[min(112vw,1180px)] max-w-none sm:w-[min(102vw,1280px)]">
        <div className="absolute left-1/2 top-1/2 h-[38rem] w-[38rem] max-w-[82vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(219,234,254,0.18)_0%,rgba(96,165,250,0.13)_12%,rgba(37,99,235,0.09)_24%,rgba(15,23,42,0.02)_48%,transparent_70%)] blur-sm" />
        <div className="absolute left-1/2 top-1/2 h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.20),rgba(96,165,250,0.13)_28%,rgba(99,102,241,0.06)_52%,transparent_72%)] shadow-[0_0_80px_rgba(59,130,246,0.18)]" />

        {!reduceMotion && (
          <>
            <motion.div
              className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] max-w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-300/10"
              animate={{ rotate: 360 }}
              transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute left-1/2 top-1/2 h-[25rem] w-[48rem] max-w-[96vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-indigo-300/10"
              animate={{ rotate: -360 }}
              transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute left-1/2 top-1/2 h-[16rem] w-[62rem] max-w-[106vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-cyan-300/8"
              animate={{ rotate: 360 }}
              transition={{ duration: 150, repeat: Infinity, ease: 'linear' }}
            />
          </>
        )}

        <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] max-w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.045]" />
        <div className="absolute left-1/2 top-1/2 h-[25rem] w-[48rem] max-w-[96vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-white/[0.04]" />
        <div className="absolute left-1/2 top-1/2 h-[16rem] w-[62rem] max-w-[106vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-white/[0.035]" />

        {CONSTELLATION_LINES.map((line) => (
          <span
            key={line}
            className={`absolute h-px origin-center bg-gradient-to-r from-transparent via-blue-200/16 to-transparent ${line}`}
          />
        ))}

        {SIGNAL_DOTS.map((dot, index) => (
          <span
            key={dot}
            className={`absolute h-1.5 w-1.5 rounded-full bg-blue-100/70 shadow-[0_0_18px_rgba(96,165,250,0.45)] ${dot}`}
            style={{ opacity: reduceMotion ? 0.35 : undefined, animationDelay: `${index * 0.45}s` }}
          />
        ))}

        {ORBIT_NODES.map((node, index) => (
          <motion.div
            key={node.label}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : 0.5 + index * 0.12 }}
            className={`absolute hidden rounded-2xl border border-white/10 bg-slate-950/38 px-3 py-2 text-left shadow-[0_0_28px_rgba(15,23,42,0.42)] backdrop-blur-xl sm:block ${node.className}`}
          >
            <span className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-200/90">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.8)]" />
              {node.label}
            </span>
            <span className="block text-[11px] text-slate-400">{node.detail}</span>
          </motion.div>
        ))}

        {!reduceMotion && (
          <>
            <motion.span
              className="absolute left-[18%] top-[21%] h-px w-[18rem] origin-left bg-gradient-to-r from-transparent via-blue-200/18 to-transparent"
              animate={{ opacity: [0, 0.8, 0], x: ['-8%', '12%', '28%'] }}
              transition={{ duration: 5.5, repeat: Infinity, repeatDelay: 4 }}
            />
            <motion.span
              className="absolute bottom-[21%] right-[22%] h-px w-[16rem] origin-right bg-gradient-to-r from-transparent via-cyan-200/16 to-transparent"
              animate={{ opacity: [0, 0.7, 0], x: ['12%', '-8%', '-24%'] }}
              transition={{ duration: 6.2, repeat: Infinity, repeatDelay: 5.4 }}
            />
          </>
        )}
      </div>
    </div>
  );
}
