import React from 'react';
import { MindyMood } from '../types';
import { sounds } from '../utils/audio';

export type ExtendedMindyMood = MindyMood | 'sleeping' | 'giggling';

interface MindyAvatarProps {
  mood?: ExtendedMindyMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  speaking?: boolean;
  onClick?: () => void;
  className?: string;
}

export const MindyAvatar: React.FC<MindyAvatarProps> = ({
  mood = 'idle',
  size = 'md',
  speaking = false,
  onClick,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    xl: 'w-36 h-36',
  };

  const handleClick = () => {
    sounds.playMindyChirp();
    sounds.triggerHaptic(30);
    if (onClick) onClick();
  };

  return (
    <div
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center cursor-pointer select-none transition-transform duration-200 active:scale-95 ${sizeMap[size]} ${className}`}
      title="Mindy the Learning Bird — Tap to say hi!"
    >
      {/* Glow / Aura for celebration */}
      {mood === 'celebrating' && (
        <div className="absolute inset-0 rounded-full bg-amber-300/40 animate-ping" />
      )}

      {/* Sleepy z-z-Z bubbles */}
      {mood === 'sleeping' && (
        <div className="absolute -top-3 right-0 text-indigo-400 font-black text-xs animate-bounce pointer-events-none">
          z-z-Z 💤
        </div>
      )}

      {/* Mindy SVG Character */}
      <svg
        viewBox="0 0 120 120"
        className={`w-full h-full drop-shadow-md transition-all duration-300 ${
          mood === 'celebrating'
            ? 'animate-bounce'
            : mood === 'giggling'
            ? 'animate-pulse scale-105'
            : mood === 'confused'
            ? 'rotate-6'
            : mood === 'happy'
            ? '-translate-y-1'
            : ''
        }`}
      >
        <defs>
          <linearGradient id="birdBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="60%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="birdBelly" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#fed7aa" />
          </linearGradient>
          <linearGradient id="birdBeak" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>

        {/* Tail Feathers */}
        <path
          d="M20 70 C10 65, 5 78, 15 85 C18 80, 22 75, 25 74 Z"
          fill="#0284c7"
        />
        <path
          d="M16 62 C8 55, 2 68, 12 75 C15 72, 20 68, 24 67 Z"
          fill="#38bdf8"
        />

        {/* Left Wing (Back wing) */}
        <ellipse
          cx="38"
          cy="66"
          rx="14"
          ry="10"
          transform={mood === 'celebrating' ? 'rotate(-35 38 66)' : 'rotate(-10 38 66)'}
          fill="#0369a1"
        />

        {/* Main Round Body */}
        <circle cx="65" cy="62" r="40" fill="url(#birdBody)" />

        {/* Cute Warm Belly */}
        <ellipse cx="68" cy="72" rx="26" ry="24" fill="url(#birdBelly)" />

        {/* Rosy Cheeks */}
        <circle cx="45" cy="66" r="6" fill="#fb7185" opacity="0.55" />
        <circle cx="85" cy="66" r="6" fill="#fb7185" opacity="0.55" />

        {/* Head Feather Tuft / Crest */}
        <path
          d="M62 23 C60 12, 70 8, 72 20 C75 14, 82 12, 80 23 Z"
          fill="#38bdf8"
        />

        {/* Eyes based on Mood */}
        {mood === 'sleeping' ? (
          // Sleepy closed eye curves
          <g>
            <path d="M46 54 Q52 60 58 54" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M72 54 Q78 60 84 54" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        ) : mood === 'giggling' || mood === 'celebrating' || mood === 'happy' ? (
          // Happy smiling curve eyes
          <g>
            <path d="M46 54 Q52 46 58 54" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M72 54 Q78 46 84 54" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </g>
        ) : mood === 'confused' ? (
          // Swirly / confused eyes
          <g>
            <circle cx="52" cy="52" r="6" fill="white" />
            <path d="M49 52 Q52 49 55 52 Q52 55 49 52" stroke="#1e293b" strokeWidth="2.5" fill="none" />
            <circle cx="78" cy="52" r="6" fill="white" />
            <text x="74" y="56" fontSize="10" fontWeight="bold" fill="#1e293b">?</text>
          </g>
        ) : mood === 'thinking' ? (
          // Looking up thoughtfully
          <g>
            <circle cx="52" cy="52" r="7" fill="white" />
            <circle cx="54" cy="48" r="4.5" fill="#0f172a" />
            <circle cx="56" cy="46" r="1.8" fill="white" />

            <circle cx="78" cy="52" r="7" fill="white" />
            <circle cx="80" cy="48" r="4.5" fill="#0f172a" />
            <circle cx="82" cy="46" r="1.8" fill="white" />
          </g>
        ) : mood === 'surprised' ? (
          // Big wide eyes
          <g>
            <circle cx="52" cy="52" r="9" fill="white" stroke="#0f172a" strokeWidth="2" />
            <circle cx="52" cy="52" r="4.5" fill="#0f172a" />
            <circle cx="54" cy="50" r="1.8" fill="white" />

            <circle cx="78" cy="52" r="9" fill="white" stroke="#0f172a" strokeWidth="2" />
            <circle cx="78" cy="52" r="4.5" fill="#0f172a" />
            <circle cx="80" cy="50" r="1.8" fill="white" />
          </g>
        ) : (
          // Normal friendly big shiny eyes
          <g>
            <circle cx="52" cy="52" r="7.5" fill="white" />
            <circle cx="53" cy="52" r="5" fill="#0f172a" />
            <circle cx="55" cy="50" r="2.2" fill="white" />

            <circle cx="78" cy="52" r="7.5" fill="white" />
            <circle cx="79" cy="52" r="5" fill="#0f172a" />
            <circle cx="81" cy="50" r="2.2" fill="white" />
          </g>
        )}

        {/* Orange Beak */}
        {speaking || mood === 'surprised' ? (
          <polygon points="60,57 70,57 65,71" fill="url(#birdBeak)" />
        ) : mood === 'sleeping' ? (
          <polygon points="60,61 70,61 65,66" fill="url(#birdBeak)" />
        ) : (
          <polygon points="60,59 70,59 65,68" fill="url(#birdBeak)" />
        )}

        {/* Right Wing (Front wing) */}
        <path
          d={
            mood === 'celebrating'
              ? 'M82 62 C100 45, 108 55, 96 74 C90 70, 84 66, 82 62 Z'
              : mood === 'thinking'
              ? 'M76 68 C88 64, 88 56, 75 58 Z'
              : 'M78 65 C95 65, 95 82, 78 82 Z'
          }
          fill="#0284c7"
          className="transition-all duration-300"
        />

        {/* Feet / Little Claws */}
        <path d="M52 98 L48 108 M52 98 L53 108 M52 98 L58 107" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
        <path d="M78 98 L74 108 M78 98 L79 108 M78 98 L84 107" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />

        {/* Thought / Confused bubble symbol */}
        {mood === 'thinking' && (
          <g transform="translate(88, 12)">
            <circle cx="8" cy="8" r="7" fill="#fbbf24" opacity="0.9" />
            <text x="5" y="12" fontSize="11" fontWeight="bold" fill="#78350f">💡</text>
          </g>
        )}
        {mood === 'celebrating' && (
          <g transform="translate(10, 10)">
            <text x="0" y="14" fontSize="16">✨</text>
            <text x="80" y="14" fontSize="16">🎉</text>
          </g>
        )}
      </svg>
    </div>
  );
};
