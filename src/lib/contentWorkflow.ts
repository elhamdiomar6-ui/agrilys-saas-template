import { isSupabaseConfigured, supabase } from './supabaseClient';

export type ContentType =
  | 'annonce'
  | 'document'
  | 'patrimoine'
  | 'evenement'
  | 'projet'
  | 'actualite';

export type WorkflowStatut =
  | 'brouillon'
  | 'en_attente'
  | 'publie'
  | 'rejete'
  | 'archive';

export interface ContentItem {
  id: string;
  content_type: ContentType;
  titre: string;
  contenu?: string | null;
  auteur_id?: string | null;
  statut: WorkflowStatut;
  soumis_le?: string | null;
  valide_par?: string | null;
  valide_le?: string | null;
  commentaire_validation?: string | null;
  publie_le?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

type WorkflowResult = {
  ok: boolean;
  id?: string;
  error?: string;
};

function unavailable(message = 'Supabase indisponible.') {
  return { ok: false, error: message };
}

export async function soumettre(
  type: ContentType,
  titre: string,
  contenu: string,
  metadata: Record<string, unknown> = {},
): Promise<WorkflowResult> {
  if (!isSupabaseConfigured || !supabase) return unavailable('Supabase non configure.');

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) return unavailable(authError.message);
    if (!authData.user) return unavailable('Non authentifie.');

    const { data, error } = await supabase
      .from('content_workflow')
      .insert({
        content_type: type,
        titre,
        contenu,
        auteur_id: authData.user.id,
        statut: 'en_attente',
        soumis_le: new Date().toISOString(),
        metadata,
      })
      .select('id')
      .single();

    if (error) return unavailable(error.message);
    return { ok: true, id: data.id };
  } catch (error) {
    return unavailable(error instanceof Error ? error.message : 'Erreur inconnue.');
  }
}

export async function publier(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return false;

    const now = new Date().toISOString();
    const { error } = await supabase
      .from('content_workflow')
      .update({
        statut: 'publie',
        valide_par: authData.user.id,
        valide_le: now,
        publie_le: now,
      })
      .eq('id', id);

    return !error;
  } catch {
    return false;
  }
}

export async function rejeter(id: string, commentaire: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase
      .from('content_workflow')
      .update({
        statut: 'rejete',
        commentaire_validation: commentaire,
      })
      .eq('id', id);

    return !error;
  } catch {
    return false;
  }
}

export async function listerPublie(type?: ContentType): Promise<ContentItem[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    let query = supabase
      .from('content_workflow')
      .select('*')
      .eq('statut', 'publie')
      .order('publie_le', { ascending: false });

    if (type) query = query.eq('content_type', type);
    const { data, error } = await query;
    if (error) return [];
    return (data || []) as ContentItem[];
  } catch {
    return [];
  }
}

export async function listerEnAttente(): Promise<ContentItem[]> {
  return listerParStatut('en_attente');
}

export async function listerParStatut(statut: WorkflowStatut): Promise<ContentItem[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    const orderColumn = statut === 'publie' ? 'publie_le' : statut === 'en_attente' ? 'soumis_le' : 'updated_at';
    const { data, error } = await supabase
      .from('content_workflow')
      .select('*')
      .eq('statut', statut)
      .order(orderColumn, { ascending: false, nullsFirst: false });

    if (error) return [];
    return (data || []) as ContentItem[];
  } catch {
    return [];
  }
}
