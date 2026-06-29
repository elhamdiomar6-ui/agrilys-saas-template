import { ArrowLeft, CheckCircle2, Send, UsersRound } from 'lucide-react';
import { FormEvent, useState } from 'react';
import CardListenButton from '../components/CardListenButton';

type Lang = 'fr' | 'ar';

export default function RejoindrePage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const [submitted, setSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="panel form-panel multi-douars-page">
      <button className="back-button" type="button" onClick={onBack}><ArrowLeft size={18} /> {lang === 'ar' ? 'رجوع' : 'Retour'}</button>
      <div className="brand-mark small"><UsersRound size={28} /></div>
      <h1>{lang === 'ar' ? 'طلب انضمام دوار' : 'Rejoindre la plateforme'}</h1>
      <p className="intro">
        {lang === 'ar'
          ? 'نموذج أولي لجمع طلبات الدواوير. لا ينشر أي شيء قبل التحقق.'
          : 'Formulaire pilote pour preparer l integration progressive des douars. Rien nest publie automatiquement.'}
      </p>
      <CardListenButton text={lang === 'ar' ? 'طلب انضمام دوار. نموذج أولي لجمع طلبات الدواوير. لا ينشر أي شيء قبل التحقق.' : "Rejoindre la plateforme. Formulaire pilote pour preparer l integration progressive des douars. Rien n est publie automatiquement."} lang={lang} />

      {submitted ? (
        <div className="resident-summary">
          <CheckCircle2 size={24} />
          <strong>{lang === 'ar' ? 'تم حفظ الطلب محليا' : 'Demande conservee localement'}</strong>
          <p>{lang === 'ar' ? 'سيتم التحقق منها قبل أي نشر.' : 'Elle devra etre verifiee avant toute publication.'}</p>
        </div>
      ) : (
        <form className="form-stack" onSubmit={submit}>
          <label htmlFor="douar-input">
            {lang === 'ar' ? 'اسم الدوار' : 'Nom du douar'}
            <input id="douar-input" required name="douar" />
          </label>
          <label htmlFor="location-input">
            {lang === 'ar' ? 'الجماعة / الإقليم' : 'Commune / province'}
            <input id="location-input" required name="location" />
          </label>
          <label htmlFor="contact-input">
            {lang === 'ar' ? 'اسم المسؤول أو الجمعية' : 'Responsable ou association'}
            <input id="contact-input" required name="contact" />
          </label>
          <label htmlFor="email-input">
            Email
            <input id="email-input" required type="email" name="email" />
          </label>
          <label htmlFor="message-textarea">
            {lang === 'ar' ? 'ملاحظة داخلية' : 'Note de presentation'}
            <textarea id="message-textarea" rows={4} name="message" />
          </label>
          <button className="submit-button" type="submit"><Send size={18} /> {lang === 'ar' ? 'إرسال الطلب' : 'Envoyer la demande'}</button>
        </form>
      )}
    </section>
  );
}
