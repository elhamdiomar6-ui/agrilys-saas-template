import { FormEvent, useState } from 'react';
import { LockKeyhole, Phone, ShieldCheck } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { sha256Hex } from '../../lib/crypto';

type Lang = 'fr' | 'ar';

export default function SiteLockPage({ lang, isRtl, onLanguageChange, onUnlock }: { lang: Lang; isRtl: boolean; onLanguageChange: (lang: Lang) => void; onUnlock: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isAr = lang === 'ar';
  const hasPassword = Boolean(siteConfig.siteLockPasswordHash || siteConfig.siteLockPassword);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!hasPassword) {
      setError(isAr ? 'كلمة المرور غير مهيأة بعد.' : 'Mot de passe non configuré.');
      return;
    }
    if (!password.trim()) {
      setError(isAr ? 'أدخل كلمة المرور.' : 'Entrez le mot de passe.');
      return;
    }
    setBusy(true);
    try {
      const valid = siteConfig.siteLockPasswordHash
        ? (await sha256Hex(password.trim())).toLowerCase() === siteConfig.siteLockPasswordHash.toLowerCase()
        : password.trim() === siteConfig.siteLockPassword;
      if (!valid) {
        setError(isAr ? 'كلمة المرور غير صحيحة.' : 'Mot de passe incorrect.');
        return;
      }
      onUnlock();
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="app-shell site-lock-shell" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="lang-switch" aria-label="Language switcher">
        <button className={lang === 'fr' ? 'active' : ''} aria-label="Français" title="Français" onClick={() => onLanguageChange('fr')}>FR</button>
        <button className={lang === 'ar' ? 'active' : ''} aria-label="العربية" title="العربية" onClick={() => onLanguageChange('ar')}>AR</button>
      </div>
      <section className="panel form-panel site-lock-panel">
        <div className="brand-mark small"><LockKeyhole size={28} /></div>
        <p className="badge"><ShieldCheck size={14} /> {isAr ? 'ولوج مؤقت محمي' : 'Accès temporairement protégé'}</p>
        <h1>{isAr ? 'الموقع في طور التحضير' : 'Site en préparation'}</h1>
        <p className="intro">
          {isAr
            ? 'الموقع الرسمي لجمعية أكادير نتكيدة قيد المراجعة والتحديث. الولوج مؤقتا مخصص للأعضاء المخولين.'
            : "Le site officiel de l'Association Agadir N'Tguida est en vérification et mise à jour. L'accès est temporairement réservé aux personnes autorisées."}
        </p>
        <form className="registration-form site-lock-form" onSubmit={submit}>
          <label className="field">
            <span>{isAr ? 'كلمة المرور' : 'Mot de passe'}</span>
            <div className="input-wrap">
              <LockKeyhole size={18} />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                disabled={busy || !hasPassword}
              />
            </div>
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="primary-action" type="submit" disabled={busy || !hasPassword}>
            {busy ? (isAr ? 'جاري التحقق...' : 'Vérification...') : (isAr ? 'دخول' : 'Entrer')}
          </button>
        </form>
        <p className="privacy-note">
          <Phone size={18} />
          {isAr ? 'للتواصل: ' : 'Contact : '}
          <a href={`mailto:${siteConfig.officialEmail}`}>{siteConfig.officialEmail}</a>
        </p>
      </section>
    </main>
  );
}
