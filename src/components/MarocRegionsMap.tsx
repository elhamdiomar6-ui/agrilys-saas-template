import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import moroccoRegions from '../data/moroccoRegions.json';

type MarocRegionsMapProps = {
  height?: string;
};

export default function MarocRegionsMap({ height = '400px' }: MarocRegionsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map centered on Morocco
    const map = L.map(mapContainerRef.current, {
      center: [31.7917, -7.0926],
      zoom: 5,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
      keyboard: false,
      zoomControl: false,
      attributionControl: true,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Style for regions (GeoJSON layer)
    const geoJsonLayer = L.geoJSON(moroccoRegions as any, {
      style: (feature) => {
        const regionName = feature?.properties?.name || '';
        const isGuelmimOuedNoun = regionName === 'Guelmim-Oued Noun';

        return {
          fillColor: isGuelmimOuedNoun ? '#006233' : '#E8E8E8',
          color: '#333',
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.8,
        };
      },
      onEachFeature: (feature, layer) => {
        const regionName = feature.properties?.name || '';
        layer.bindPopup(regionName, { closeButton: true });
      },
    }).addTo(map);

    // Add marker for Sidi Ifni (Province) - Red
    const sidiIfniMarker = L.circleMarker([29.38, -10.17], {
      radius: 8,
      fillColor: '#FF0000',
      color: '#8B0000',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9,
    })
      .addTo(map)
      .bindPopup(
        `<div style="font-size: 12px; text-align: center;">
          <strong>Province Sidi Ifni</strong><br/>
          <small>29.38°N, 10.17°W</small>
        </div>`,
        { closeButton: true }
      );

    // Add marker for Douar Agadir N'Tguida - Gold
    const agadirMarker = L.circleMarker([29.347893, -9.291229], {
      radius: 10,
      fillColor: '#FFD700',
      color: '#B8860B',
      weight: 2.5,
      opacity: 1,
      fillOpacity: 0.95,
    })
      .addTo(map)
      .bindPopup(
        `<div style="font-size: 12px;">
          <strong style="display: block; margin-bottom: 6px;">
            🏘️ Douar Agadir N'Tguida
          </strong>
          <div style="border-top: 1px solid #ccc; padding-top: 6px;">
            <div><small><strong>Région:</strong> Guelmim-Oued Noun</small></div>
            <div><small><strong>Province:</strong> Sidi Ifni</small></div>
            <div><small><strong>Caïdat:</strong> Tighirt</small></div>
            <div><small><strong>Commune:</strong> Boutrouch</small></div>
            <div><small><strong>Latitude:</strong> 29.347893°N</small></div>
            <div><small><strong>Longitude:</strong> 9.291229°W</small></div>
          </div>
        </div>`,
        { closeButton: true, maxWidth: 280 }
      );

    // Fit bounds to Morocco
    const moroccoGeometry = L.geoJSON(moroccoRegions as any);
    if (moroccoGeometry.getBounds().isValid()) {
      map.fitBounds(moroccoGeometry.getBounds(), { padding: [50, 50] });
    }

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100%',
        height,
        borderRadius: '8px',
        border: '1px solid #ddd',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}
    />
  );
}
