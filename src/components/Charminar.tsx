interface CharminarProps {
  className?: string;
}

export function Charminar({ className = '' }: CharminarProps) {
  return (
    <svg viewBox="0 0 200 240" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Base platform */}
      <rect x="20" y="200" width="160" height="14" rx="2" fill="currentColor" opacity="0.9" />
      <rect x="30" y="186" width="140" height="14" rx="2" fill="currentColor" opacity="0.85" />

      {/* Central arch structure */}
      <path
        d="M70 186 L70 110 Q70 95 100 95 Q130 95 130 110 L130 186 Z"
        fill="currentColor"
        opacity="0.95"
      />
      {/* Main arch opening */}
      <path
        d="M82 186 L82 120 Q82 108 100 108 Q118 108 118 120 L118 186 Z"
        fill="#5a1520"
      />
      <path
        d="M82 186 L82 130 Q82 118 100 118 Q118 118 118 130 L118 186 Z"
        fill="currentColor"
        opacity="0.3"
      />

      {/* Side arches */}
      <path d="M30 186 L30 140 Q30 128 45 128 Q60 128 60 140 L60 186 Z" fill="currentColor" opacity="0.9" />
      <path d="M140 186 L140 140 Q140 128 155 128 Q170 128 170 140 L170 186 Z" fill="currentColor" opacity="0.9" />
      <path d="M36 186 L36 148 Q36 138 45 138 Q54 138 54 148 L54 186 Z" fill="#5a1520" />
      <path d="M146 186 L146 148 Q146 138 155 138 Q164 138 164 148 L164 186 Z" fill="#5a1520" />

      {/* Four minarets */}
      <g>
        {/* Left outer */}
        <rect x="22" y="60" width="16" height="130" rx="3" fill="currentColor" opacity="0.95" />
        <circle cx="30" cy="58" r="9" fill="currentColor" />
        <rect x="27" y="40" width="6" height="18" rx="2" fill="currentColor" />
        <circle cx="30" cy="38" r="4" fill="currentColor" />

        {/* Right outer */}
        <rect x="162" y="60" width="16" height="130" rx="3" fill="currentColor" opacity="0.95" />
        <circle cx="170" cy="58" r="9" fill="currentColor" />
        <rect x="167" y="40" width="6" height="18" rx="2" fill="currentColor" />
        <circle cx="170" cy="38" r="4" fill="currentColor" />

        {/* Left inner */}
        <rect x="60" y="80" width="14" height="110" rx="3" fill="currentColor" opacity="0.92" />
        <circle cx="67" cy="78" r="7.5" fill="currentColor" />
        <rect x="64.5" y="64" width="5" height="14" rx="2" fill="currentColor" />
        <circle cx="67" cy="62" r="3.5" fill="currentColor" />

        {/* Right inner */}
        <rect x="126" y="80" width="14" height="110" rx="3" fill="currentColor" opacity="0.92" />
        <circle cx="133" cy="78" r="7.5" fill="currentColor" />
        <rect x="130.5" y="64" width="5" height="14" rx="2" fill="currentColor" />
        <circle cx="133" cy="62" r="3.5" fill="currentColor" />
      </g>

      {/* Central dome */}
      <path d="M85 95 Q100 60 115 95 Z" fill="currentColor" />
      <ellipse cx="100" cy="92" rx="15" ry="10" fill="currentColor" opacity="0.7" />
      <rect x="97" y="50" width="6" height="14" rx="2" fill="currentColor" />
      <circle cx="100" cy="48" r="4" fill="currentColor" />

      {/* Decorative band */}
      <rect x="30" y="105" width="140" height="3" fill="currentColor" opacity="0.6" />
      <rect x="30" y="112" width="140" height="2" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

export function Lantern({ className = '' }: CharminarProps) {
  return (
    <svg viewBox="0 0 60 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="26" y="5" width="8" height="6" rx="1" fill="currentColor" opacity="0.8" />
      <rect x="22" y="11" width="16" height="4" rx="1" fill="currentColor" />
      <path d="M18 15 Q18 40 20 55 L40 55 Q42 40 42 15 Z" fill="currentColor" opacity="0.9" />
      <path d="M22 18 Q22 38 23 52 L37 52 Q38 38 38 18 Z" fill="#fbbf24" opacity="0.3" />
      <rect x="20" y="55" width="20" height="4" rx="1" fill="currentColor" />
      <rect x="24" y="59" width="12" height="8" rx="1" fill="currentColor" opacity="0.85" />
      <rect x="27" y="67" width="6" height="10" rx="1" fill="currentColor" opacity="0.7" />
      <circle cx="30" cy="35" r="6" fill="#fcd34d" opacity="0.4" />
      <circle cx="30" cy="35" r="3" fill="#fcd34d" opacity="0.7" />
    </svg>
  );
}
