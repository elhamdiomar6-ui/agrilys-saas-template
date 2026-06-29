import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Eye,
  FileAudio,
  Image,
  Plus,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { AgadirHistoryView } from '../components/AgadirHistory';
import AudioHelp from '../components/AudioHelp';
import EditorialVersionHistory from '../components/EditorialVersionHistory';
import { useAuth } from '../lib/auth/supabaseAuth';
import {
  agadirHistoryFallback,
  cloneAgadirHistoryContent,
  deletePageMedia,
  editorialPages,
  loadAgadirHistoryContent,
  loadPageMedia,
  restorePageMedia,
  saveAgadirHistoryPage,
  savePageMedia,
} from '../lib/agadirHistoryContent';
import {
  clearEditorialDraft,
  createEditorialVersion,
  loadEditorialDraft,
  loadEditorialVersions,
  mediaRowsToSnapshot,
  saveEditorialDraft,
} from '../lib/editorialVersions';
import { loadPublicEditorialCopy, savePublicEditorialCopy } from '../lib/publicEditorialContent';
import { publicEditorialPages } from '../lib/publicEditorialRegistry';
import type { GenericEditorialPage } from '../lib/publicEditorialRegistry';
import type {
  AgadirHistoryContent,
  AgadirHistoryLanguageContent,
  EditorialLang,
  EditorialPageDefinition,
  TimelineEntry,
} from '../lib/agadirHistoryContent';
import type { EditorialMediaSnapshot, EditorialVersion } from '../lib/editorialVersions';

type PresidentContentEditorProps = {
  lang: EditorialLang;
  onBack: () => void;
};

type GenericCopy = Record<'fr' | 'ar', Record<string, unknown>>;

const emptyMedia: EditorialMediaSnapshot = { audio: null, image: null };

function updateLanguageValue<K extends keyof AgadirHistoryLanguageContent>(
  content: AgadirHistoryContent,
  lang: EditorialLang,
  key: K,
  value: AgadirHistoryLanguageContent[K],
) {
  return {
    ...content,
    [lang]: {
      ...content[lang],
      [key]: value,
    },
  };
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function uid() {
  return globalThis.crypto?.randomUUID?.() ?? `item-${Date.now()}-${Math.random()}`;
}

function setNestedValue(source: Record<string, unknown>, path: string[], value: unknown) {
  const next = structuredClone(source);
  let cursor: Record<string, unknown> = next;
  path.forEach((part, index) => {
    if (index === path.length - 1) {
      cursor[part] = value;
      return;
    }
    cursor[part] = typeof cursor[part] === 'object' && cursor[part] !== null
      ? cursor[part]
      : {};
    cursor = cursor[part] as Record<string, unknown>;
  });
  return next;
}

async function restoreMediaSnapshot(
  pageId: EditorialVersion['pageId'],
  media: EditorialMediaSnapshot,
) {
  for (const mediaType of ['audio', 'image'] as const) {
    const item = media[mediaType];
    const lang = mediaType === 'audio' ? 'darija' : null;
    if (item?.file_path) {
      await restorePageMedia({ pageId, mediaType, lang, filePath: item.file_path });
    } else {
      await deletePageMedia({ pageId, mediaType, lang });
    }
  }
  return mediaRowsToSnapshot(await loadPageMedia(pageId));
}

function GenericDraftPreview({ draft }: { draft: GenericCopy }) {
  const renderValue = (value: unknown, key: string): React.ReactNode => {
    if (typeof value === 'string') return <p key={key}><strong>{key}</strong><span>{value}</span></p>;
    if (Array.isArray(value)) {
      return (
        <div key={key}>
          <strong>{key}</strong>
          <ul>{value.map((item, index) => <li key={`${key}-${index}`}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>)}</ul>
        </div>
      );
    }
    if (value && typeof value === 'object') {
      return (
        <div key={key}>
          <strong>{key}</strong>
          {Object.entries(value).map(([childKey, child]) => renderValue(child, childKey))}
        </div>
      );
    }
    return null;
  };

  return (
    <section className="editor-preview">
      <h2>Aperçu du brouillon</h2>
      <div className="editor-language-grid">
        {(['fr', 'ar'] as const).map((fieldLang) => (
          <article className="editor-generic-preview" dir={fieldLang === 'ar' ? 'rtl' : 'ltr'} key={fieldLang}>
            <h3>{fieldLang === 'fr' ? 'Français' : 'العربية'}</h3>
            {Object.entries(draft[fieldLang]).map(([key, value]) => renderValue(value, key))}
          </article>
        ))}
      </div>
    </section>
  );
}

function GenericValueEditor({
  value,
  path,
  onChange,
}: {
  value: unknown;
  path: string[];
  onChange: (path: string[], value: unknown) => void;
}) {
  const label = path[path.length - 1].replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
  if (typeof value === 'string') {
    return (
      <label className="editor-field">
        <span>{label}</span>
        <textarea value={value} onChange={(event) => onChange(path, event.target.value)} rows={value.length > 100 ? 5 : 2} />
      </label>
    );
  }
  if (Array.isArray(value)) {
    return (
      <div className="editor-nested-group">
        <strong>{label}</strong>
        {value.map((item, index) => (
          <label className="editor-field" key={`${path.join('.')}-${index}`}>
            <span>#{index + 1}</span>
            <textarea
              value={typeof item === 'string' ? item : JSON.stringify(item)}
              onChange={(event) => {
                const items = [...value];
                items[index] = event.target.value;
                onChange(path, items);
              }}
              rows={3}
            />
          </label>
        ))}
      </div>
    );
  }
  if (value && typeof value === 'object') {
    return (
      <fieldset className="editor-nested-group">
        <legend>{label}</legend>
        {Object.entries(value).map(([key, child]) => (
          <GenericValueEditor key={key} value={child} path={[...path, key]} onChange={onChange} />
        ))}
      </fieldset>
    );
  }
  return null;
}

function GenericPublicPageEditor({
  page,
  lang,
}: {
  page: GenericEditorialPage;
  lang: EditorialLang;
}) {
  const auth = useAuth();
  const [draft, setDraft] = useState<GenericCopy>(() => structuredClone(page.fallback));
  const [publishedCopy, setPublishedCopy] = useState<GenericCopy>(() => structuredClone(page.fallback));
  const [media, setMedia] = useState<EditorialMediaSnapshot>(emptyMedia);
  const [versions, setVersions] = useState<EditorialVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [uploading, setUploading] = useState<'audio' | 'image' | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setMessage('');
    setError('');
    Promise.all([
      loadPublicEditorialCopy(page.id, page.fallback),
      loadPageMedia(page.id),
      loadEditorialVersions(page.id),
    ])
      .then(([copyResult, mediaRows, loadedVersions]) => {
        if (!active) return;
        const localDraft = loadEditorialDraft<GenericCopy>(page.id);
        setPublishedCopy(copyResult.copy);
        setDraft(localDraft?.content ?? copyResult.copy);
        setMedia(mediaRowsToSnapshot(mediaRows));
        setVersions(loadedVersions);
        if (localDraft) {
          setMessage(`Brouillon local restauré (${new Intl.DateTimeFormat('fr-MA', {
            dateStyle: 'short',
            timeStyle: 'short',
          }).format(new Date(localDraft.savedAt))}).`);
          return;
        }
        if (copyResult.source === 'fallback') {
          setMessage('Le contenu actuel est prêt pour la première publication Supabase.');
        }
      })
      .catch(() => {
        if (active) {
          setDraft(structuredClone(page.fallback));
          setMessage('Supabase indisponible : fallback chargé.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page]);

  const publish = async () => {
    if (!auth.user || auth.role !== 'president') return;
    if (!window.confirm(`Publier maintenant les modifications de la page « ${page.label} » ?`)) return;
    setSaving(true);
    setError('');
    try {
      await createEditorialVersion({
        pageId: page.id,
        contentKind: 'generic',
        content: publishedCopy,
        media,
        action: 'Avant publication des textes',
        updatedBy: auth.user.id,
      });
      await savePublicEditorialCopy(page.id, draft, auth.user.id);
      setPublishedCopy(structuredClone(draft));
      clearEditorialDraft(page.id);
      setVersions(await loadEditorialVersions(page.id));
      setMessage('Publication réussie. Les textes sont visibles immédiatement.');
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Publication impossible.');
    } finally {
      setSaving(false);
    }
  };

  const upload = async (mediaType: 'audio' | 'image', file?: File) => {
    if (!file || !auth.user || auth.role !== 'president') return;
    setUploading(mediaType);
    setError('');
    try {
      await createEditorialVersion({
        pageId: page.id,
        contentKind: 'generic',
        content: publishedCopy,
        media,
        action: mediaType === 'audio' ? 'Avant remplacement de l’audio' : 'Avant remplacement de l’image',
        updatedBy: auth.user.id,
      });
      await savePageMedia({
        pageId: page.id,
        mediaType,
        lang: mediaType === 'audio' ? 'darija' : null,
        file,
      });
      setMedia(mediaRowsToSnapshot(await loadPageMedia(page.id)));
      setVersions(await loadEditorialVersions(page.id));
      setMessage(mediaType === 'audio' ? 'Audio remplacé.' : 'Image remplacée.');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Envoi impossible.');
    } finally {
      setUploading(null);
    }
  };

  const removeMedia = async (mediaType: 'audio' | 'image') => {
    if (!auth.user || auth.role !== 'president') return;
    const label = mediaType === 'audio' ? 'l’audio publié' : 'l’image publiée';
    if (!window.confirm(`Retirer ${label} de cette page ? Une restauration restera possible dans l’historique.`)) return;
    setUploading(mediaType);
    setError('');
    try {
      await createEditorialVersion({
        pageId: page.id,
        contentKind: 'generic',
        content: publishedCopy,
        media,
        action: mediaType === 'audio' ? 'Avant retrait de l’audio' : 'Avant retrait de l’image',
        updatedBy: auth.user.id,
      });
      await deletePageMedia({
        pageId: page.id,
        mediaType,
        lang: mediaType === 'audio' ? 'darija' : null,
      });
      setMedia(mediaRowsToSnapshot(await loadPageMedia(page.id)));
      setVersions(await loadEditorialVersions(page.id));
      setMessage(mediaType === 'audio' ? 'Audio retiré.' : 'Image retirée.');
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Suppression impossible.');
    } finally {
      setUploading(null);
    }
  };

  const restoreVersion = async (version: EditorialVersion) => {
    if (!auth.user || auth.role !== 'president') return;
    if (!window.confirm('Restaurer cette version ? L’état actuel sera sauvegardé automatiquement.')) return;
    setRestoring(true);
    setError('');
    try {
      await createEditorialVersion({
        pageId: page.id,
        contentKind: 'generic',
        content: publishedCopy,
        media,
        action: 'Avant restauration d’une ancienne version',
        updatedBy: auth.user.id,
      });
      const restoredCopy = structuredClone(version.content) as GenericCopy;
      await savePublicEditorialCopy(page.id, restoredCopy, auth.user.id);
      setMedia(await restoreMediaSnapshot(page.id, version.media));
      setPublishedCopy(restoredCopy);
      setDraft(restoredCopy);
      clearEditorialDraft(page.id);
      setVersions(await loadEditorialVersions(page.id));
      setMessage('Version restaurée et publiée.');
    } catch (restoreError) {
      setError(restoreError instanceof Error ? restoreError.message : 'Restauration impossible.');
    } finally {
      setRestoring(false);
    }
  };

  const saveDraft = () => {
    saveEditorialDraft(page.id, draft);
    setMessage('Brouillon enregistré sur cet appareil. Il n’est pas encore public.');
  };

  if (loading) return <p className="empty-state">Chargement du contenu…</p>;

  return (
    <>
      <div className="editor-language-grid editor-generic-grid">
        {(['fr', 'ar'] as const).map((fieldLang) => (
          <section className="editor-section" key={fieldLang} dir={fieldLang === 'ar' ? 'rtl' : 'ltr'}>
            <h2>{fieldLang === 'fr' ? 'Français' : 'العربية'}</h2>
            {Object.entries(draft[fieldLang]).map(([key, value]) => (
              <GenericValueEditor
                key={key}
                value={value}
                path={[key]}
                onChange={(path, nextValue) => setDraft((current) => ({
                  ...current,
                  [fieldLang]: setNestedValue(current[fieldLang], path, nextValue),
                }))}
              />
            ))}
          </section>
        ))}
      </div>

      <section className="editor-media-section">
        <h2>Médias de la page</h2>
        <div className="editor-media-grid">
          <article className="editor-media-card">
            <FileAudio size={24} />
            <h3>Audio darija</h3>
            {media.audio?.public_url || page.localAudio ? (
              <audio controls preload="metadata" src={media.audio?.public_url ?? `/audio/darija/${page.audioScriptId}.mp3`} />
            ) : <p className="empty-state">Aucun audio publié</p>}
            <label className="secondary-action editor-upload-button">
              <Upload size={18} /> {uploading === 'audio' ? 'Envoi…' : 'Remplacer l’audio'}
              <input type="file" accept="audio/mpeg,.mp3" disabled={uploading !== null} onChange={(event) => void upload('audio', event.target.files?.[0])} />
            </label>
            {media.audio ? (
              <button className="danger-action" type="button" disabled={uploading !== null} onClick={() => void removeMedia('audio')}>
                <Trash2 size={17} /> Retirer le remplacement
              </button>
            ) : null}
          </article>
          {page.supportsImage ? (
            <article className="editor-media-card">
              <Image size={24} />
              <h3>Image principale</h3>
              {media.image?.public_url ? <img src={media.image.public_url} alt="Aperçu actuel" /> : <p className="empty-state">Aucune image publiée</p>}
              <label className="secondary-action editor-upload-button">
                <Upload size={18} /> {uploading === 'image' ? 'Envoi…' : 'Remplacer l’image'}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading !== null} onChange={(event) => void upload('image', event.target.files?.[0])} />
              </label>
              {media.image ? (
                <button className="danger-action" type="button" disabled={uploading !== null} onClick={() => void removeMedia('image')}>
                  <Trash2 size={17} /> Retirer l’image
                </button>
              ) : null}
            </article>
          ) : null}
        </div>
      </section>

      <div className="editor-actions">
        <button className="secondary-action" type="button" onClick={saveDraft} disabled={saving || uploading !== null}>
          <Save size={19} /> Enregistrer le brouillon
        </button>
        <button className="secondary-action" type="button" onClick={() => setShowPreview((current) => !current)}>
          <Eye size={19} /> {showPreview ? 'Fermer l’aperçu' : 'Aperçu'}
        </button>
        <button className="primary-action" type="button" onClick={() => void publish()} disabled={saving || uploading !== null}>
          <Save size={19} /> {saving ? 'Publication…' : 'Publier'}
        </button>
      </div>
      {showPreview ? <GenericDraftPreview draft={draft} /> : null}
      <EditorialVersionHistory versions={versions} restoring={restoring} onRestore={(version) => void restoreVersion(version)} />
      {message ? <p className="success-text" role="status">{lang === 'ar' ? message : message}</p> : null}
      {error ? <p className="error-text" role="alert">{error}</p> : null}
    </>
  );
}

export default function PresidentContentEditor({ lang, onBack }: PresidentContentEditorProps) {
  const auth = useAuth();
  const [selectedPageId, setSelectedPageId] = useState<string>(editorialPages[0].id);
  const [draft, setDraft] = useState<AgadirHistoryContent>(cloneAgadirHistoryContent);
  const [publishedContent, setPublishedContent] = useState<AgadirHistoryContent>(cloneAgadirHistoryContent);
  const [media, setMedia] = useState<EditorialMediaSnapshot>(emptyMedia);
  const [versions, setVersions] = useState<EditorialVersion[]>([]);
  const [previewLang, setPreviewLang] = useState<EditorialLang>(lang);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [uploading, setUploading] = useState<'audio' | 'image' | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const selectedPage = editorialPages.find((page) => page.id === selectedPageId) ?? editorialPages[0];
  const selectedGenericPage = publicEditorialPages.find((page) => page.id === selectedPageId);
  const isArabicInterface = lang === 'ar';

  useEffect(() => {
    if (selectedGenericPage) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError('');
    setMessage('');
    Promise.all([
      loadAgadirHistoryContent(selectedPage.id),
      loadPageMedia(selectedPage.id),
      loadEditorialVersions(selectedPage.id),
    ])
      .then(([contentResult, mediaRows, loadedVersions]) => {
        if (!active) return;
        const localDraft = loadEditorialDraft<AgadirHistoryContent>(selectedPage.id);
        setPublishedContent(contentResult.content);
        setDraft(localDraft?.content ?? contentResult.content);
        setMedia(mediaRowsToSnapshot(mediaRows));
        setVersions(loadedVersions);
        if (localDraft) {
          setMessage(isArabicInterface
            ? 'تم استرجاع المسودة المحفوظة على هذا الجهاز.'
            : `Brouillon local restauré (${new Intl.DateTimeFormat('fr-MA', {
              dateStyle: 'short',
              timeStyle: 'short',
            }).format(new Date(localDraft.savedAt))}).`);
          return;
        }
        if (contentResult.source === 'fallback') {
          setMessage(isArabicInterface
            ? 'لا يوجد محتوى محفوظ بعد. المحتوى الحالي جاهز للنشر الأول.'
            : 'Aucun contenu enregistré pour cette page : le contenu actuel est prêt pour la première publication.');
        }
      })
      .catch(() => {
        if (!active) return;
        setDraft(cloneAgadirHistoryContent());
        setMedia(emptyMedia);
        setMessage(isArabicInterface
          ? 'تعذر الاتصال بقاعدة البيانات. تم تحميل النسخة الاحتياطية.'
          : 'Supabase est indisponible : le contenu de secours a été chargé.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isArabicInterface, selectedGenericPage, selectedPageId]);

  const publish = async () => {
    if (!auth.user || auth.role !== 'president') {
      setError(isArabicInterface ? 'خاص حساب الرئيس للنشر.' : 'Une session Président est requise pour publier.');
      return;
    }
    if (!window.confirm(`Publier maintenant les modifications de la page « ${selectedPage.label} » ?`)) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await createEditorialVersion({
        pageId: selectedPage.id,
        contentKind: 'history',
        content: publishedContent,
        media,
        action: 'Avant publication des textes',
        updatedBy: auth.user.id,
      });
      await saveAgadirHistoryPage(selectedPage, draft, auth.user.id);
      setPublishedContent(structuredClone(draft));
      clearEditorialDraft(selectedPage.id);
      setVersions(await loadEditorialVersions(selectedPage.id));
      setMessage(isArabicInterface
        ? 'تم النشر. التغييرات ظاهرة دابا فالصفحة العمومية.'
        : 'Publication réussie. Les changements sont maintenant visibles sur la page publique.');
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Publication impossible.');
    } finally {
      setSaving(false);
    }
  };

  const uploadMedia = async (mediaType: 'audio' | 'image', file: File | undefined) => {
    if (!file || !auth.user || auth.role !== 'president') return;
    setUploading(mediaType);
    setError('');
    setMessage('');
    try {
      await createEditorialVersion({
        pageId: selectedPage.id,
        contentKind: 'history',
        content: publishedContent,
        media,
        action: mediaType === 'audio' ? 'Avant remplacement de l’audio' : 'Avant remplacement de l’image',
        updatedBy: auth.user.id,
      });
      await savePageMedia({
        pageId: selectedPage.id,
        mediaType,
        lang: mediaType === 'audio' ? 'darija' : null,
        file,
      });
      setMedia(mediaRowsToSnapshot(await loadPageMedia(selectedPage.id)));
      setVersions(await loadEditorialVersions(selectedPage.id));
      setMessage(mediaType === 'audio'
        ? 'Audio remplacé et publié.'
        : 'Image remplacée et publiée.');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Envoi impossible.');
    } finally {
      setUploading(null);
    }
  };

  const removeMedia = async (mediaType: 'audio' | 'image') => {
    if (!auth.user || auth.role !== 'president') return;
    if (!window.confirm(`Retirer ${mediaType === 'audio' ? 'l’audio publié' : 'l’image publiée'} ? Une restauration restera possible.`)) return;
    setUploading(mediaType);
    setError('');
    setMessage('');
    try {
      await createEditorialVersion({
        pageId: selectedPage.id,
        contentKind: 'history',
        content: publishedContent,
        media,
        action: mediaType === 'audio' ? 'Avant retrait de l’audio' : 'Avant retrait de l’image',
        updatedBy: auth.user.id,
      });
      await deletePageMedia({
        pageId: selectedPage.id,
        mediaType,
        lang: mediaType === 'audio' ? 'darija' : null,
      });
      setMedia(mediaRowsToSnapshot(await loadPageMedia(selectedPage.id)));
      setVersions(await loadEditorialVersions(selectedPage.id));
      setMessage(mediaType === 'audio' ? 'Audio retiré.' : 'Image retirée.');
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Suppression impossible.');
    } finally {
      setUploading(null);
    }
  };

  const restoreVersion = async (version: EditorialVersion) => {
    if (!auth.user || auth.role !== 'president') return;
    if (!window.confirm('Restaurer cette version ? L’état actuel sera sauvegardé automatiquement.')) return;
    setRestoring(true);
    setError('');
    setMessage('');
    try {
      await createEditorialVersion({
        pageId: selectedPage.id,
        contentKind: 'history',
        content: publishedContent,
        media,
        action: 'Avant restauration d’une ancienne version',
        updatedBy: auth.user.id,
      });
      const restoredContent = structuredClone(version.content) as AgadirHistoryContent;
      await saveAgadirHistoryPage(selectedPage, restoredContent, auth.user.id);
      setMedia(await restoreMediaSnapshot(selectedPage.id, version.media));
      setPublishedContent(restoredContent);
      setDraft(restoredContent);
      clearEditorialDraft(selectedPage.id);
      setVersions(await loadEditorialVersions(selectedPage.id));
      setMessage('Version restaurée et publiée.');
    } catch (restoreError) {
      setError(restoreError instanceof Error ? restoreError.message : 'Restauration impossible.');
    } finally {
      setRestoring(false);
    }
  };

  const saveDraft = () => {
    saveEditorialDraft(selectedPage.id, draft);
    setMessage(isArabicInterface
      ? 'تم حفظ المسودة على هذا الجهاز ولم تُنشر بعد.'
      : 'Brouillon enregistré sur cet appareil. Il n’est pas encore public.');
  };

  const renderTextSection = (
    section: EditorialPageDefinition['sections'][number],
  ) => (
    <div className="editor-language-grid">
      {(['fr', 'ar'] as const).map((fieldLang) => (
        <label className="editor-field" key={fieldLang} dir={fieldLang === 'ar' ? 'rtl' : 'ltr'}>
          <span>{fieldLang === 'fr' ? 'Français' : 'العربية'}</span>
          <textarea
            value={String(draft[fieldLang][section.id])}
            onChange={(event) => setDraft((current) => updateLanguageValue(
              current,
              fieldLang,
              section.id,
              event.target.value as never,
            ))}
            rows={section.id.toLowerCase().includes('title') ? 2 : 6}
          />
        </label>
      ))}
    </div>
  );

  const renderArraySection = (
    section: EditorialPageDefinition['sections'][number],
  ) => {
    const frenchItems = draft.fr[section.id] as string[];
    const arabicItems = draft.ar[section.id] as string[];
    const itemCount = Math.max(frenchItems.length, arabicItems.length);

    const updateItem = (fieldLang: EditorialLang, index: number, value: string) => {
      const currentItems = [...(draft[fieldLang][section.id] as string[])];
      currentItems[index] = value;
      setDraft((current) => updateLanguageValue(current, fieldLang, section.id, currentItems as never));
    };

    const addItem = () => {
      setDraft((current) => {
        const next = structuredClone(current);
        (next.fr[section.id] as string[]).push('');
        (next.ar[section.id] as string[]).push('');
        return next;
      });
    };

    const removeItem = (index: number) => {
      setDraft((current) => {
        const next = structuredClone(current);
        (next.fr[section.id] as string[]).splice(index, 1);
        (next.ar[section.id] as string[]).splice(index, 1);
        return next;
      });
    };

    const reorder = (index: number, direction: -1 | 1) => {
      setDraft((current) => {
        const next = structuredClone(current);
        next.fr[section.id] = moveItem(next.fr[section.id] as string[], index, direction) as never;
        next.ar[section.id] = moveItem(next.ar[section.id] as string[], index, direction) as never;
        return next;
      });
    };

    return (
      <div className="editor-repeatable-list">
        {Array.from({ length: itemCount }, (_, index) => (
          <article className="editor-repeatable-item" key={`${section.id}-${index}`}>
            <div className="editor-item-toolbar">
              <strong>#{index + 1}</strong>
              <button type="button" onClick={() => reorder(index, -1)} disabled={index === 0} aria-label="Monter"><ArrowUp size={17} /></button>
              <button type="button" onClick={() => reorder(index, 1)} disabled={index === itemCount - 1} aria-label="Descendre"><ArrowDown size={17} /></button>
              <button type="button" onClick={() => removeItem(index)} aria-label="Supprimer"><Trash2 size={17} /></button>
            </div>
            <div className="editor-language-grid">
              <label className="editor-field"><span>Français</span><textarea value={frenchItems[index] ?? ''} onChange={(event) => updateItem('fr', index, event.target.value)} rows={4} /></label>
              <label className="editor-field" dir="rtl"><span>العربية</span><textarea value={arabicItems[index] ?? ''} onChange={(event) => updateItem('ar', index, event.target.value)} rows={4} /></label>
            </div>
          </article>
        ))}
        <button className="secondary-action editor-add-button" type="button" onClick={addItem}><Plus size={18} /> Ajouter un paragraphe</button>
      </div>
    );
  };

  const renderTimelineSection = () => {
    const frenchItems = draft.fr.timeline;
    const arabicItems = draft.ar.timeline;
    const itemCount = Math.max(frenchItems.length, arabicItems.length);

    const updateEntry = (
      fieldLang: EditorialLang,
      index: number,
      key: keyof Omit<TimelineEntry, 'id'>,
      value: string,
    ) => {
      const entries = structuredClone(draft[fieldLang].timeline);
      entries[index] = entries[index] ?? { id: uid(), period: '', title: '', text: '' };
      entries[index][key] = value;
      setDraft((current) => updateLanguageValue(current, fieldLang, 'timeline', entries));
    };

    const addEntry = () => {
      const id = uid();
      setDraft((current) => ({
        fr: { ...current.fr, timeline: [...current.fr.timeline, { id, period: '', title: '', text: '' }] },
        ar: { ...current.ar, timeline: [...current.ar.timeline, { id, period: '', title: '', text: '' }] },
      }));
    };

    const removeEntry = (index: number) => {
      setDraft((current) => ({
        fr: { ...current.fr, timeline: current.fr.timeline.filter((_, itemIndex) => itemIndex !== index) },
        ar: { ...current.ar, timeline: current.ar.timeline.filter((_, itemIndex) => itemIndex !== index) },
      }));
    };

    const reorder = (index: number, direction: -1 | 1) => {
      setDraft((current) => ({
        fr: { ...current.fr, timeline: moveItem(current.fr.timeline, index, direction) },
        ar: { ...current.ar, timeline: moveItem(current.ar.timeline, index, direction) },
      }));
    };

    return (
      <div className="editor-repeatable-list">
        {Array.from({ length: itemCount }, (_, index) => (
          <article className="editor-repeatable-item" key={frenchItems[index]?.id ?? arabicItems[index]?.id ?? index}>
            <div className="editor-item-toolbar">
              <strong>Repère #{index + 1}</strong>
              <button type="button" onClick={() => reorder(index, -1)} disabled={index === 0} aria-label="Monter"><ArrowUp size={17} /></button>
              <button type="button" onClick={() => reorder(index, 1)} disabled={index === itemCount - 1} aria-label="Descendre"><ArrowDown size={17} /></button>
              <button type="button" onClick={() => removeEntry(index)} aria-label="Supprimer"><Trash2 size={17} /></button>
            </div>
            <div className="editor-language-grid">
              {(['fr', 'ar'] as const).map((fieldLang) => {
                const entry = draft[fieldLang].timeline[index] ?? { id: '', period: '', title: '', text: '' };
                return (
                  <div className="editor-timeline-language" key={fieldLang} dir={fieldLang === 'ar' ? 'rtl' : 'ltr'}>
                    <strong>{fieldLang === 'fr' ? 'Français' : 'العربية'}</strong>
                    <label className="editor-field"><span>Période</span><input value={entry.period} onChange={(event) => updateEntry(fieldLang, index, 'period', event.target.value)} /></label>
                    <label className="editor-field"><span>Titre</span><input value={entry.title} onChange={(event) => updateEntry(fieldLang, index, 'title', event.target.value)} /></label>
                    <label className="editor-field"><span>Texte</span><textarea value={entry.text} onChange={(event) => updateEntry(fieldLang, index, 'text', event.target.value)} rows={4} /></label>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
        <button className="secondary-action editor-add-button" type="button" onClick={addEntry}><Plus size={18} /> Ajouter un repère</button>
      </div>
    );
  };

  return (
    <section className="panel president-content-editor">
      <button className="back-button" type="button" onClick={onBack}><ArrowLeft size={18} /> {isArabicInterface ? 'رجوع' : 'Retour Président'}</button>
      <div className="brand-mark small"><Save size={28} /></div>
      <h1>{isArabicInterface ? 'محرر المحتوى العمومي' : 'Éditeur de contenu public'}</h1>
      <p className="intro">
        {isArabicInterface
          ? 'عدل النصوص الفرنسية والعربية ثم عاينها قبل النشر.'
          : 'Modifiez les textes français et arabes, prévisualisez-les, puis publiez-les sans nouveau déploiement.'}
      </p>
      <AudioHelp scriptId="president-editor" />

      <label className="editor-page-select">
        <span>Page publique</span>
        <select value={selectedPageId} onChange={(event) => setSelectedPageId(event.target.value)}>
          {editorialPages.map((page) => <option value={page.id} key={page.id}>{page.label}</option>)}
          {publicEditorialPages.map((page) => <option value={page.id} key={page.id}>{page.label}</option>)}
        </select>
      </label>

      {selectedGenericPage ? <GenericPublicPageEditor page={selectedGenericPage} lang={lang} /> : loading ? <p className="empty-state">Chargement du contenu…</p> : (
        <>
          <div className="editor-sections">
            {selectedPage.sections.map((section) => (
              <section className="editor-section" key={section.id}>
                <h2>{section.label}</h2>
                {section.type === 'text' ? renderTextSection(section) : null}
                {section.type === 'array' ? renderArraySection(section) : null}
                {section.type === 'timeline' ? renderTimelineSection() : null}
              </section>
            ))}
          </div>

          <section className="editor-media-section">
            <h2>Médias de la page</h2>
            <div className="editor-media-grid">
              <article className="editor-media-card">
                <FileAudio size={24} />
                <h3>Audio darija</h3>
                <audio controls preload="metadata" src={media.audio?.public_url ?? `/audio/darija/${selectedPage.audioScriptId}.mp3`} />
                <label className="secondary-action editor-upload-button">
                  <Upload size={18} /> {uploading === 'audio' ? 'Envoi…' : 'Remplacer l’audio'}
                  <input type="file" accept="audio/mpeg,.mp3" disabled={uploading !== null} onChange={(event) => void uploadMedia('audio', event.target.files?.[0])} />
                </label>
                {media.audio ? (
                  <button className="danger-action" type="button" disabled={uploading !== null} onClick={() => void removeMedia('audio')}>
                    <Trash2 size={17} /> Retirer le remplacement
                  </button>
                ) : null}
              </article>
              <article className="editor-media-card">
                <Image size={24} />
                <h3>Image principale</h3>
                {media.image?.public_url ? <img src={media.image.public_url} alt="Aperçu actuel" /> : <p className="empty-state">Aucune image éditoriale</p>}
                <label className="secondary-action editor-upload-button">
                  <Upload size={18} /> {uploading === 'image' ? 'Envoi…' : 'Remplacer l’image'}
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading !== null} onChange={(event) => void uploadMedia('image', event.target.files?.[0])} />
                </label>
                {media.image ? (
                  <button className="danger-action" type="button" disabled={uploading !== null} onClick={() => void removeMedia('image')}>
                    <Trash2 size={17} /> Retirer l’image
                  </button>
                ) : null}
              </article>
            </div>
          </section>

          <div className="editor-actions">
            <button className="secondary-action" type="button" onClick={saveDraft} disabled={saving || uploading !== null}>
              <Save size={19} /> Enregistrer le brouillon
            </button>
            <button className="secondary-action" type="button" onClick={() => setShowPreview((current) => !current)}><Eye size={19} /> {showPreview ? 'Fermer l’aperçu' : 'Aperçu'}</button>
            <button className="primary-action" type="button" onClick={() => void publish()} disabled={saving || uploading !== null}><Save size={19} /> {saving ? 'Publication…' : 'Publier'}</button>
          </div>

          {message ? <p className="success-text" role="status">{message}</p> : null}
          {error ? <p className="error-text" role="alert">{error}</p> : null}

          {showPreview ? (
            <section className="editor-preview">
              <div className="editor-preview-toolbar">
                <h2>Aperçu avant publication</h2>
                <div>
                  <button type="button" className={previewLang === 'fr' ? 'active' : ''} onClick={() => setPreviewLang('fr')}>FR</button>
                  <button type="button" className={previewLang === 'ar' ? 'active' : ''} onClick={() => setPreviewLang('ar')}>AR</button>
                </div>
              </div>
              <AgadirHistoryView content={draft[previewLang] ?? agadirHistoryFallback[previewLang]} variant={selectedPage.variant} imageUrl={media.image?.public_url ?? null} />
            </section>
          ) : null}
          <EditorialVersionHistory versions={versions} restoring={restoring} onRestore={(version) => void restoreVersion(version)} />
        </>
      )}
    </section>
  );
}
