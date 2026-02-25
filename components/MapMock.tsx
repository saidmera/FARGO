
import React, { useEffect, useRef } from 'react';
import { Target, Truck, Container, Zap } from 'lucide-react';
import { VehicleType } from '../types';

interface MapProps {
  pickup?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  driverLocation?: { lat: number; lng: number };
  driverVehicle?: VehicleType;
  onSelectDestination?: (lat: number, lng: number, address: string) => void;
  interactive?: boolean;
  showRoute?: boolean;
}

declare const L: any;

const getVehicleIcon = (type: VehicleType = 'VAN') => {
  const color = '#F7FF00';
  const size = 32;
  if (type === 'HEAVY') return `<div class="bg-black p-2 rounded-lg border-2 border-[#F7FF00] shadow-xl"><svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5"><rect x="2" y="10" width="20" height="8" rx="2"/><path d="M7 18v2"/><path d="M17 18v2"/><path d="M2 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/></svg></div>`;
  if (type === 'TRUCK') return `<div class="bg-black p-2 rounded-lg border-2 border-[#F7FF00] shadow-xl"><svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg></div>`;
  return `<div class="bg-black p-2 rounded-lg border-2 border-[#F7FF00] shadow-xl"><svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`;
};

export const MapMock: React.FC<MapProps> = ({ 
  pickup, 
  destination, 
  driverLocation, 
  driverVehicle,
  onSelectDestination, 
  interactive = false,
  showRoute = false 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const routeLayerRef = useRef<any>(null);

  const getAddress = async (lat: number, lng: number) => {
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`);
      const data = await resp.json();
      return data.display_name.split(',').slice(0, 3).join(',');
    } catch (e) {
      return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([33.5731, -7.5898], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(mapRef.current);

    if (interactive) {
      mapRef.current.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;
        const address = await getAddress(lat, lng);
        onSelectDestination?.(lat, lng, address);
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [interactive]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Route Rendering
    if (showRoute && pickup && destination) {
      const latlngs = [
        [pickup.lat, pickup.lng],
        [destination.lat, destination.lng]
      ];
      if (routeLayerRef.current) mapRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = L.polyline(latlngs, { color: '#3b82f6', weight: 4, dashArray: '10, 10' }).addTo(mapRef.current);
      mapRef.current.fitBounds(routeLayerRef.current.getBounds().pad(0.2));
    }

    // Marker Updates
    const updateMarker = (key: string, latlng: [number, number], html: string, size: [number, number] = [20, 20]) => {
      if (markersRef.current[key]) {
        markersRef.current[key].setLatLng(latlng);
      } else {
        const icon = L.divIcon({ className: `custom-${key}-marker`, html, iconSize: size, iconAnchor: [size[0]/2, size[1]] });
        markersRef.current[key] = L.marker(latlng, { icon }).addTo(mapRef.current);
      }
    };

    if (pickup) updateMarker('pickup', [pickup.lat, pickup.lng], '<div class="user-location-pulse"></div>');
    if (destination) updateMarker('dest', [destination.lat, destination.lng], '<div class="bg-black text-[#F7FF00] p-1 rounded-full"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-9-7-9z"/></svg></div>', [32, 32]);
    if (driverLocation) updateMarker('driver', [driverLocation.lat, driverLocation.lng], getVehicleIcon(driverVehicle), [40, 40]);

  }, [pickup, destination, driverLocation, driverVehicle, showRoute]);

  return (
    <div className="relative w-full h-80 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-4 right-4 z-[1000]">
        <button onClick={() => pickup && mapRef.current.setView([pickup.lat, pickup.lng], 16)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl active:scale-95"><Target className="w-6 h-6 text-blue-600" /></button>
      </div>
    </div>
  );
};
