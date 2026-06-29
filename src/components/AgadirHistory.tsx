import { CalendarDays, Landmark, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  agadirHistoryFallback,
  loadAgadirHistoryContent,
  loadPageMedia,
  pageIdForVariant,
} from '../lib/agadirHistoryContent';
import type {
  AgadirHistoryLanguageContent,
  AgadirHistoryVariant,
  EditorialLang,
} from '../lib/agadirHistoryContent';

type AgadirHistoryProps = {
  lang: EditorialLang;
  variant: AgadirHistoryVariant;
  contentOverride?: AgadirHistoryLanguageContent;
  imageUrlOverride?: string | null;
};

type AgadirHistoryViewProps = {
  content: AgadirHistoryLanguageContent;
  variant: AgadirHistoryVariant;
  imageUrl?: string | null;
};

export function AgadirHistoryView({ content: t, variant, imageUrl }: AgadirHistoryViewProps) {
  const image = imageUrl ? (
    <img className="agadir-history-image" src={imageUrl} alt="" loading="lazy" />
  ) : null;

  if (variant === 'timeline') {
    return (
      <section className="agadir-history agadir-history-timeline">
        {image}
        <div className="agadir-history-heading"><CalendarDays size={24} /><h2>{t.timelineTitle}</h2></div>
        <div className="agadir-history-milestones">
          {t.timeline.map((item) => (
            <article key={item.id}>
              <strong>{item.period}</strong>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (variant === 'about') {
    return (
      <section className="agadir-history agadir-history-about">
        {image}
        <div className="agadir-history-heading"><Landmark size={24} /><h2>{t.aboutTitle}</h2></div>
        <p>{t.aboutText}</p>
        <p className="agadir-history-ownership"><ShieldCheck size={20} /><span>{t.aboutAssociation}</span></p>
      </section>
    );
  }

  return (
    <section className="agadir-history agadir-history-full">
      {image}
      <div className="agadir-history-heading"><Landmark size={24} /><h2>{t.heritageTitle}</h2></div>
      {t.heritageParagraphs.map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)}
      <h3>{t.recognitionTitle}</h3>
      {t.recognitionParagraphs.map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)}
      <aside className="agadir-history-ownership">
        <ShieldCheck size={22} />
        <div><h3>{t.ownershipTitle}</h3><p>{t.ownershipText}</p></div>
      </aside>
      <h3>{t.territoryTitle}</h3>
      <p>{t.territoryText}</p>
    </section>
  );
}

export default function AgadirHistory({
  lang,
  variant,
  contentOverride,
  imageUrlOverride,
}: AgadirHistoryProps) {
  const pageId = pageIdForVariant(variant);
  const [content, setContent] = useState<AgadirHistoryLanguageContent>(
    contentOverride ?? agadirHistoryFallback[lang],
  );
  const [imageUrl, setImageUrl] = useState<string | null>(imageUrlOverride ?? null);

  useEffect(() => {
    if (contentOverride) {
      setContent(contentOverride);
      setImageUrl(imageUrlOverride ?? null);
      return;
    }

    let active = true;
    Promise.all([loadAgadirHistoryContent(pageId), loadPageMedia(pageId)])
      .then(([contentResult, media]) => {
        if (!active) return;
        setContent(contentResult.content[lang]);
        setImageUrl(media.find((item) => item.media_type === 'image')?.public_url ?? null);
      })
      .catch(() => {
        if (!active) return;
        setContent(agadirHistoryFallback[lang]);
        setImageUrl(null);
      });

    return () => {
      active = false;
    };
  }, [contentOverride, imageUrlOverride, lang, pageId]);

  return <AgadirHistoryView content={content} variant={variant} imageUrl={imageUrl} />;
}
