import { useEffect, useState, useCallback } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  minDisplayTime?: number;
}

export function SplashScreen({ onComplete, minDisplayTime = 2800 }: SplashScreenProps) {
  const [phase, setPhase] = useState<'entering' | 'visible' | 'exiting' | 'done'>('entering');

  const startExit = useCallback(() => {
    setPhase('exiting');
    setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 800);
  }, [onComplete]);

  useEffect(() => {
    // Phase timing
    const enterTimer = setTimeout(() => setPhase('visible'), 100);
    const exitTimer = setTimeout(startExit, minDisplayTime);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [minDisplayTime, startExit]);

  if (phase === 'done') return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden transition-opacity duration-700 ${
        phase === 'exiting' ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(165deg, #0d1f12 0%, #132819 35%, #0f2318 65%, #091510 100%)',
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-0"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              background: 'radial-gradient(circle, rgba(184,150,92,0.6) 0%, transparent 70%)',
              animation: phase !== 'entering' ? `particle-float ${8 + Math.random() * 4}s ease-in-out infinite` : 'none',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      {/* Radial glow behind main content */}
      <div
        className={`absolute w-[600px] h-[600px] rounded-full transition-all duration-[2000ms] ease-out ${
          phase === 'entering' ? 'opacity-0 scale-50' : phase === 'exiting' ? 'opacity-0 scale-150' : 'opacity-100 scale-100'
        }`}
        style={{
          background: 'radial-gradient(circle, rgba(26,107,74,0.15) 0%, rgba(26,107,74,0.05) 40%, transparent 70%)',
        }}
      />

      {/* Islamic geometric pattern - outer ring */}
      <div
        className={`absolute transition-all duration-[1800ms] ease-out ${
          phase === 'entering' ? 'opacity-0 scale-75 rotate-[-30deg]' : phase === 'exiting' ? 'opacity-0 scale-110 rotate-[15deg]' : 'opacity-100 scale-100 rotate-0'
        }`}
        style={{ transitionDelay: '200ms' }}
      >
        <svg width="420" height="420" viewBox="0 0 420 420" className="drop-shadow-2xl">
          {/* Outer octagonal frame */}
          <g className="stroke-[#1a6b4a]/40" strokeWidth="1" fill="none">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <line
                key={i}
                x1="210"
                y1="30"
                x2="210"
                y2="390"
                transform={`rotate(${angle} 210 210)`}
                className={phase !== 'entering' ? 'animate-line-draw' : ''}
                style={{
                  strokeDasharray: '360',
                  strokeDashoffset: phase === 'entering' ? '360' : '0',
                  transition: 'stroke-dashoffset 1.5s ease-out',
                  transitionDelay: `${i * 80}ms`,
                }}
              />
            ))}
          </g>

          {/* Inner geometric star pattern */}
          <g className="stroke-[#b8965c]/50" strokeWidth="0.75" fill="none">
            {[0, 30, 60, 90, 120, 150].map((angle, i) => (
              <polygon
                key={i}
                points="210,80 240,160 320,160 255,210 280,290 210,245 140,290 165,210 100,160 180,160"
                transform={`rotate(${angle} 210 210)`}
                style={{
                  strokeDasharray: '800',
                  strokeDashoffset: phase === 'entering' ? '800' : '0',
                  transition: 'stroke-dashoffset 2s ease-out',
                  transitionDelay: `${400 + i * 100}ms`,
                }}
              />
            ))}
          </g>

          {/* Decorative circles */}
          {[180, 150, 120, 90].map((r, i) => (
            <circle
              key={i}
              cx="210"
              cy="210"
              r={r}
              className="stroke-[#1a6b4a]/20"
              strokeWidth="0.5"
              fill="none"
              style={{
                strokeDasharray: `${2 * Math.PI * r}`,
                strokeDashoffset: phase === 'entering' ? `${2 * Math.PI * r}` : '0',
                transition: 'stroke-dashoffset 1.8s ease-out',
                transitionDelay: `${300 + i * 150}ms`,
              }}
            />
          ))}
        </svg>
      </div>

      {/* Central content container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* App Logo */}
        <div
          className={`transition-all duration-1000 ease-out ${
            phase === 'entering' ? 'opacity-0 scale-90 translate-y-4' : phase === 'exiting' ? 'opacity-0 scale-110 -translate-y-4' : 'opacity-100 scale-100 translate-y-0'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <div
            className={`w-48 sm:w-56 md:w-64 mx-auto ${phase !== 'entering' ? 'animate-logo-glow' : ''}`}
            style={{ aspectRatio: '1.8' }}
          >
            <img
              src="/quran/quran-logo.png"
              alt="Quran"
              className="w-full h-full object-contain drop-shadow-2xl"
              style={{
                filter: 'drop-shadow(0 4px 20px rgba(184,150,92,0.4))',
              }}
            />
          </div>
          <p
            className="text-xs tracking-[0.5em] uppercase text-[#8b9a8b] font-light text-center mt-3"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Word by Word
          </p>
        </div>

        {/* Bismillah */}
        <div
          className={`mt-10 transition-all duration-1000 ease-out ${
            phase === 'entering' ? 'opacity-0 scale-95' : phase === 'exiting' ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          }`}
          style={{ transitionDelay: '800ms' }}
        >
          <p
            className="text-2xl sm:text-3xl text-[#c9b896] text-center leading-relaxed"
            style={{
              fontFamily: "'Amiri', 'Traditional Arabic', serif",
              direction: 'rtl',
              textShadow: '0 2px 15px rgba(184,150,92,0.2)',
            }}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </div>

        {/* Decorative divider */}
        <div
          className={`mt-8 flex items-center gap-4 transition-all duration-1000 ease-out ${
            phase === 'entering' ? 'opacity-0 w-0' : phase === 'exiting' ? 'opacity-0' : 'opacity-100 w-full'
          }`}
          style={{ transitionDelay: '1000ms' }}
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#1a6b4a]/40 to-transparent" />
          <svg width="20" height="20" viewBox="0 0 20 20" className="text-[#b8965c]/60">
            <polygon points="10,2 12,8 18,8 13,12 15,18 10,14 5,18 7,12 2,8 8,8" fill="currentColor" />
          </svg>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#1a6b4a]/40 to-transparent" />
        </div>

        {/* Loading indicator */}
        <div
          className={`mt-10 transition-all duration-700 ${
            phase === 'entering' ? 'opacity-0' : phase === 'exiting' ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ transitionDelay: '1200ms' }}
        >
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#b8965c]/60"
                style={{
                  animation: phase === 'visible' ? 'pulse-dot 1.4s ease-in-out infinite' : 'none',
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom decorative border */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 transition-all duration-1000 ${
          phase === 'entering' ? 'opacity-0 scale-x-0' : phase === 'exiting' ? 'opacity-0' : 'opacity-100 scale-x-100'
        }`}
        style={{
          background: 'linear-gradient(90deg, transparent 0%, #1a6b4a 20%, #b8965c 50%, #1a6b4a 80%, transparent 100%)',
          transitionDelay: '1400ms',
        }}
      />

      {/* CSS Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cormorant+Garamond:wght@300;400;500&display=swap');

        @keyframes particle-float {
          0%, 100% {
            opacity: 0;
            transform: translateY(0) scale(0.5);
          }
          10% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.4;
            transform: translateY(-30px) scale(1);
          }
          90% {
            opacity: 0.6;
          }
        }

        @keyframes pulse-dot {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes soft-glow {
          0%, 100% {
            filter: drop-shadow(0 0 8px rgba(184,150,92,0.3));
          }
          50% {
            filter: drop-shadow(0 0 16px rgba(184,150,92,0.6));
          }
        }

        .animate-soft-glow {
          animation: soft-glow 3s ease-in-out infinite;
        }

        @keyframes logo-glow {
          0%, 100% {
            filter: drop-shadow(0 4px 20px rgba(184,150,92,0.4));
          }
          50% {
            filter: drop-shadow(0 4px 30px rgba(184,150,92,0.6)) drop-shadow(0 0 40px rgba(26,107,74,0.3));
          }
        }

        .animate-logo-glow {
          animation: logo-glow 3s ease-in-out infinite;
        }

        @keyframes line-draw {
          to {
            stroke-dashoffset: 0;
          }
        }

        .animate-line-draw {
          animation: line-draw 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
