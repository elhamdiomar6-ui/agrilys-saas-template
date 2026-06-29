import type { Agent, AgentId } from '../../types/orchid';

export const AGENTS: Agent[] = [
  {
    id: 'directeur',
    nameAr: 'أوركيد - المدير العام',
    nameFr: 'ORCHID - Directeur general',
    icon: '🏔️',
    color: '#1B5E20',
    description: 'Vision globale, priorites et coordination des agents',
  },
  {
    id: 'juridique',
    nameAr: 'المستشار القانوني',
    nameFr: 'Conseiller juridique',
    icon: '⚖️',
    color: '#1565C0',
    description: 'Statuts, PV, depot officiel et gouvernance associative',
  },
  {
    id: 'financier',
    nameAr: 'المستشار المالي',
    nameFr: 'Conseiller financier',
    icon: '💰',
    color: '#8B6914',
    description: 'Cotisations, budget, suivi des recettes et depenses',
  },
  {
    id: 'patrimoine',
    nameAr: 'مستشار التراث',
    nameFr: 'Conseiller patrimoine',
    icon: '🏛️',
    color: '#6A4C1B',
    description: 'Agadir, sites GPS, memoire locale et tourisme culturel',
  },
  {
    id: 'communication',
    nameAr: 'مستشار التواصل',
    nameFr: 'Conseiller communication',
    icon: '📢',
    color: '#00695C',
    description: 'Messages publics, dossiers et communication institutionnelle',
  },
  {
    id: 'financement',
    nameAr: 'مستشار التمويل',
    nameFr: 'Conseiller financement',
    icon: '🌍',
    color: '#2D5016',
    description: 'Subventions, partenaires, ONG et appels a projets',
  },
  {
    id: 'technique',
    nameAr: 'المستشار التقني',
    nameFr: 'Conseiller technique',
    icon: '💻',
    color: '#37474F',
    description: 'Application, modules, securite et feuille de route numerique',
  },
  {
    id: 'architecte',
    nameAr: 'المهندس المعماري',
    nameFr: 'Architecte & Genie Civil',
    icon: '🏗',
    color: '#5D4037',
    description: 'Batiments, rehabilitation, materiaux locaux, couts',
  },
  {
    id: 'agronome',
    nameAr: 'المهندس الزراعي',
    nameFr: 'Ingenieur Agronome',
    icon: '🌾',
    color: '#33691E',
    description: 'Cultures, irrigation, sols, rendements, cooperatives',
  },
  {
    id: 'hydraulique',
    nameAr: 'مهندس الماء والري',
    nameFr: 'Ingenieur Eau & Hydraulique',
    icon: '💧',
    color: '#0277BD',
    description: 'Eau potable, irrigation, puits, citernes, assainissement',
  },
  {
    id: 'energie',
    nameAr: 'مهندس الطاقة الشمسية',
    nameFr: 'Ingenieur Energie Solaire',
    icon: '☀',
    color: '#F57F17',
    description: 'Solaire, eclairage, pompage, autonomie energetique',
  },
  {
    id: 'sante',
    nameAr: 'الطبيب الريفي',
    nameFr: 'Conseiller Sante Rurale',
    icon: '🏥',
    color: '#C62828',
    description: 'Sante communautaire, premiers secours, prevention',
  },
  {
    id: 'urbaniste',
    nameAr: 'مهندس التهيئة العمرانية',
    nameFr: 'Urbaniste & Amenagement Rural',
    icon: '🗺',
    color: '#4527A0',
    description: 'Amenagement douar, routes, espaces communs, plan',
  },
  {
    id: 'diaspora',
    nameAr: 'مستشار الجالية',
    nameFr: 'Conseiller diaspora',
    icon: '✈️',
    color: '#0277BD',
    description: 'Mobilisation des MRE et soutien a distance',
  },
  {
    id: 'cooperatives',
    nameAr: 'مستشار التعاونيات',
    nameFr: 'Conseiller cooperatives',
    icon: '🌿',
    color: '#558B2F',
    description: 'Produits locaux, valorisation et economie rurale',
  },
];

export const AGENT_KEYWORDS: Record<AgentId, string[]> = {
  directeur: ['strategie', 'vision', 'priorite', 'plan', 'global', 'استراتيجية'],
  juridique: ['statut', 'loi', 'pv', 'assemblee', 'depot', 'province', 'قانون'],
  financier: ['budget', 'cotisation', 'argent', 'finance', 'recette', 'مال'],
  patrimoine: ['agadir', 'grenier', 'patrimoine', 'tourisme', 'gps', 'تراث'],
  communication: ['communication', 'facebook', 'annonce', 'dossier', 'تواصل'],
  financement: ['subvention', 'ong', 'bailleur', 'indh', 'financement', 'تمويل'],
  technique: ['application', 'code', 'module', 'supabase', 'vercel', 'تقني'],
  architecte: ['maison', 'batiment', 'construction', 'mur', 'toit', 'rehabilitation', 'fissure', 'pierre', 'artisan', 'بناء', 'منزل'],
  agronome: ['agriculture', 'champ', 'culture', 'argan', 'safran', 'sol', 'orge', 'amandier', 'figuier', 'زراعة', 'أرض'],
  hydraulique: ['eau', 'puits', 'source', 'irrigation', 'citerne', 'forage', 'pompe', 'assainissement', 'ماء', 'بئر', 'ري'],
  energie: ['solaire', 'electricite', 'panneau', 'energie', 'eclairage', 'photovoltaique', 'pompage', 'طاقة', 'شمسية'],
  sante: ['sante', 'maladie', 'medecin', 'scorpion', 'serpent', 'urgence', 'vaccin', 'hygiene', 'صحة', 'مرض'],
  urbaniste: ['route', 'espace', 'amenagement', 'plan', 'voirie', 'place', 'desenclavement', 'طريق', 'تهيئة'],
  diaspora: ['diaspora', 'mre', 'etranger', 'europe', 'جالية'],
  cooperatives: ['cooperative', 'produit', 'terroir', 'argan', 'تعاونية'],
};

export function getAgent(id: AgentId): Agent {
  return AGENTS.find((agent) => agent.id === id) ?? AGENTS[0];
}

export function detectAgent(message: string): AgentId {
  const normalized = message
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  for (const [agentId, keywords] of Object.entries(AGENT_KEYWORDS)) {
    if (keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))) {
      return agentId as AgentId;
    }
  }

  return 'directeur';
}
