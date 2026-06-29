import { supabase } from './supabaseClient';

export type EditorialLang = 'fr' | 'ar';
export type EditorialPageId =
  | 'patrimoine' | 'chronologie' | 'a-propos'
  | 'accueil' | 'habitant' | 'explorer' | 'documents-publics'
  | 'eau' | 'evenements' | 'projets' | 'memoire-orale'
  | 'jeunesse' | 'entraide' | 'agriculture' | 'cooperatives'
  | 'diaspora' | 'connexion';
export type AgadirHistoryPageId = Extract<EditorialPageId, 'patrimoine' | 'chronologie' | 'a-propos'>;
export type AgadirHistoryVariant = 'heritage' | 'timeline' | 'about';

export type TimelineEntry = {
  id: string;
  period: string;
  title: string;
  text: string;
};

export type AgadirHistoryLanguageContent = {
  heritageTitle: string;
  heritageParagraphs: string[];
  recognitionTitle: string;
  recognitionParagraphs: string[];
  ownershipTitle: string;
  ownershipText: string;
  territoryTitle: string;
  territoryText: string;
  timelineTitle: string;
  timeline: TimelineEntry[];
  aboutTitle: string;
  aboutText: string;
  aboutAssociation: string;
};

export type AgadirHistoryContent = Record<EditorialLang, AgadirHistoryLanguageContent>;

export type EditorialSectionDefinition = {
  id: keyof AgadirHistoryLanguageContent;
  label: string;
  type: 'text' | 'array' | 'timeline';
};

export type EditorialPageDefinition = {
  id: AgadirHistoryPageId;
  variant: AgadirHistoryVariant;
  label: string;
  audioScriptId: 'carte-patrimoine' | 'chronologie' | 'a-propos';
  sections: EditorialSectionDefinition[];
};

type PageContentRow = {
  page_id: string;
  section_id: string;
  lang: EditorialLang;
  content_type: 'text' | 'array' | 'json';
  content: string | null;
  content_json: unknown;
  display_order: number;
};

export type PageMediaRow = {
  id: string;
  page_id: string;
  media_type: 'audio' | 'image';
  lang: string | null;
  file_path: string;
  public_url: string | null;
};

export const agadirHistoryFallback: AgadirHistoryContent = {
  fr: {
    heritageTitle: "Le Grenier Collectif Tguida — patrimoine du douar Agadir N'Tguida",
    heritageParagraphs: [
      "Le Grenier Collectif (Agadir) Tguida appartient au douar Agadir N'Tguida et à ses habitants. Sa gestion, sa préservation et toute valorisation touristique relèvent de la responsabilité de la communauté et de l'Association Agadir N'Tguida pour le Développement et la Coopération (ANATDC), seule structure légalement constituée pour représenter les habitants du douar sur ce patrimoine.",
      "Le Grenier est l'un des plus de cinquante forts et greniers collectifs historiques recensés dans la région de Boutrouch et ses environs. Selon la tradition orale locale, sa construction remonte à plus de quatre siècles. Il fut bâti et utilisé par les tribus Majjat Ait Moussa pour conserver les céréales et les biens précieux de la communauté, mais aussi comme refuge sûr lors des conflits qui pouvaient éclater entre tribus.",
      "Il se distingue des autres greniers de la région par sa forme circulaire particulière, une caractéristique relevée par les services régionaux du patrimoine culturel.",
    ],
    recognitionTitle: 'Une reconnaissance officielle récente',
    recognitionParagraphs: [
      "En 2026, un décret gouvernemental a officiellement inscrit le Grenier Collectif Agadir N'Tguida sur la liste des monuments historiques nationaux du Maroc.",
      "Ce classement place désormais le Grenier sous la protection de la loi relative aux monuments historiques : toute modification de sa structure ou de son apparence nécessite une autorisation préalable du ministère compétent — une garantie supplémentaire pour la préservation de ce lieu pour les générations futures.",
    ],
    ownershipTitle: 'Responsabilité communautaire et représentation',
    ownershipText: "Cette reconnaissance officielle ne transfère aucun droit de gestion, d'exploitation touristique ou de représentation à un tiers. Toute initiative de visite, d'excursion ou de valorisation touristique du Grenier doit recevoir l'accord préalable des habitants du douar et de l'ANATDC. L'association rappelle qu'elle est l'unique structure habilitée à représenter la communauté d'Agadir N'Tguida sur les questions liées à ce patrimoine, et qu'aucune organisation extérieure au douar n'est autorisée à organiser des visites ou des activités sur le site sans ce consentement.",
    territoryTitle: 'Le territoire et son histoire',
    territoryText: "Le douar Agadir N'Tguida se situe dans la zone tribale de Lakhsass, voisine de la confédération Ait Baamrane, dont la ville de Sidi Ifni fut historiquement la capitale. Cette région a connu une histoire marquée par la résistance : les tribus Ait Baamrane se sont opposées successivement à la présence coloniale française puis espagnole au cours du XXe siècle, jusqu'à la libération de Sidi Ifni le 30 juin 1969 — une date commémorée chaque année au Maroc.",
    timelineTitle: "Repères de l'histoire d'Agadir N'Tguida",
    timeline: [
      { id: 'construction-grenier', period: 'Il y a plus de quatre siècles', title: 'Construction du Grenier Collectif Tguida', text: 'Selon la tradition orale locale, les tribus Majjat Ait Moussa bâtissent le Grenier pour conserver les céréales et les biens précieux de la communauté, et servir de refuge sûr.' },
      { id: 'resistance-xxe', period: 'XXe siècle', title: 'Une région marquée par la résistance', text: 'Les tribus Ait Baamrane s’opposent successivement aux présences coloniales française puis espagnole.' },
      { id: 'liberation-sidi-ifni', period: '30 juin 1969', title: 'Libération de Sidi Ifni', text: 'La libération de Sidi Ifni devient une date historique commémorée chaque année au Maroc.' },
      { id: 'classement-2026', period: '2026', title: 'Classement comme monument historique national', text: "Un décret gouvernemental inscrit officiellement le Grenier Collectif Agadir N'Tguida sur la liste des monuments historiques nationaux du Maroc." },
    ],
    aboutTitle: 'Une communauté, un territoire et un patrimoine',
    aboutText: "Agadir N'Tguida appartient à la zone tribale de Lakhsass, voisine de la confédération Ait Baamrane. Son histoire locale est notamment portée par le Grenier Collectif Tguida, construit il y a plus de quatre siècles selon la tradition orale et classé monument historique national en 2026.",
    aboutAssociation: "L'ANATDC assure la représentation des habitants du douar pour la préservation et la valorisation de ce patrimoine. Toute initiative concernant le Grenier doit être menée avec l'accord préalable de la communauté et de l'association.",
  },
  ar: {
    heritageTitle: 'الغرنية الجماعية تيكيدا — تراث دوار أگادير نتگيدا',
    heritageParagraphs: [
      'تنتمي الغرنية الجماعية (أگادير) تيكيدا لدوار أگادير نتگيدا وساكنته. وتعود مسؤولية تدبيرها والحفاظ عليها وأي تثمين سياحي لها إلى الجماعة المحلية وإلى جمعية أگادير نتگيدا للتنمية والتعاون (ANATDC)، وهي الهيكل القانوني الوحيد المؤهل لتمثيل ساكنة الدوار في كل ما يتعلق بهذا التراث.',
      'تُعد الغرنية واحدة من أكثر من خمسين حصنًا ومخزنًا جماعيًا تاريخيًا تم رصدها في منطقة بوطروش وما حولها. وحسب الرواية الشفوية المحلية، يعود تشييدها إلى أكثر من أربعة قرون. شيدتها واستعملتها قبائل مجاط آيت موسى لحفظ الحبوب والممتلكات الثمينة للجماعة، وكذلك كملاذ آمن أثناء النزاعات التي كانت تنشب بين القبائل.',
      'تتميز هذه المعلمة عن باقي الغرنيات في المنطقة بشكلها الدائري الخاص، وهي خصوصية أكدتها المصالح الجهوية المكلفة بالتراث الثقافي.',
    ],
    recognitionTitle: 'اعتراف رسمي حديث',
    recognitionParagraphs: [
      'في سنة 2026، صدر مرسوم حكومي يدرج الغرنية الجماعية أگادير نتگيدا رسميًا ضمن لائحة الآثار التاريخية الوطنية بالمغرب.',
      'ويضع هذا التصنيف الغرنية تحت حماية القانون المتعلق بالمباني التاريخية: أصبح أي تغيير في بنيتها أو شكلها العام يستوجب ترخيصًا مسبقًا من الوزارة المختصة، وهو ضمان إضافي للحفاظ على هذا المكان للأجيال القادمة.',
    ],
    ownershipTitle: 'المسؤولية الجماعية والتمثيل',
    ownershipText: 'هذا التصنيف الرسمي لا يمنح أي جهة خارجية حق التدبير أو الاستغلال السياحي أو التمثيل. كل مبادرة لزيارة الغرنية أو تنظيم خرجات أو أنشطة سياحية بها يجب أن تحصل على موافقة مسبقة من ساكنة الدوار ومن جمعية ANATDC. وتؤكد الجمعية أنها الهيكل الوحيد المؤهل لتمثيل ساكنة دوار أگادير نتگيدا في كل ما يخص هذا التراث، وأنه لا يحق لأي جهة من خارج الدوار تنظيم زيارات أو أنشطة بالموقع دون هذه الموافقة.',
    territoryTitle: 'التراب وتاريخه',
    territoryText: 'يقع دوار أگادير نتگيدا في منطقة قبيلة لخصاص، المجاورة لاتحاد قبائل آيت باعمران، التي كانت مدينة سيدي إفني حاضرتها التاريخية. شهدت هذه المنطقة تاريخًا حافلًا بالمقاومة: واجهت قبائل آيت باعمران الوجود الاستعماري الفرنسي ثم الإسباني على التوالي خلال القرن العشرين، إلى أن تم تحرير سيدي إفني في 30 يونيو 1969 — تاريخ يُخلَّد كل سنة في المغرب.',
    timelineTitle: 'محطات من تاريخ أگادير نتگيدا',
    timeline: [
      { id: 'construction-grenier', period: 'منذ أكثر من أربعة قرون', title: 'تشييد الغرنية الجماعية تيكيدا', text: 'حسب الرواية الشفوية المحلية، شيدت قبائل مجاط آيت موسى الغرنية لحفظ حبوب الجماعة وممتلكاتها الثمينة، ولتكون ملاذًا آمنًا.' },
      { id: 'resistance-xxe', period: 'القرن العشرون', title: 'منطقة طبعتها المقاومة', text: 'واجهت قبائل آيت باعمران الوجود الاستعماري الفرنسي ثم الإسباني.' },
      { id: 'liberation-sidi-ifni', period: '30 يونيو 1969', title: 'تحرير سيدي إفني', text: 'أصبح تحرير سيدي إفني تاريخًا وطنيًا يُخلَّد كل سنة في المغرب.' },
      { id: 'classement-2026', period: '2026', title: 'التصنيف ضمن الآثار التاريخية الوطنية', text: 'أدرج مرسوم حكومي الغرنية الجماعية أگادير نتگيدا رسميًا ضمن لائحة الآثار التاريخية الوطنية بالمغرب.' },
    ],
    aboutTitle: 'جماعة وتراب وتراث',
    aboutText: 'ينتمي دوار أگادير نتگيدا إلى منطقة قبيلة لخصاص المجاورة لاتحاد قبائل آيت باعمران. وتحمل الغرنية الجماعية تيكيدا جزءًا مهمًا من تاريخه المحلي؛ إذ يعود بناؤها، حسب الرواية الشفوية، إلى أكثر من أربعة قرون، وصُنفت معلمة تاريخية وطنية سنة 2026.',
    aboutAssociation: 'تتولى جمعية ANATDC تمثيل ساكنة الدوار في ما يتعلق بالحفاظ على هذا التراث وتثمينه. ويجب أن تتم كل مبادرة تخص الغرنية بعد الموافقة المسبقة للجماعة المحلية والجمعية.',
  },
};

export const editorialPages: EditorialPageDefinition[] = [
  {
    id: 'patrimoine',
    variant: 'heritage',
    label: 'Patrimoine',
    audioScriptId: 'carte-patrimoine',
    sections: [
      { id: 'heritageTitle', label: 'Titre principal', type: 'text' },
      { id: 'heritageParagraphs', label: 'Présentation du Grenier', type: 'array' },
      { id: 'recognitionTitle', label: 'Titre de la reconnaissance', type: 'text' },
      { id: 'recognitionParagraphs', label: 'Reconnaissance officielle', type: 'array' },
      { id: 'ownershipTitle', label: 'Titre de la responsabilité', type: 'text' },
      { id: 'ownershipText', label: 'Responsabilité et représentation', type: 'text' },
      { id: 'territoryTitle', label: 'Titre du territoire', type: 'text' },
      { id: 'territoryText', label: 'Territoire et histoire', type: 'text' },
    ],
  },
  {
    id: 'chronologie',
    variant: 'timeline',
    label: 'Chronologie',
    audioScriptId: 'chronologie',
    sections: [
      { id: 'timelineTitle', label: 'Titre de la chronologie', type: 'text' },
      { id: 'timeline', label: 'Repères historiques', type: 'timeline' },
    ],
  },
  {
    id: 'a-propos',
    variant: 'about',
    label: 'À propos',
    audioScriptId: 'a-propos',
    sections: [
      { id: 'aboutTitle', label: 'Titre historique', type: 'text' },
      { id: 'aboutText', label: 'Présentation historique', type: 'text' },
      { id: 'aboutAssociation', label: 'Rôle de l’ANATDC', type: 'text' },
    ],
  },
];

export function pageIdForVariant(variant: AgadirHistoryVariant): AgadirHistoryPageId {
  return editorialPages.find((page) => page.variant === variant)?.id ?? 'patrimoine';
}

export function cloneAgadirHistoryContent(): AgadirHistoryContent {
  return structuredClone(agadirHistoryFallback);
}

function isTimelineEntry(value: unknown): value is TimelineEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.id === 'string'
    && typeof entry.period === 'string'
    && typeof entry.title === 'string'
    && typeof entry.text === 'string';
}

function applyRowsToContent(
  base: AgadirHistoryContent,
  rows: PageContentRow[],
): AgadirHistoryContent {
  for (const row of rows) {
    if (row.lang !== 'fr' && row.lang !== 'ar') continue;
    const key = row.section_id as keyof AgadirHistoryLanguageContent;
    if (!(key in base[row.lang])) continue;

    if (row.content_type === 'text' && typeof row.content === 'string') {
      (base[row.lang] as unknown as Record<string, unknown>)[key] = row.content;
      continue;
    }

    if (row.content_type === 'array' && Array.isArray(row.content_json)) {
      const values = row.content_json.filter((value): value is string => typeof value === 'string');
      (base[row.lang] as unknown as Record<string, unknown>)[key] = values;
      continue;
    }

    if (row.content_type === 'json' && key === 'timeline' && Array.isArray(row.content_json)) {
      (base[row.lang] as unknown as Record<string, unknown>)[key] = row.content_json.filter(isTimelineEntry);
    }
  }
  return base;
}

export async function loadAgadirHistoryContent(
  pageId?: AgadirHistoryPageId,
): Promise<{ content: AgadirHistoryContent; source: 'supabase' | 'fallback' }> {
  const fallback = cloneAgadirHistoryContent();
  if (!supabase) return { content: fallback, source: 'fallback' };

  let query = supabase
    .from('page_contents')
    .select('page_id,section_id,lang,content_type,content,content_json,display_order')
    .order('display_order', { ascending: true });

  query = pageId ? query.eq('page_id', pageId) : query.in('page_id', editorialPages.map((page) => page.id));
  const { data, error } = await query;
  if (error || !data?.length) return { content: fallback, source: 'fallback' };

  return {
    content: applyRowsToContent(fallback, data as PageContentRow[]),
    source: 'supabase',
  };
}

export function buildPageContentRows(
  page: EditorialPageDefinition,
  content: AgadirHistoryContent,
  updatedBy: string,
) {
  return page.sections.flatMap((section, sectionIndex) => (
    (['fr', 'ar'] as const).map((lang) => {
      const value = content[lang][section.id];
      return {
        page_id: page.id,
        section_id: section.id,
        lang,
        content_type: section.type === 'timeline' ? 'json' : section.type,
        content: section.type === 'text' ? String(value) : null,
        content_json: section.type === 'text' ? null : value,
        display_order: sectionIndex,
        updated_by: updatedBy,
      };
    })
  ));
}

export async function saveAgadirHistoryPage(
  page: EditorialPageDefinition,
  content: AgadirHistoryContent,
  updatedBy: string,
) {
  if (!supabase) throw new Error('Supabase non configuré.');
  const rows = buildPageContentRows(page, content, updatedBy);
  const { error } = await supabase
    .from('page_contents')
    .upsert(rows, { onConflict: 'page_id,section_id,lang' });
  if (error) throw error;
}

export async function loadPageMedia(pageId: EditorialPageId) {
  if (!supabase) return [] as PageMediaRow[];
  const { data, error } = await supabase
    .from('page_media')
    .select('id,page_id,media_type,lang,file_path,public_url')
    .eq('page_id', pageId);
  if (error) return [] as PageMediaRow[];
  return (data ?? []) as PageMediaRow[];
}

export async function savePageMedia(params: {
  pageId: EditorialPageId;
  mediaType: 'audio' | 'image';
  lang: string | null;
  file: File;
}) {
  if (!supabase) throw new Error('Supabase non configuré.');
  const preparedFile = params.mediaType === 'image'
    ? await prepareEditorialImage(params.file)
    : validateEditorialAudio(params.file);
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session?.access_token) {
    throw new Error('Votre session Président a expiré. Reconnectez-vous puis réessayez.');
  }

  const response = await fetch('/api/editorial-media', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sessionData.session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pageId: params.pageId,
      mediaType: params.mediaType,
      lang: params.lang,
      fileName: preparedFile.name,
      contentType: preparedFile.type,
      base64: await fileToBase64(preparedFile),
    }),
  });
  const result = await response.json().catch(() => ({})) as { error?: string; publicUrl?: string };
  if (!response.ok || !result.publicUrl) {
    throw new Error(result.error || 'Le média n’a pas pu être envoyé.');
  }
  return result.publicUrl;
}

async function changePageMedia(params: {
  pageId: EditorialPageId;
  mediaType: 'audio' | 'image';
  lang: string | null;
  action: 'delete' | 'restore';
  filePath?: string;
}) {
  if (!supabase) throw new Error('Supabase non configuré.');
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session?.access_token) {
    throw new Error('Votre session Président a expiré. Reconnectez-vous puis réessayez.');
  }
  const response = await fetch('/api/editorial-media', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sessionData.session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  const result = await response.json().catch(() => ({})) as { error?: string; publicUrl?: string | null };
  if (!response.ok) throw new Error(result.error || 'Le média n’a pas pu être modifié.');
  return result.publicUrl ?? null;
}

export function deletePageMedia(params: {
  pageId: EditorialPageId;
  mediaType: 'audio' | 'image';
  lang: string | null;
}) {
  return changePageMedia({ ...params, action: 'delete' });
}

export function restorePageMedia(params: {
  pageId: EditorialPageId;
  mediaType: 'audio' | 'image';
  lang: string | null;
  filePath: string;
}) {
  return changePageMedia({ ...params, action: 'restore' });
}

const MAX_AUDIO_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_SOURCE_BYTES = 15 * 1024 * 1024;
const MAX_IMAGE_UPLOAD_BYTES = 2.5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1800;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

function validateEditorialAudio(file: File) {
  const isMp3 = file.type === 'audio/mpeg' || file.name.toLowerCase().endsWith('.mp3');
  if (!isMp3) throw new Error('Choisissez un fichier audio MP3.');
  if (file.size > MAX_AUDIO_BYTES) throw new Error('Le fichier MP3 dépasse la limite de 5 Mo.');
  return file;
}

async function prepareEditorialImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Choisissez une image JPG, PNG, WebP ou AVIF.');
  }
  if (file.size > MAX_IMAGE_SOURCE_BYTES) {
    throw new Error('La photo dépasse 15 Mo. Choisissez une photo plus légère.');
  }
  if (file.size <= MAX_IMAGE_UPLOAD_BYTES) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('Cette photo ne peut pas être lue. Essayez une image JPG ou PNG.');
  }

  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new Error('La préparation de la photo a échoué.');
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.82);
  });
  if (!blob) throw new Error('La compression de la photo a échoué.');
  if (blob.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error('La photo reste trop lourde après compression. Choisissez une photo plus petite.');
  }
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Lecture du fichier impossible.'));
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const separator = result.indexOf(',');
      if (separator < 0) {
        reject(new Error('Le fichier sélectionné est invalide.'));
        return;
      }
      resolve(result.slice(separator + 1));
    };
    reader.readAsDataURL(file);
  });
}
