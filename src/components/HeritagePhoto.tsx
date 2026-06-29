import { Image } from 'lucide-react';
import { useEffect, useState } from 'react';

type HeritagePhotoProps = {
  alt: string;
  imagePath?: string;
  label: string;
};

export default function HeritagePhoto({ alt, imagePath, label }: HeritagePhotoProps) {
  const [status, setStatus] = useState<'checking' | 'ready' | 'failed'>(imagePath ? 'checking' : 'failed');

  useEffect(() => {
    let active = true;
    if (!imagePath) {
      setStatus('failed');
      return;
    }

    setStatus('checking');
    const probe = new window.Image();
    probe.onload = () => {
      if (active) setStatus('ready');
    };
    probe.onerror = () => {
      if (active) setStatus('failed');
    };
    probe.src = imagePath;

    return () => {
      active = false;
      probe.onload = null;
      probe.onerror = null;
    };
  }, [imagePath]);

  const showImage = imagePath && status === 'ready';

  if (showImage) {
    return (
      <div className="heritage-photo">
        <img src={imagePath} alt={alt} onError={() => setStatus('failed')} loading="lazy" />
      </div>
    );
  }

  return (
    <div className="heritage-placeholder heritage-photo-fallback" aria-label={label}>
      <span className="heritage-amazigh-border" aria-hidden="true" />
      <Image size={34} />
      <span>{label}</span>
    </div>
  );
}
