import { FormEvent, useState } from 'react';
import { ArrowLeft, CheckCircle2, LockKeyhole, UserRound } from 'lucide-react';
import { useAuth } from '../../lib/auth/supabaseAuth';
import { usePublicEditorialCopy } from '../../lib/publicEditorialContent';
import { loginEditorialCopy } from '../../data/appEditorialCopies';
import AudioHelp from '../../components/AudioHelp';
import type { UserRole } from '../../types/roles';

type Lang = 'fr' | 'ar';

export default function LoginPage({ lang, onBack, onLoggedIn, onSignOut }: { lang: Lang; onBack: () => void; onLoggedIn: (role: UserRole | null) => void; onSignOut: () => Promise<void> }) {
  const auth = useAuth();
  const c = usePublicEditorialCopy('connexion', loginEditorialCopy)[lang];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const isAr = lang === 'ar';

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError(c.credentialsRequired);
      return;
    }
    setBusy(true);
    const result = await auth.signIn(email.trim(), password);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setError('');
    onLoggedIn(result.role);
  };

  const requestPasswordReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      setError(c.emailRequired);
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    const result = await auth.requestPasswordReset(email.trim());
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setNotice(c.resetSent);
  };

  const saveNewPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      setError(c.passwordTooShort);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(c.passwordMismatch);
      return;
    }
    setBusy(true);
    setError('');
    const result = await auth.updatePassword(newPassword);
    if (!result.error) await onSignOut();
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setNewPassword('');
    setConfirmPassword('');
    setNotice(c.passwordChanged);
  };

  const openForgotPassword = () => {
    setShowForgotPassword(true);
    setError('');
    setNotice('');
  };

  const returnToLogin = () => {
    setShowForgotPassword(false);
    setError('');
    setNotice('');
  };

  return (
    <section className="panel form-panel login-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {c.back}</button>
      <div className="brand-mark small"><LockKeyhole size={28} /></div>
      <h1>{auth.passwordRecovery
        ? c.recoveryTitle
        : showForgotPassword
          ? c.forgotTitle
          : c.title}</h1>
      <p className="intro">{auth.passwordRecovery
        ? c.recoveryIntro
        : showForgotPassword
          ? c.forgotIntro
          : c.intro}</p>
      <AudioHelp scriptId="connexion" pageId="connexion" remoteOnly />
      {!auth.isConfigured ? (
        <p className="error-text">
          {isAr
            ? 'Supabase غير مهيأ بعد. في الإنتاج يجب إضافة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في Vercel. محليا تستعمل .env.local فقط.'
            : 'Supabase n’est pas encore configuré. En production, ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans Vercel. En local, utilisez .env.local uniquement.'}
          {auth.configError ? <><br />{auth.configError}</> : null}
        </p>
      ) : null}
      {auth.passwordRecovery ? (
        <form className="registration-form" onSubmit={saveNewPassword}>
          <label className="field"><span>{c.newPassword}</span><div className="input-wrap"><LockKeyhole size={18} /><input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type="password" autoComplete="new-password" minLength={8} /></div></label>
          <label className="field"><span>{c.confirmPassword}</span><div className="input-wrap"><LockKeyhole size={18} /><input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" autoComplete="new-password" minLength={8} /></div></label>
          {error ? <p className="error-text" role="alert">{error}</p> : null}
          <button className="primary-action" type="submit" disabled={busy || !auth.isConfigured}>{busy ? (isAr ? 'جاري التغيير...' : 'Modification...') : c.changePassword}</button>
        </form>
      ) : auth.user ? (
        <div className="resident-summary">
          <CheckCircle2 size={22} />
          <div>
            <strong>{auth.user.email}</strong>
            <span>{isAr ? `الدور: ${auth.role || 'غير مصادق عليه'}` : `Rôle : ${auth.role || 'non validé'}`}</span>
          </div>
          <button type="button" className="secondary-action" onClick={onSignOut}>{isAr ? 'خروج' : 'Se déconnecter'}</button>
        </div>
      ) : showForgotPassword ? (
        <form className="registration-form" onSubmit={requestPasswordReset}>
          <label className="field"><span>Email</span><div className="input-wrap"><UserRound size={18} /><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" /></div></label>
          {error ? <p className="error-text" role="alert">{error}</p> : null}
          {notice ? <p className="success-text" role="status">{notice}</p> : null}
          <button className="primary-action" type="submit" disabled={busy || !auth.isConfigured}>{busy ? (isAr ? 'جاري الإرسال...' : 'Envoi...') : c.sendLink}</button>
          <button className="secondary-action" type="button" onClick={returnToLogin}>{c.backToLogin}</button>
        </form>
      ) : (
        <form className="registration-form" onSubmit={submit}>
          <label className="field"><span>Email</span><div className="input-wrap"><UserRound size={18} /><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" /></div></label>
          <label className="field"><span>{isAr ? 'كلمة المرور' : 'Mot de passe'}</span><div className="input-wrap"><LockKeyhole size={18} /><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" /></div></label>
          {error ? <p className="error-text" role="alert">{error}</p> : null}
          {notice ? <p className="success-text" role="status">{notice}</p> : null}
          <button className="primary-action" type="submit" disabled={busy || !auth.isConfigured}>{busy ? (isAr ? 'جاري الدخول...' : 'Connexion...') : c.signIn}</button>
          <button className="secondary-action" type="button" onClick={openForgotPassword}>{c.forgotButton}</button>
        </form>
      )}
    </section>
  );
}
