// src/components/LogoIcon.jsx
// Reusable EasyFind brand icon — inline SVG shuttlecock mark
// Usage: <LogoIcon size={40} /> or <LogoIcon size={24} iconOnly />

export default function LogoIcon({ size = 40, className = '', style = {} }) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.26),
        background: 'linear-gradient(145deg, #2563EB 0%, #1D4ED8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style,
      }}
    >
      <svg
        width={Math.round(size * 0.62)}
        height={Math.round(size * 0.62)}
        viewBox="0 0 24 24"
        fill="none"
        aria-label="EasyFind shuttlecock logo"
      >
        {/* Cork / base dome */}
        <ellipse cx="8.5" cy="20" rx="3" ry="1.8" fill="white" />

        {/* Feather ring at top */}
        <ellipse
          cx="15"
          cy="7"
          rx="5.5"
          ry="2"
          fill="none"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* Feather shafts — 5 lines from cork to feather ring */}
        <line x1="8.5" y1="18.2" x2="9.5"  y2="7"  stroke="white" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="8.5" y1="18.2" x2="12"   y2="5.2" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="8.5" y1="18.2" x2="15"   y2="5"   stroke="white" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="8.5" y1="18.2" x2="18.2" y2="6"   stroke="white" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="8.5" y1="18.2" x2="20"   y2="8.2" stroke="white" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    </div>
  );
}
