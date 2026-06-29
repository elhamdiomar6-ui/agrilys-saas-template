import { supabase } from './supabaseClient';
import type { AssociationProfile, CooperativeProfile, DouarProfile } from '../types/multiDouars';

export const pilotDouar: DouarProfile = {
  id: 'local-agadir-ntguida',
  nom: "Agadir N'Tguida",
  nom_ar: 'أكادير نتكيدا',
  slug: 'agadir-ntguida',
  commune: 'Boutrouch',
  caidat: 'Lakhsass',
  province: 'Sidi Ifni',
  region: 'Guelmim-Oued Noun',
  coordonnees_lat: 29.346975,
  coordonnees_lng: -9.289207,
  statut: 'pilote',
  description: "Douar pilote de la plateforme AGADIRNETGUIDA.",
  description_ar: 'الدوار النموذجي لمنصة أكادير نتكيدا.',
  date_integration: '2026-06-08',
};

export async function fetchPublicDouars(): Promise<DouarProfile[]> {
  if (!supabase) return [pilotDouar];

  const { data, error } = await supabase
    .from('douars')
    .select('id,nom,nom_ar,slug,commune,caidat,province,region,coordonnees_lat,coordonnees_lng,statut,description,description_ar,contact_nom,contact_email,date_integration')
    .in('statut', ['pilote', 'integre'])
    .order('statut', { ascending: false })
    .order('nom', { ascending: true });

  if (error || !data?.length) return [pilotDouar];
  return data as DouarProfile[];
}

export async function fetchPublicDouarBySlug(slug: string): Promise<DouarProfile | null> {
  if (!supabase) return slug === pilotDouar.slug ? pilotDouar : null;

  const { data, error } = await supabase
    .from('douars')
    .select('id,nom,nom_ar,slug,commune,caidat,province,region,coordonnees_lat,coordonnees_lng,statut,description,description_ar,contact_nom,contact_email,date_integration')
    .eq('slug', slug)
    .in('statut', ['pilote', 'integre'])
    .maybeSingle();

  if (error) return slug === pilotDouar.slug ? pilotDouar : null;
  return (data as DouarProfile | null) ?? (slug === pilotDouar.slug ? pilotDouar : null);
}

export async function fetchPublicAssociations(douarId?: string): Promise<AssociationProfile[]> {
  if (!supabase || !douarId || douarId === pilotDouar.id) return [];

  const { data, error } = await supabase
    .from('associations_profils')
    .select('id,douar_id,nom,nom_ar,president,email,statut_legal,annee_creation,description')
    .eq('douar_id', douarId)
    .order('nom', { ascending: true });

  if (error) return [];
  return (data || []) as AssociationProfile[];
}

export async function fetchPublicCooperatives(): Promise<CooperativeProfile[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('cooperatives_profils')
    .select('id,douar_id,nom,nom_ar,type_produit,description,contact,certifications,statut,douars(nom,nom_ar,slug,commune,statut)')
    .eq('statut', 'active')
    .order('nom', { ascending: true });

  if (error) return [];
  return (data || []).map((item) => ({
    ...item,
    douars: Array.isArray(item.douars) ? (item.douars[0] ?? null) : item.douars,
  })) as CooperativeProfile[];
}
