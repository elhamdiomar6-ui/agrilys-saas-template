import { ArrowLeft, Mail, MapPin, ShieldCheck, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import CardListenButton from '../components/CardListenButton';
import { fetchPublicAssociations, fetchPublicDouarBySlug } from '../lib/multiDouars';
import type { AssociationProfile, DouarProfile } from '../types/multiDouars';

type Lang = 'fr' | 'ar';

function currentSlug() {
  const hashMatch = window.location.hash.match(/^#\/douars\/([^/?#]+)/);
  if (hashMatch?.[1]) return decodeURIComponent(hashMatch[1]);
  const pathMatch = window.location.pathname.match(/^\/douars\/([^/?#]+)/);
  return pathMatch?.[1] ? decodeURIComponent(pathMatch[1]) : 'agadir-ntguida';
}

export default function DouarDetailPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const slug = useMemo(currentSlug, []);
  const [douar, setDouar] = useState<DouarProfile | null>(null);
  const [associations, setAssociations] = useState<AssociationProfile[]>([]);

  useEffect(() => {
    fetchPublicDouarBySlug(slug).then((profile) => {
      setDouar(profile);
      if (profile?.id) fetchPublicAssociations(profile.id).then(setAssociations);
    });
  }, [slug]);

  if (!douar) {
    return (
      <section className="panel multi-douars-page">
        <button className="back-button" type="button" onClick={onBack}><ArrowLeft size={18} /> {lang === 'ar' ? 'رجوع' : 'Retour'}</button>
        <p className="empty-state">{lang === 'ar' ? 'هذا الدوار غير منشور بعد.' : "Ce douar n'est pas encore publie."}</p>
      </section>
    );
  }

  return (
    <section className="panel multi-douars-page">
      <button className="back-button" type="button" onClick={onBack}><ArrowLeft size={18} /> {lang === 'ar' ? 'رجوع' : 'Retour'}</button>
      <div className="brand-mark small"><UsersRound size={28} /></div>
      <h1>{lang === 'ar' && douar.nom_ar ? douar.nom_ar : douar.nom}</h1>
      <p className="intro">{lang === 'ar' && douar.description_ar ? douar.description_ar : douar.description}</p>

      <div className="multi-douar-detail-grid">
        <article className="multi-douar-card pilote">
          <h2>{lang === 'ar' ? 'الموقع' : 'Localisation'}</h2>
          <p><MapPin size={17} /> {douar.commune || '-'}, {douar.province || '-'}, {douar.region || '-'}</p>
          {douar.coordonnees_lat && douar.coordonnees_lng ? (
            <small>GPS : {douar.coordonnees_lat}, {douar.coordonnees_lng}</small>
          ) : null}
        </article>

        <article className="multi-douar-card integre">
          <h2>{lang === 'ar' ? 'الاتصال العمومي' : 'Contact public'}</h2>
          {douar.contact_email ? <p><Mail size={17} /> {douar.contact_email}</p> : <p>{lang === 'ar' ? 'سيضاف الاتصال بعد التحقق.' : 'Le contact sera ajoute apres validation.'}</p>}
        </article>
      </div>

      <section className="access-group">
        <div className="access-group-heading">
          <h2>{lang === 'ar' ? 'الجمعيات المنشورة' : 'Associations publiees'}</h2>
          <p>{lang === 'ar' ? 'لا تظهر إلا المعلومات العمومية المصادق عليها.' : 'Seules les informations publiques validees apparaissent ici.'}</p>
        </div>
        <div className="multi-douars-grid">
          {associations.length === 0 ? <p className="empty-state">{lang === 'ar' ? 'لا توجد جمعية منشورة حاليا.' : 'Aucune association publiee pour le moment.'}</p> : null}
          {associations.map((association) => (
            <article className="multi-douar-card" key={association.id}>
              <h2>{lang === 'ar' && association.nom_ar ? association.nom_ar : association.nom}</h2>
              <p>{association.description}</p>
              <CardListenButton text={`${lang === 'ar' && association.nom_ar ? association.nom_ar : association.nom}. ${association.description}`} lang={lang} />
              <small><ShieldCheck size={15} /> {association.statut_legal ? (lang === 'ar' ? 'وضع قانوني مفعل' : 'Statut legal actif') : (lang === 'ar' ? 'قيد التحقق' : 'A verifier')}</small>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
