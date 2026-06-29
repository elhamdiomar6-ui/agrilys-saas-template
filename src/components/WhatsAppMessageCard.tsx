import React from 'react';

type WhatsAppMessageCardProps = {
  message: string;
  url: string;
  phone: string;
};

export default function WhatsAppMessageCard({ message, url, phone }: WhatsAppMessageCardProps) {
  return (
    <div className="generated-pin-card whatsapp-message-card" role="status">
      <span>Message WhatsApp</span>
      <div className="whatsapp-message-preview" style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '12px', margin: '8px 0', whiteSpace: 'pre-wrap', fontSize: '13px' }}>
        {message}
      </div>
      <small>{phone}</small>
      <em>Copier ou envoyer via WhatsApp</em>
      <div className="whatsapp-actions" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(message)}
          style={{ flex: 1, padding: '10px', background: '#E3F2FD', border: '1px solid #90CAF9', borderRadius: '4px', cursor: 'pointer' }}
        >
          Copier
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ flex: 1, padding: '10px', background: '#25D366', color: 'white', border: '1px solid #25D366', borderRadius: '4px', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}
