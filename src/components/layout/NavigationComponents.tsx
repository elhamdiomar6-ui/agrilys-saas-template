import { Globe2, Home, LockKeyhole, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import type { UserRole } from '../../types/roles';
import { accessIconForPage, canShowSpace, spaceForPage, visibleSpaceItems, type Page } from './navigationHelpers';

type Lang = 'fr' | 'ar';
type TextBundle = { [K in keyof (typeof text)['fr']]: string } & { supportDouar: string };

type AccessCard = {
  page: Page;
  title: Record<Lang, string>;
  desc: Record<Lang, string>;
};

type AccessGroup = {
  title: Record<Lang, string>;
  desc: Record<Lang, string>;
  items: AccessCard[];
};

const text = {
  fr: {
    platformPublic: 'Public',
    platformResident: 'Habitant',
    platformBureau: 'Bureau',
    platformPresident: 'Président',
    platformPublicHint: 'Accès gratuit',
    platformResidentHint: 'Avec validation',
    platformBureauHint: 'Interne',
    platformPresidentHint: 'Direction',
    platformNavigation: 'Navigation',
  },
  ar: {
    platformPublic: 'عمومي',
    platformResident: 'ساكن',
    platformBureau: 'مكتب',
    platformPresident: 'رئيس',
    platformPublicHint: 'ولوج مجاني',
    platformResidentHint: 'مع التحقق',
    platformBureauHint: 'داخلي',
    platformPresidentHint: 'إدارة',
    platformNavigation: 'التنقل',
  },
};

export function PlatformDock({ t, current, currentRole, onNavigate }: { t: TextBundle; current: Page; currentRole: UserRole; onNavigate: (page: Page) => void }) {
  const textFr = text.fr;
  const activeSpace = spaceForPage(current);
  const items = visibleSpaceItems(current, currentRole).map((item) => {
    const spaceMap: Record<string, keyof typeof textFr> = {
      public: 'platformPublic',
      habitant: 'platformResident',
      bureau: 'platformBureau',
      president: 'platformPresident',
    };
    const hintMap: Record<string, keyof typeof textFr> = {
      public: 'platformPublicHint',
      habitant: 'platformResidentHint',
      bureau: 'platformBureauHint',
      president: 'platformPresidentHint',
    };
    return {
      ...item,
      label: t[spaceMap[item.space]] || textFr[spaceMap[item.space]],
      hint: t[hintMap[item.space]] || textFr[hintMap[item.space]],
      icon: item.space === 'public' ? <Globe2 size={17} /> : item.space === 'habitant' ? <Home size={17} /> : item.space === 'bureau' ? <LockKeyhole size={17} /> : <ShieldCheck size={17} />,
    };
  });

  return (
    <nav className="platform-dock" aria-label={t.platformNavigation || textFr.platformNavigation} data-nav-ready="sidebar-mobile-header">
      {items.map((item) => (
        <button
          type="button"
          key={item.space}
          className={activeSpace === item.space ? 'active' : ''}
          onClick={() => onNavigate(item.page)}
          aria-current={activeSpace === item.space ? 'page' : undefined}
        >
          <span>{item.icon}</span>
          <strong>{item.label}</strong>
          <small>{item.hint}</small>
        </button>
      ))}
    </nav>
  );
}

export function AccessGroupSection({ lang, group, onNavigate, badges }: { lang: Lang; group: AccessGroup; onNavigate: (page: Page) => void; badges?: Partial<Record<Page, number>> }) {
  return (
    <section className="access-group">
      <div className="access-group-heading">
        <h2>{group.title[lang]}</h2>
        <p>{group.desc[lang]}</p>
      </div>
      <div className="access-card-grid">
        {group.items.map((item) => {
          const badgeCount = badges?.[item.page] ?? 0;
          return (
            <button className="access-card platform-card" type="button" key={`${item.page}-${item.title.fr}`} onClick={() => onNavigate(item.page)}>
              <span className="access-card-icon">
                {accessIconForPage(item.page)}
                {badgeCount > 0 ? <span className="notif-badge">{badgeCount > 99 ? '99+' : badgeCount}</span> : null}
              </span>
              <strong>{item.title[lang]}</strong>
              <small>{item.desc[lang]}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function SpaceNav({ lang, current, currentRole, onNavigate }: { lang: Lang; current: Page; currentRole: UserRole; onNavigate: (page: Page) => void }) {
  const allItems: AccessCard[] = [
    { page: 'habitant', title: { fr: 'Habitant', ar: 'الساكن' }, desc: { fr: 'Accès public', ar: 'ولوج عمومي' } },
    { page: 'explorer', title: { fr: 'Explorer', ar: 'استكشاف' }, desc: { fr: 'Modules publics', ar: 'الوحدات العمومية' } },
    { page: 'bureau', title: { fr: 'Bureau', ar: 'المكتب' }, desc: { fr: 'Espace interne', ar: 'فضاء داخلي' } },
    { page: 'president', title: { fr: 'Président', ar: 'الرئيس' }, desc: { fr: 'Pilotage', ar: 'القيادة' } },
  ];
  const visiblePages = new Set(visibleSpaceItems(current, currentRole).map((item) => item.page));
  const items = allItems.filter((item) => visiblePages.has(item.page));

  return (
    <nav className="space-nav" aria-label={lang === 'ar' ? 'التنقل بين الفضاءات' : 'Navigation entre les espaces'}>
      {items.map((item) => (
        <button
          className={item.page === current ? 'active platform-nav-card' : 'platform-nav-card'}
          type="button"
          key={item.page}
          onClick={() => onNavigate(item.page)}
          aria-current={item.page === current ? 'page' : undefined}
        >
          <span>{accessIconForPage(item.page)}</span>
          <strong>{item.title[lang]}</strong>
          <small>{item.desc[lang]}</small>
        </button>
      ))}
    </nav>
  );
}
