export type DouarStatus = 'pilote' | 'integre' | 'en_attente';

export type DouarProfile = {
  id: string;
  nom: string;
  nom_ar?: string | null;
  slug: string;
  commune?: string | null;
  caidat?: string | null;
  province?: string | null;
  region?: string | null;
  coordonnees_lat?: number | null;
  coordonnees_lng?: number | null;
  statut: DouarStatus;
  description?: string | null;
  description_ar?: string | null;
  contact_nom?: string | null;
  contact_email?: string | null;
  contact_tel?: string | null;
  date_integration?: string | null;
};

export type AssociationProfile = {
  id: string;
  douar_id: string | null;
  nom: string;
  nom_ar?: string | null;
  president?: string | null;
  email?: string | null;
  telephone?: string | null;
  statut_legal?: boolean | null;
  annee_creation?: number | null;
  description?: string | null;
};

export type CooperativeProfile = {
  id: string;
  douar_id: string | null;
  nom: string;
  nom_ar?: string | null;
  type_produit?: 'argan' | 'safran' | 'dattes' | 'miel' | 'artisanat' | 'agriculture' | 'autre' | null;
  description?: string | null;
  contact?: string | null;
  telephone?: string | null;
  certifications?: string[] | null;
  statut?: 'active' | 'en_attente' | 'inactive' | null;
  douars?: Pick<DouarProfile, 'nom' | 'nom_ar' | 'slug' | 'commune' | 'statut'> | null;
};
