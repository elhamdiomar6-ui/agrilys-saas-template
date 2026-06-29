import { ArrowLeft, KeyRound, Phone, ShieldCheck } from 'lucide-react';
import { FormEvent, useState } from 'react';
import AudioHelp from '../components/AudioHelp';
import { useAuth } from '../lib/auth/supabaseAuth';

type Lang = 'fr' | 'ar';

export default function HabitantLoginPage({
  lang,
  onBack,
  onLoggedIn,
}: {
  lang: Lang;
  onBack: () => void;
  onLoggedIn: () => void;
}) {
  const auth = useAuth();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isAr = lang === 'ar';

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!phone.trim() || !/^\d{4}$/.test(pin)) {
      setError(isAr ? 'دخل رقم الهاتف وكود من 4 أرقام.' : 'Saisissez le téléphone et le PIN à 4 chiffres.');
      return;
    }
    setBusy(true);
    setError('');
    const result = await auth.signInHabitant(phone, pin);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.role !== 'habitant' && result.role !== 'adherent' && result.role !== 'soutien') {
      await auth.signOut();
      setError(isAr ? 'هاد الحساب ماشي حساب ساكن.' : 'Ce compte n’est pas un compte habitant.');
      return;
    }
    onLoggedIn();
  };

  return (
    <main role="main" className="panel form-panel habitant-login-page">
      <button className="back-button" type="button" onClick={onBack}>
        <ArrowLeft size={18} /> {isAr ? 'رجوع' : 'Retour'}
      </button>
      <div className="brand-mark small"><ShieldCheck size={28} /></div>
      <h1>{isAr ? 'دخول الساكن' : 'Connexion habitant'}</h1>
      <p className="intro">
        {isAr
          ? 'دخل رقم الهاتف والكود اللي عطاك المكتب.'
          : 'Saisissez votre numéro et le code PIN transmis par le Bureau.'}
      </p>
      <AudioHelp scriptId="connexion" />

      <form className="registration-form habitant-login-form" onSubmit={submit}>
        <label className="field" htmlFor="phone-input">
          <span>{isAr ? 'رقم الهاتف' : 'Numéro de téléphone'}</span>
          <div className="input-wrap">
            <Phone size={20} />
            <input
              id="phone-input"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+212 6..."
            />
          </div>
        </label>
        <label className="field" htmlFor="pin-input">
          <span>{isAr ? 'الكود المؤقت' : 'Code PIN temporaire'}</span>
          <div className="input-wrap">
            <KeyRound size={20} />
            <input
              id="pin-input"
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{4}"
              maxLength={4}
              className="pin-input"
            />
          </div>
        </label>
        {error ? <p className="error-text" role="alert">{error}</p> : null}
        <button className="primary-action" type="submit" disabled={busy || !auth.isConfigured}>
          {busy ? (isAr ? 'جاري الدخول...' : 'Connexion...') : (isAr ? 'دخول' : 'Se connecter')}
        </button>
      </form>

      <p className="privacy-note">
        <Phone size={18} />
        {isAr
          ? 'أول دخول أو الكود سالا؟ تاصل بالمكتب.'
          : 'Première connexion ou PIN expiré ? Contactez le Bureau.'}
      </p>
    </main>
  );
}
