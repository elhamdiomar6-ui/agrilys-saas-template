import { Play } from 'lucide-react';

type RoyalSpeechPlayerProps = {
  lang?: 'fr' | 'ar';
};

export default function RoyalSpeechPlayer({ lang = 'fr' }: RoyalSpeechPlayerProps) {
  const isAr = lang === 'ar';

  const handlePlayClick = () => {
    window.open('https://www.youtube.com/watch?v=h7Xtn4v7kQ0', '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="royal-speech-player"
      style={{
        background: 'white',
        border: '2px solid #C1272D',
        borderRadius: '12px',
        padding: '24px 20px',
        maxWidth: '380px',
        boxShadow: '0 4px 12px rgba(193, 39, 45, 0.08)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        direction: isAr ? 'rtl' : 'ltr',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(193, 39, 45, 0.12)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(193, 39, 45, 0.08)';
      }}
    >
      {/* King's Name in Arabic */}
      <h2
        style={{
          margin: '0 0 20px 0',
          fontSize: '18px',
          fontWeight: '700',
          color: '#333',
          lineHeight: '1.4',
          letterSpacing: '0.5px',
        }}
      >
        جلالة الملك محمد السادس
      </h2>

      {/* Moroccan Flag SVG */}
      <svg
        viewBox="0 0 300 200"
        width="140"
        height="93"
        style={{
          margin: '12px 0 20px 0',
          flexShrink: 0,
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
        }}
        aria-label="Moroccan flag"
      >
        {/* Red background */}
        <rect width="300" height="200" fill="#C1272D" />

        {/* Green 5-pointed star in center */}
        <g transform="translate(150, 100)">
          {/* Star path - 5-pointed star */}
          <path
            d="M 0,-60 L 14,-18 L 57,-18 L 27,16 L 41,58 L 0,24 L -41,58 L -27,16 L -57,-18 L -14,-18 Z"
            fill="#006233"
          />
        </g>
      </svg>

      {/* Arabic Quote - Italic */}
      <p
        style={{
          margin: '16px 0 12px 0',
          fontSize: '14px',
          fontStyle: 'italic',
          color: '#555',
          lineHeight: '1.6',
          fontFamily: 'Georgia, serif',
        }}
      >
        'لا مكان في المغرب، لا اليوم ولا غداً، لمغرب يسير بسرعتين'
      </p>

      {/* French Quote - Italic */}
      <p
        style={{
          margin: '0 0 20px 0',
          fontSize: '13px',
          fontStyle: 'italic',
          color: '#666',
          lineHeight: '1.6',
          fontFamily: 'Georgia, serif',
        }}
      >
        « Il n'y a de place, ni aujourd'hui, ni demain pour un Maroc avançant à deux vitesses. »
      </p>

      {/* Play Button */}
      <button
        type="button"
        onClick={handlePlayClick}
        aria-label={isAr ? 'استمع للخطاب الملكي' : 'Écouter le Discours Royal'}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: '#C1272D',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          transition: 'all 0.2s ease',
          minHeight: '44px',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = '#A41F24';
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = '#C1272D';
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLButtonElement).style.outline = '2px solid #006233';
          (e.currentTarget as HTMLButtonElement).style.outlineOffset = '2px';
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLButtonElement).style.outline = 'none';
        }}
      >
        {/* Green Star Icon */}
        <span style={{ fontSize: '18px' }}>★</span>

        {/* Play Icon */}
        <Play size={18} fill="white" />

        {/* Button Text */}
        <span style={{ fontWeight: '600' }}>
          {isAr ? 'استمع للخطاب الملكي' : 'Écouter le Discours Royal'}
        </span>
      </button>

      {/* Footer Note */}
      <p
        style={{
          margin: '12px 0 0 0',
          fontSize: '11px',
          color: '#999',
          textAlign: 'center',
        }}
      >
        {isAr ? 'يفتح في نافذة جديدة' : 'Ouvre dans un nouvel onglet'}
      </p>
    </div>
  );
}
