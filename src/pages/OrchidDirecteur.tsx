import AudioHelp from '../components/AudioHelp';
import OrchidInterface from '../components/orchid/OrchidInterface';

type OrchidDirecteurPageProps = {
  lang: 'fr' | 'ar';
  onBack: () => void;
};

export default function OrchidDirecteurPage({ lang, onBack }: OrchidDirecteurPageProps) {
  return (
    <section className="panel orchid-page">
      <button className="back-button" type="button" onClick={onBack}>
        ← {lang === 'ar' ? 'رجوع' : 'Retour Président'}
      </button>
      <div className="orchid-page-heading">
        <span aria-hidden="true">OR</span>
        <div>
          <h1>{lang === 'ar' ? 'ORCHID - مساعد الرئيس' : 'ORCHID - Assistant du Président'}</h1>
          <p>
            {lang === 'ar'
              ? 'مساعد داخلي مخصص للرئيس لمتابعة الجمعية، الوثائق، المشاريع، التراث، التمويل والجوانب التقنية.'
              : "Assistant interne réservé au Président pour suivre l'association, les documents, les projets, le patrimoine, le financement et les aspects techniques."}
          </p>
        </div>
      </div>
      <AudioHelp scriptId="bureau-orchid" />
      <OrchidInterface locale={lang} />
    </section>
  );
}
