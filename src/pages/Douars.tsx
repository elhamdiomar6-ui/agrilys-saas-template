import { ArrowLeft, MapPin, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import CardListenButton from '../components/CardListenButton';
import { fetchPublicDouars } from '../lib/multiDouars';
import type { DouarProfile } from '../types/multiDouars';

type Lang = 'fr' | 'ar';

const statusLabels = {
  fr: { pilote: 'Douar pilote', integre: 'Integre', en_attente: 'En attente' },
  ar: { pilote: 'دوار نموذجي', integre: 'مدمج', en_attente: 'في الانتظار' },
} as const;

export default function DouarsPage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const [douars, setDouars] = useState<DouarProfile[]>([]);

  useEffect(() => {
    fetchPublicDouars().then(setDouars);
  }, []);

  return (
    <section className="panel multi-douars-page">
      <button className="back-button" type="button" onClick={onBack}>
        <ArrowLeft size={18} /> {lang === 'ar' ? 'رجوع' : 'Retour'}
      </button>
      <div className="brand-mark small"><UsersRound size={28} /></div>
      <h1>{lang === 'ar' ? 'الدواوير المدمجة' : 'Douars integres'}</h1>
      <p className="intro">
        {lang === 'ar'
          ? 'أكادير نتكيدا هو الدوار النموذجي. ستضاف الدواوير الأخرى تدريجيا بعد التحقق.'
          : "Agadir N'Tguida reste le douar pilote. Les autres douars seront ajoutes progressivement apres validation."}
      </p>

      <div className="multi-douars-grid">
        {douars.map((douar) => (
          <a className={`multi-douar-card ${douar.statut}`} href={`#/douars/${douar.slug}`} key={douar.id}>
            <span className="multi-douar-status">{statusLabels[lang][douar.statut]}</span>
            <h2>{lang === 'ar' && douar.nom_ar ? douar.nom_ar : douar.nom}</h2>
            <p>{lang === 'ar' && douar.description_ar ? douar.description_ar : douar.description}</p>
            <small><MapPin size={15} /> {douar.commune || '-'} · {douar.province || '-'}</small>
            <div onClick={(e) => e.preventDefault()}><CardListenButton text={`${lang === 'ar' && douar.nom_ar ? douar.nom_ar : douar.nom}. ${lang === 'ar' && douar.description_ar ? douar.description_ar : douar.description}`} lang={lang} /></div>
          </a>
        ))}
      </div>
    </section>
  );
}
