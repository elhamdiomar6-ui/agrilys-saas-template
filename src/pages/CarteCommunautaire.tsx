import { ArrowLeft, CheckCircle2, Map, MapPin } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import CardListenButton from '../components/CardListenButton';
import 'leaflet/dist/leaflet.css';
import AudioHelp from '../components/AudioHelp';
import { readCommunityMapPoints } from '../data/communityMap';
import { readHeritageItems } from '../data/heritage';
import type { CommunityMapCategory, CommunityMapStatus } from '../types/communityMap';

type Lang = 'fr' | 'ar';

type Copy = {
  back: string;
  title: string;
  intro: string;
  empty: string;
  leafletLabel: string;
  note: string;
  statusLabel: string;
  satellite: string;
  standard: string;
  categories: Record<CommunityMapCategory, string>;
  statuses: Record<CommunityMapStatus, string>;
};

type PublicMapPoint = {
  id: string;
  title: string;
  category: CommunityMapCategory;
  description: string;
  descriptionAr?: string;
  imagePath?: string;
  status: CommunityMapStatus;
  latitude: number;
  longitude: number;
};

const douarCenter = { latitude: 29.347893, longitude: -9.291229 };

const copy: Record<Lang, Copy> = {
  fr: {
    back: 'Retour',
    title: 'Carte communautaire',
    intro: 'Carte publique Leaflet pour repérer les points communautaires publiés, sans données internes ni points sensibles.',
    empty: 'Les points validés seront ajoutés progressivement sur la carte.',
    leafletLabel: 'Carte Leaflet publique',
    note: 'Cette carte ne remplace pas un plan officiel. Aucun point sensible ni donnée interne ne sont affichés.',
    statusLabel: 'Statut',
    satellite: 'Satellite',
    standard: 'Standard',
    categories: {
      water: 'Eau',
      agriculture: 'Agriculture',
      mosquee: 'Mosquée',
      heritage: 'Patrimoine',
      collective: 'Collectif',
      historical: 'Historique',
      services: 'Services',
    },
    statuses: {
      public: 'Public',
      to_verify: 'À vérifier',
    },
  },
  ar: {
    back: 'رجوع',
    title: 'الخريطة الجماعية',
    intro: 'خريطة Leaflet عمومية لتحديد النقط الجماعية المنشورة، بدون معطيات داخلية أو نقاط حساسة.',
    empty: 'سيتم إضافة النقط المصادق عليها تدريجيا على الخريطة.',
    leafletLabel: 'خريطة Leaflet عمومية',
    note: 'هذه الخريطة لا تعوض تصميما رسميا. لا يتم عرض أي نقطة حساسة أو معطيات داخلية.',
    statusLabel: 'الحالة',
    satellite: 'صور فضائية',
    standard: 'خريطة',
    categories: {
      water: 'الماء',
      agriculture: 'الفلاحة',
      mosquee: 'المسجد',
      heritage: 'التراث',
      collective: 'جماعي',
      historical: 'تاريخي',
      services: 'خدمات',
    },
    statuses: {
      public: 'عمومي',
      to_verify: 'بحاجة إلى تحقق',
    },
  },
};

function extractGps(text: string) {
  const latitude = text.match(/latitude\s*:?\s*(-?\d+(?:\.\d+)?)/i);
  const longitude = text.match(/longitude\s*:?\s*(-?\d+(?:\.\d+)?)/i);
  if (!latitude || !longitude) return null;
  return { latitude: Number(latitude[1]), longitude: Number(longitude[1]) };
}

function buildPublicMapPoints(): PublicMapPoint[] {
  const communityPoints = readCommunityMapPoints()
    .filter((point) => point.published)
    .map((point) => ({
      id: point.id,
      title: point.title,
      category: point.category,
      description: point.description,
      status: point.status,
      latitude: douarCenter.latitude,
      longitude: douarCenter.longitude,
    }));

  const heritagePoints = readHeritageItems()
    .filter((item) => item.published && item.status === 'published' && item.sensitivity !== 'sensitive')
    .map((item) => {
      const gps = extractGps(`${item.internalNotes} ${item.tourismInterest}`) || douarCenter;
      return {
        id: item.id,
        title: item.id === 'LOC_AGADIR_001' ? "Agadir n'Tguida" : item.title,
        category: 'heritage' as CommunityMapCategory,
        description: item.description,
        descriptionAr: item.heritageValue || undefined,
        imagePath: item.imagePath || undefined,
        status: 'public' as CommunityMapStatus,
        latitude: gps.latitude,
        longitude: gps.longitude,
      };
    });

  const points = [...heritagePoints, ...communityPoints];
  if (points.length > 0) return points;
  return [{
    id: 'MAP-AGADIR-DEMO',
    title: "Agadir n'Tguida",
    category: 'heritage',
    description: 'Repère public principal du douar.',
    status: 'public',
    latitude: douarCenter.latitude,
    longitude: douarCenter.longitude,
  }];
}

function colorForPoint(point: PublicMapPoint) {
  return point.category === 'heritage' ? '#8b6914' : '#4a7c2f';
}

function buildPopupHtml(point: PublicMapPoint) {
  const parts: string[] = [];
  if (point.imagePath) {
    parts.push(
      `<img src="${point.imagePath}" alt="${point.title}" style="width:180px;max-width:100%;border-radius:6px;display:block;margin-bottom:6px;" />`
    );
  }
  parts.push(`<strong style="font-size:1em;display:block;margin-bottom:4px;">${point.title}</strong>`);
  parts.push(`<span style="font-size:0.88em;">${point.description}</span>`);
  if (point.descriptionAr) {
    const excerpt = point.descriptionAr.split('\n')[0].slice(0, 160);
    parts.push(
      `<p style="margin:6px 0 0;font-size:0.82em;direction:rtl;text-align:right;color:#555;">${excerpt}</p>`
    );
  }
  return parts.join('');
}

const STANDARD_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const SATELLITE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

export default function CarteCommunautairePage({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const t = copy[lang];
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const standardLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  const [isSatellite, setIsSatellite] = useState(false);
  const points = useMemo(buildPublicMapPoints, []);

  useEffect(() => {
    if (!mapElementRef.current || leafletMapRef.current) return;

    const map = L.map(mapElementRef.current, {
      scrollWheelZoom: false,
    }).setView([douarCenter.latitude, douarCenter.longitude], 16);

    const standardLayer = L.tileLayer(STANDARD_URL, {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const satelliteLayer = L.tileLayer(SATELLITE_URL, {
      attribution: '&copy; Esri &mdash; Source: Esri, Maxar, GeoEye, Earthstar Geographics',
      maxZoom: 19,
    });

    standardLayerRef.current = standardLayer;
    satelliteLayerRef.current = satelliteLayer;
    markersLayerRef.current = L.layerGroup().addTo(map);
    leafletMapRef.current = map;
    setTimeout(() => map.invalidateSize(), 150);

    return () => {
      map.remove();
      leafletMapRef.current = null;
      markersLayerRef.current = null;
      standardLayerRef.current = null;
      satelliteLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = leafletMapRef.current;
    const standard = standardLayerRef.current;
    const satellite = satelliteLayerRef.current;
    if (!map || !standard || !satellite) return;
    if (isSatellite) {
      if (map.hasLayer(standard)) map.removeLayer(standard);
      if (!map.hasLayer(satellite)) satellite.addTo(map);
    } else {
      if (map.hasLayer(satellite)) map.removeLayer(satellite);
      if (!map.hasLayer(standard)) standard.addTo(map);
    }
  }, [isSatellite]);

  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    points.forEach((point) => {
      L.circleMarker([point.latitude, point.longitude], {
        radius: 9,
        color: colorForPoint(point),
        fillColor: colorForPoint(point),
        fillOpacity: 0.92,
        weight: 3,
      })
        .addTo(layer)
        .bindPopup(buildPopupHtml(point), { maxWidth: 220 });
    });
  }, [points]);

  return (
    <main role="main" className="panel community-map-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> {t.back}</button>
      <div className="brand-mark small"><Map size={28} /></div>
      <h1>{t.title}</h1>
      <p className="intro">{t.intro}</p>
      <AudioHelp scriptId="carte-patrimoine" />

      <div className="community-map-shell leaflet-map-shell" aria-label={t.leafletLabel}>
        <div style={{ position: 'relative' }}>
          <div ref={mapElementRef} className="leaflet-map" />
          <button
            onClick={() => setIsSatellite((v) => !v)}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 1000,
              background: 'white',
              border: '2px solid #bbb',
              borderRadius: 6,
              padding: '5px 12px',
              fontSize: '0.82em',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 5px rgba(0,0,0,0.25)',
              lineHeight: 1.3,
            }}
          >
            {isSatellite ? t.standard : t.satellite}
          </button>
        </div>
      </div>

      <div className="community-map-list">
        {points.length === 0 ? <p className="empty-state">{t.empty}</p> : null}
        {points.map((point) => (
          <article className={`community-map-card ${point.status}`} key={point.id}>
            <div className="community-map-topline"><span>{t.categories[point.category]}</span><strong>{t.statuses[point.status]}</strong></div>
            <h2><MapPin size={18} /> {point.title}</h2>
            <p>{point.description}</p>
            <CardListenButton text={`${point.title}. ${point.description}`} lang={lang} />
          </article>
        ))}
      </div>

      <p className="privacy-note"><CheckCircle2 size={18} /> {t.note}</p>
    </main>
  );
}
