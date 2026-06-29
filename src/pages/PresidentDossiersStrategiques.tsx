import { ArrowLeft, CheckCircle2, Clock4, FileText, ShieldCheck, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import {
  readFinancingRecords,
  readInternationalStatusRecords,
  readOfficialLetterRecords,
  readEmailRecords,
  updateFinancingRecord,
  updateInternationalStatusRecord,
  updateOfficialLetterRecord,
  updateEmailRecord,
  type FinancingRecord,
  type InternationalStatusRecord,
  type OfficialLetterRecord,
  type EmailRecord,
} from '../data/strategicDossiers';

const copy = {
  fr: {
    back: 'Retour',
    title: 'Dossiers Stratégiques ANATDC',
    intro: 'Tableau de bord de traçabilité complète : financements, statuts internationaux et courriers officiels.',
    warning: 'Données locales - À synchroniser avec Supabase après validation.',

    financings: 'Financements en cours',
    financingsDesc: 'Suivi des demandes auprès des bailleurs (AFD, GIZ, OCP, BMCE, PNUD, INDH).',
    funder: 'Bailleur',
    type: 'Type',
    amountRequested: 'Montant demandé',
    sendDate: 'Date envoi',
    status: 'Statut',
    nextAction: 'Prochaine action',
    notes: 'Notes',

    international: 'Statuts Internationaux',
    internationalDesc: 'Suivi des candidatures et affiliations auprès des organisations internationales.',
    name: 'Statut',
    acronym: 'Acronyme',
    deadline: 'Deadline',

    officialLetters: 'Courriers Officiels',
    officialLettersDesc: 'Suivi des démarches auprès des institutions marocaines.',
    institution: 'Institution',
    dateSubmitted: 'Date dépôt',
    dateReceived: 'Date réception',

    emails: 'Prospection Bailleurs 2026',
    emailsDesc: 'Suivi des 5 emails personnalisés envoyés aux bailleurs Tier 1 (27 juin 2026).',
    funderEmail: 'Bailleur (Email)',
    emailSubject: 'Objet de l\'email',
    dateSent: 'Date envoi',
    nextActionDate: 'Date relance (J+7)',

    saved: 'Sauvegardé',
    error: 'Erreur',
  },
  ar: {
    back: 'رجوع',
    title: 'الملفات الاستراتيجية ANATDC',
    intro: 'لوحة متابعة شاملة: التمويلات والحالات الدولية والمراسلات الرسمية.',
    warning: 'معطيات محلية - تنسيق مع Supabase بعد التحقق.',

    financings: 'التمويلات الجارية',
    financingsDesc: 'متابعة الطلبات لدى الممولين (AFD, GIZ, OCP, BMCE, PNUD, INDH).',
    funder: 'الممول',
    type: 'النوع',
    amountRequested: 'المبلغ المطلوب',
    sendDate: 'تاريخ الإرسال',
    status: 'الحالة',
    nextAction: 'الإجراء التالي',
    notes: 'ملاحظات',

    international: 'الحالات الدولية',
    internationalDesc: 'متابعة المرشحيات والانتماءات لدى المنظمات الدولية.',
    name: 'الحالة',
    acronym: 'الاختصار',
    deadline: 'الموعد النهائي',

    officialLetters: 'المراسلات الرسمية',
    officialLettersDesc: 'متابعة الإجراءات لدى المؤسسات المغربية.',
    institution: 'المؤسسة',
    dateSubmitted: 'تاريخ الإيداع',
    dateReceived: 'تاريخ الاستقبال',

    emails: 'البحث عن الممولين 2026',
    emailsDesc: 'متابعة الرسائل الشخصية الخمس المرسلة للممولين من الدرجة الأولى (27 يونيو 2026).',
    funderEmail: 'الممول (البريد)',
    emailSubject: 'موضوع الرسالة',
    dateSent: 'تاريخ الإرسال',
    nextActionDate: 'تاريخ المتابعة (ج+7)',

    saved: 'تم الحفظ',
    error: 'خطأ',
  },
};

type Lang = 'fr' | 'ar';

const statusColors: Record<string, string> = {
  // Financing statuses
  envoyé: '#6366f1',      // indigo
  réponse: '#3b82f6',     // blue
  accordé: '#10b981',     // green
  refusé: '#ef4444',      // red
  // International statuses
  obtenu: '#10b981',      // green
  prévu: '#3b82f6',       // blue
  'à faire': '#9ca3af',   // gray
  // Official letter statuses
  préparé: '#f59e0b',     // amber
  déposé: '#10b981',      // green
  'en cours': '#3b82f6',  // blue
  accepté: '#10b981',     // green
  'en attente': '#f59e0b',// amber (shared)
};

function EditableCell({
  value,
  onSave,
  type = 'text',
  statusOptions,
}: {
  value: string | number | undefined;
  onSave: (newValue: string) => void;
  type?: 'text' | 'date' | 'number' | 'select';
  statusOptions?: string[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(String(value || ''));

  const handleSave = () => {
    onSave(tempValue);
    setIsEditing(false);
  };

  if (isEditing) {
    if (type === 'select') {
      const options = statusOptions || ['envoyé', 'en attente', 'réponse', 'accordé', 'refusé'];
      return (
        <div className="editable-cell editing">
          <select value={tempValue} onChange={(e) => setTempValue(e.target.value)} onBlur={handleSave} autoFocus>
            <option value="">-</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    }
    return (
      <div className="editable-cell editing">
        <input
          type={type}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') setIsEditing(false);
          }}
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className="editable-cell" onClick={() => setIsEditing(true)}>
      {type === 'number' && value ? `${value.toLocaleString()} DH` : value || '-'}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status as keyof typeof statusColors] || '#6b7280';
  return (
    <span style={{ background: color, color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>
      {status}
    </span>
  );
}

export default function PresidentDossiersStrategiquesPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const [financings, setFinancings] = useState(readFinancingRecords());
  const [internationalStatus, setInternationalStatus] = useState(readInternationalStatusRecords());
  const [officialLetters, setOfficialLetters] = useState(readOfficialLetterRecords());
  const [emails, setEmails] = useState(readEmailRecords());

  const handleFinancingUpdate = (id: string, field: keyof FinancingRecord, value: any) => {
    const updated = financings.map((f) => (f.id === id ? { ...f, [field]: value } : f));
    setFinancings(updated);
    updateFinancingRecord(id, { [field]: value });
  };

  const handleInternationalUpdate = (id: string, field: keyof InternationalStatusRecord, value: any) => {
    const updated = internationalStatus.map((i) => (i.id === id ? { ...i, [field]: value } : i));
    setInternationalStatus(updated);
    updateInternationalStatusRecord(id, { [field]: value });
  };

  const handleOfficialUpdate = (id: string, field: keyof OfficialLetterRecord, value: any) => {
    const updated = officialLetters.map((o) => (o.id === id ? { ...o, [field]: value } : o));
    setOfficialLetters(updated);
    updateOfficialLetterRecord(id, { [field]: value });
  };

  const handleEmailUpdate = (id: string, field: keyof EmailRecord, value: any) => {
    const updated = emails.map((e) => (e.id === id ? { ...e, [field]: value } : e));
    setEmails(updated);
    updateEmailRecord(id, { [field]: value });
  };

  const isRtl = lang === 'ar';

  return (
    <section className="panel president-dossiers-page" dir={isRtl ? 'rtl' : 'ltr'}>
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={18} /> {t.back}
      </button>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <p className="privacy-note internal-warning">
        <ShieldCheck size={18} /> {t.warning}
      </p>

      {/* FINANCEMENTS */}
      <section className="dossiers-section">
        <h2>
          <FileText size={22} /> {t.financings}
        </h2>
        <p className="section-desc">{t.financingsDesc}</p>
        <div className="table-container">
          <table className="dossiers-table">
            <thead>
              <tr>
                <th>{t.funder}</th>
                <th>{t.type}</th>
                <th>{t.amountRequested}</th>
                <th>{t.sendDate}</th>
                <th>{t.status}</th>
                <th>{t.nextAction}</th>
                <th>{t.notes}</th>
              </tr>
            </thead>
            <tbody>
              {financings.map((record) => (
                <tr key={record.id}>
                  <td className="funder-cell">{record.funder}</td>
                  <td>
                    <EditableCell value={record.type} onSave={(v) => handleFinancingUpdate(record.id, 'type', v as any)} />
                  </td>
                  <td>
                    <EditableCell
                      value={record.amountRequested}
                      onSave={(v) => handleFinancingUpdate(record.id, 'amountRequested', parseInt(v) || 0)}
                      type="number"
                    />
                  </td>
                  <td>
                    <EditableCell value={record.sendDate} onSave={(v) => handleFinancingUpdate(record.id, 'sendDate', v)} type="date" />
                  </td>
                  <td>
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="action-cell">
                    <EditableCell value={record.nextAction} onSave={(v) => handleFinancingUpdate(record.id, 'nextAction', v)} />
                  </td>
                  <td className="notes-cell">
                    <EditableCell value={record.notes} onSave={(v) => handleFinancingUpdate(record.id, 'notes', v)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* STATUTS INTERNATIONAUX */}
      <section className="dossiers-section">
        <h2>
          <Clock4 size={22} /> {t.international}
        </h2>
        <p className="section-desc">{t.internationalDesc}</p>
        <div className="table-container">
          <table className="dossiers-table">
            <thead>
              <tr>
                <th>{t.name}</th>
                <th>{t.acronym}</th>
                <th>{t.status}</th>
                <th>{t.deadline}</th>
                <th>{t.notes}</th>
              </tr>
            </thead>
            <tbody>
              {internationalStatus.map((record) => (
                <tr key={record.id}>
                  <td className="funder-cell">{record.name}</td>
                  <td>{record.acronym}</td>
                  <td>
                    <StatusBadge status={record.status} />
                  </td>
                  <td>
                    <EditableCell value={record.deadline} onSave={(v) => handleInternationalUpdate(record.id, 'deadline', v)} type="date" />
                  </td>
                  <td className="notes-cell">
                    <EditableCell value={record.notes} onSave={(v) => handleInternationalUpdate(record.id, 'notes', v)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* COURRIERS OFFICIELS */}
      <section className="dossiers-section">
        <h2>
          <CheckCircle2 size={22} /> {t.officialLetters}
        </h2>
        <p className="section-desc">{t.officialLettersDesc}</p>
        <div className="table-container">
          <table className="dossiers-table">
            <thead>
              <tr>
                <th>{t.title}</th>
                <th>{t.institution}</th>
                <th>{t.status}</th>
                <th>{t.dateSubmitted}</th>
                <th>{t.dateReceived}</th>
                <th>{t.notes}</th>
              </tr>
            </thead>
            <tbody>
              {officialLetters.map((record) => (
                <tr key={record.id}>
                  <td className="funder-cell">{record.title}</td>
                  <td>{record.institution}</td>
                  <td>
                    <StatusBadge status={record.status} />
                  </td>
                  <td>
                    <EditableCell value={record.dateSubmitted} onSave={(v) => handleOfficialUpdate(record.id, 'dateSubmitted', v)} type="date" />
                  </td>
                  <td>
                    <EditableCell value={record.dateReceived} onSave={(v) => handleOfficialUpdate(record.id, 'dateReceived', v)} type="date" />
                  </td>
                  <td className="notes-cell">
                    <EditableCell value={record.notes} onSave={(v) => handleOfficialUpdate(record.id, 'notes', v)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* PROSPECTION BAILLEURS 2026 */}
      <section className="dossiers-section">
        <h2>
          <AlertCircle size={22} /> {t.emails}
        </h2>
        <p className="section-desc">{t.emailsDesc}</p>
        <div className="table-container">
          <table className="dossiers-table">
            <thead>
              <tr>
                <th>{t.funderEmail}</th>
                <th>{t.emailSubject}</th>
                <th>{t.dateSent}</th>
                <th>{t.status}</th>
                <th>{t.nextActionDate}</th>
                <th>{t.notes}</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((record) => (
                <tr key={record.id}>
                  <td className="funder-cell">{record.funder}</td>
                  <td className="action-cell">
                    <EditableCell value={record.emailSubject} onSave={(v) => handleEmailUpdate(record.id, 'emailSubject', v)} />
                  </td>
                  <td>
                    <EditableCell value={record.dateSent} onSave={(v) => handleEmailUpdate(record.id, 'dateSent', v)} type="date" />
                  </td>
                  <td>
                    <StatusBadge status={record.status} />
                  </td>
                  <td>
                    <EditableCell value={record.nextActionDate} onSave={(v) => handleEmailUpdate(record.id, 'nextActionDate', v)} type="date" />
                  </td>
                  <td className="notes-cell">
                    <EditableCell value={record.notes} onSave={(v) => handleEmailUpdate(record.id, 'notes', v)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
