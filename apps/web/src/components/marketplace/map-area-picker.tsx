'use client';

import { useEffect, useState } from 'react';
import { Circle, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';

type MapAreaPickerProps = {
  city: string;
  center: [number, number];
  radiusKm: number;
  onChange: (center: [number, number]) => void;
};

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, Math.max(map.getZoom(), 12), { animate: true });
  }, [center, map]);

  return null;
}

function MapClickHandler({ onChange }: { onChange: (center: [number, number]) => void }) {
  useMapEvents({
    click(event) {
      onChange([event.latlng.lat, event.latlng.lng]);
    },
  });
  return null;
}

type TileProvider = {
  id: string;
  attribution: string;
  url: string;
  subdomains?: string[];
};

const TILE_PROVIDERS: TileProvider[] = [
  {
    id: 'osm-de',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: ['a', 'b', 'c'],
    url: 'https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png',
  },
  {
    id: 'esri-street',
    attribution:
      'Tiles &copy; Esri — Source: Esri, DeLorme, NAVTEQ, USGS, and the GIS User Community',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
  },
];

function MapTiles() {
  const [providerIndex, setProviderIndex] = useState(0);
  const provider = TILE_PROVIDERS[providerIndex];

  return (
    <TileLayer
      key={provider.id}
      attribution={provider.attribution}
      {...('subdomains' in provider ? { subdomains: provider.subdomains } : {})}
      url={provider.url}
      eventHandlers={{
        tileerror: () => {
          setProviderIndex((current) => Math.min(current + 1, TILE_PROVIDERS.length - 1));
        },
      }}
    />
  );
}

export function MapAreaPicker({ city, center, radiusKm, onChange }: MapAreaPickerProps) {
  const position: LatLngExpression = center;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#dfd5cc] bg-[#eef1ed]">
      <MapContainer
        center={position}
        zoom={12}
        scrollWheelZoom
        className="h-[340px] w-full sm:h-[390px]"
        aria-label={`انتخاب محدوده در ${city}`}
      >
        <MapTiles />
        <Circle
          center={position}
          radius={radiusKm * 1000}
          pathOptions={{ color: '#8b5e50', fillColor: '#b78972', fillOpacity: 0.2, weight: 2 }}
        />
        <RecenterMap center={center} />
        <MapClickHandler onChange={onChange} />
      </MapContainer>
      <div className="pointer-events-none absolute inset-x-3 top-3 z-[1000] flex items-start justify-between gap-3">
        <span className="rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-xs font-medium text-[#4c403e] shadow-sm backdrop-blur">
          {city} · شعاع {radiusKm.toLocaleString('fa-IR')} کیلومتر
        </span>
        <span className="rounded-full bg-[#30393d]/85 px-3 py-1.5 text-xs text-white shadow-sm">
          برای جابه‌جایی، روی نقشه بزن
        </span>
      </div>
    </div>
  );
}
