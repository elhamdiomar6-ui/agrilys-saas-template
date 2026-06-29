import React from 'react';
import { LockKeyhole, CheckCircle2 } from 'lucide-react';

type PinConfirmationModalProps = {
  fullName: string;
  phone: string;
  whatsappMessage: string;
  whatsappUrl: string;
  onConfirm: () => void;
};

export default function PinConfirmationModal({ fullName, phone, whatsappMessage, whatsappUrl, onConfirm }: PinConfirmationModalProps) {
  return (
    <div className="pin-confirmation-overlay" role="presentation">
      <section
        className="pin-confirmation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pin-confirmation-title"
        aria-describedby="pin-confirmation-description"
      >
        <LockKeyhole size={34} aria-hidden="true" />
        <h2 id="pin-confirmation-title">Message WhatsApp à envoyer</h2>
        <p id="pin-confirmation-description">
          Copiez ou envoyez ce message a {fullName} via WhatsApp.
        </p>
        <div className="pin-confirmation-code" style={{ background: '#fff9e8', border: '1px solid #d4a574', borderRadius: '8px', padding: '12px', margin: '12px 0', whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: '1.6' }}>
          {whatsappMessage}
        </div>
        <div className="pin-confirmation-details">
          <span>{phone}</span>
        </div>
        <p className="pin-confirmation-warning">
          Le PIN est inclus dans ce message. Ne l'envoyez qu'une seule fois.
        </p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(whatsappMessage)}
            style={{ flex: 1, padding: '10px', background: '#E3F2FD', border: '1px solid #90CAF9', borderRadius: '4px', cursor: 'pointer' }}
          >
            Copier
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ flex: 1, padding: '10px', background: '#25D366', color: 'white', border: '1px solid #25D366', borderRadius: '4px', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            WhatsApp
          </a>
        </div>
        <button type="button" className="primary-action" onClick={onConfirm} autoFocus>
          <CheckCircle2 size={19} />
          OK
        </button>
      </section>
    </div>
  );
}
