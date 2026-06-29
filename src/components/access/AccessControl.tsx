import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAuth } from '../../lib/auth/supabaseAuth';
import { canAccessRoute } from '../../lib/permissions';
import { siteConfig } from '../../config/site';
import LoginPage from '../../pages/auth/LoginPage';
import type { RoutePath, UserRole } from '../../types/roles';

export type TextBundle = { [K in string]: string } & { supportDouar: string };

export function ProtectedInternalRoute({ t, title, route, currentRole, onBack, children }: { t: TextBundle; title: string; route: RoutePath; currentRole: UserRole; onBack: () => void; children: ReactNode }) {
  const auth = useAuth();
  const demoInternalAccess = import.meta.env.DEV && (siteConfig.internalModulesEnabled || siteConfig.demoPresentation);
  const roleCanAccess = canAccessRoute(route, currentRole);
  if (!demoInternalAccess && auth.loading) {
    return <LoadingAccessPanel t={t} title={title} onBack={onBack} />;
  }
  if (!demoInternalAccess && !auth.isConfigured) {
    return <InternalAccessReserved t={t} title={title} onBack={onBack} />;
  }
  if (!demoInternalAccess && !auth.user) {
    return (
      <LoginPage
        lang={document.documentElement.lang === 'ar' ? 'ar' : 'fr'}
        onBack={onBack}
        onLoggedIn={() => window.location.reload()}
        onSignOut={auth.signOut}
      />
    );
  }
  if (!demoInternalAccess && !roleCanAccess) {
    return <AccessDenied t={t} title={title} onBack={onBack} />;
  }
  return <>{children}</>;
}

function LoadingAccessPanel({ t, title, onBack }: { t: TextBundle; title: string; onBack: () => void }) {
  const isAr = t.back === 'رجوع';
  return (
    <section className="panel form-panel access-denied-panel">
      <div className="brand-mark small"><LockKeyhole size={28} /></div>
      <h1>{isAr ? 'التحقق من الولوج' : 'Vérification accès'}</h1>
      <p className="place">{title}</p>
      <p className="intro">{isAr ? 'تحميل الجلسة الآمنة...' : 'Chargement de la session sécurisée...'}</p>
      <button className="primary-action" onClick={onBack}>{t.back}</button>
    </section>
  );
}

export function LoginRequiredPanel({ t, title, onBack }: { t: TextBundle; title: string; onBack: () => void }) {
  const isAr = t.back === 'رجوع';
  return (
    <section className="panel form-panel access-denied-panel">
      <div className="brand-mark small"><LockKeyhole size={28} /></div>
      <h1>{isAr ? 'تسجيل الدخول مطلوب' : 'Connexion requise'}</h1>
      <p className="place">{title}</p>
      <p className="intro">{isAr ? 'سجل الدخول بحساب مكتب أو رئيس مصادق عليه.' : 'Connectez-vous avec un compte Bureau ou Président validé.'}</p>
      <div className="home-actions">
        <button className="primary-action" onClick={() => { window.history.replaceState(null, '', '/login'); window.location.reload(); }}>{isAr ? 'فتح /login' : 'Ouvrir /login'}</button>
        <button className="secondary-action" onClick={onBack}>{t.back}</button>
      </div>
    </section>
  );
}

function InternalAccessReserved({ t, title, onBack }: { t: TextBundle; title: string; onBack: () => void }) {
  return (
    <section className="panel form-panel access-denied-panel">
      <div className="brand-mark small"><LockKeyhole size={28} /></div>
      <h1>{t.internalReservedTitle}</h1>
      <p className="place">{title}</p>
      <p className="intro">{t.internalReservedDesc}</p>
      {import.meta.env.DEV ? <p className="privacy-note"><ShieldCheck size={18} /> {t.localDemoAccess}</p> : null}
      <button className="primary-action" onClick={onBack}>{t.back}</button>
    </section>
  );
}

function AccessDenied({ t, title, onBack }: { t: TextBundle; title: string; onBack: () => void }) {
  return (
    <section className="panel form-panel access-denied-panel">
      <div className="brand-mark small"><LockKeyhole size={28} /></div>
      <h1>{t.accessDeniedTitle}</h1>
      <p className="place">{title}</p>
      <p className="intro">{t.accessDeniedDesc}</p>
      <p className="privacy-note"><ShieldCheck size={18} /> {t.accessDeniedNote}</p>
      <button className="primary-action" onClick={onBack}>{t.back}</button>
    </section>
  );
}

export function BureauModuleLocked({ t, title, onBack }: { t: TextBundle; title: string; onBack: () => void }) {
  return (
    <section className="panel form-panel">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><LockKeyhole size={28} /></div>
      <h1>{t.bureauLockedTitle}</h1>
      <p className="place">{title}</p>
      <p className="intro">{t.bureauLockedDesc}</p>
      <button className="primary-action" onClick={onBack}>{t.back}</button>
    </section>
  );
}

export function InternalModuleLocked({ onBack }: { onBack: () => void }) {
  return (
    <section className="panel form-panel" dir="rtl">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> رجوع</button>
      <div className="brand-mark small"><LockKeyhole size={28} /></div>
      <h1>وحدة داخلية غير مفعلة</h1>
      <p className="place">المسجد والتعليم القرآني</p>
      <p className="intro">هذه الوحدة مخصصة للمكتب والرئيس فقط. لا تظهر في الواجهة العمومية ولا يتم تفعيلها قبل اعتماد صلاحيات داخلية واضحة.</p>
      <button className="primary-action" onClick={onBack}>رجوع</button>
    </section>
  );
}
