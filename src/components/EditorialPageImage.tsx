import { useEffect, useState } from 'react';
import { loadPageMedia } from '../lib/agadirHistoryContent';
import type { EditorialPageId } from '../lib/agadirHistoryContent';

export default function EditorialPageImage({ pageId, alt = '' }: { pageId: EditorialPageId; alt?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    loadPageMedia(pageId)
      .then((media) => {
        if (active) setUrl(media.find((item) => item.media_type === 'image')?.public_url ?? null);
      })
      .catch(() => {
        if (active) setUrl(null);
      });
    return () => {
      active = false;
    };
  }, [pageId]);
  return url ? <img className="editorial-page-image" src={url} alt={alt} loading="lazy" /> : null;
}
