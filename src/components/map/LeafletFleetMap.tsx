import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Vehicle, Hub } from '../../types';

interface LeafletFleetMapProps {
  vehicles: Vehicle[];
  hubs: Hub[];
  selectedVehicleId?: string;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  onSelectHub?: (hub: Hub) => void;
  showGeofences?: boolean;
  activeRoutePolyline?: [number, number][];
  className?: string;
  zoom?: number;
  center?: [number, number];
  interactive?: boolean;
}

export const LeafletFleetMap: React.FC<LeafletFleetMapProps> = ({
  vehicles,
  hubs,
  selectedVehicleId,
  onSelectVehicle,
  onSelectHub,
  showGeofences = true,
  activeRoutePolyline,
  className = 'h-full w-full',
  zoom = 5,
  center = [37.5, -92.5],
  interactive = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const geofenceLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      attributionControl: false
    });

    // Dark sleek high-contrast carto tile layer
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 19,
        subdomains: 'abcd'
      }
    ).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    geofenceLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Route Polyline
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (routeLayerRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (activeRoutePolyline && activeRoutePolyline.length > 1) {
      const polyline = L.polyline(activeRoutePolyline, {
        color: '#2563EB',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
        lineCap: 'round'
      }).addTo(mapInstanceRef.current);

      routeLayerRef.current = polyline;
    }
  }, [activeRoutePolyline]);

  // Update Markers & Geofences
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current || !geofenceLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    geofenceLayerRef.current.clearLayers();

    // 1. Render Hubs
    hubs.forEach((hub) => {
      const hubIcon = L.divIcon({
        className: 'custom-hub-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 rounded-xl bg-slate-900 border-2 border-amber-500 text-amber-400 flex items-center justify-center shadow-lg shadow-black/40">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/>
                <path d="M6 18h12"/>
                <path d="M6 14h12"/>
              </svg>
            </div>
            <div class="absolute -bottom-5 whitespace-nowrap px-1.5 py-0.5 rounded bg-slate-900/90 text-[10px] font-bold text-slate-200 border border-slate-700 shadow pointer-events-none">
              ${hub.name.split(' ')[0]}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const hubMarker = L.marker([hub.location.lat, hub.location.lng], { icon: hubIcon });
      hubMarker.on('click', () => {
        onSelectHub?.(hub);
      });
      markersLayerRef.current?.addLayer(hubMarker);

      // Render Geofence radius circle if enabled
      if (showGeofences) {
        const circle = L.circle([hub.location.lat, hub.location.lng], {
          radius: hub.geofenceRadiusMeters,
          color: '#F59E0B',
          weight: 1.5,
          opacity: 0.5,
          fillColor: '#F59E0B',
          fillOpacity: 0.07,
          dashArray: '4, 4'
        });
        geofenceLayerRef.current?.addLayer(circle);
      }
    });

    // 2. Render Vehicles
    vehicles.forEach((vehicle) => {
      const isSelected = selectedVehicleId === vehicle.id;
      let statusColor = '#10B981'; // green for moving
      let pulseRing = '';

      if (vehicle.status === 'moving') {
        statusColor = '#10B981'; // green
        pulseRing = '<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>';
      } else if (vehicle.status === 'idle') {
        statusColor = '#F59E0B'; // amber
      } else if (vehicle.status === 'delayed') {
        statusColor = '#EF4444'; // red
        pulseRing = '<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60"></span>';
      } else {
        statusColor = '#64748B'; // gray offline
      }

      const vehicleIcon = L.divIcon({
        className: 'custom-vehicle-marker',
        html: `
          <div class="relative cursor-pointer flex flex-col items-center group">
            <div class="relative flex items-center justify-center">
              ${pulseRing}
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-xl transition-transform ${isSelected ? 'scale-125 ring-4 ring-blue-500' : 'hover:scale-110'}"
                style="background-color: ${statusColor}; border: 2px solid white;"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  style="transform: rotate(${vehicle.currentLocation.heading || 0}deg)"
                >
                  <polygon points="12 2 19 21 12 17 5 21 12 2"/>
                </svg>
              </div>
            </div>

            <!-- Vehicle Label & Fuel badge -->
            <div class="mt-1 px-1.5 py-0.5 rounded-md bg-slate-900/90 text-white text-[10px] font-bold border border-slate-700 shadow-md flex items-center gap-1 whitespace-nowrap pointer-events-none">
              <span>${vehicle.id}</span>
              <span class="${vehicle.fuelLevel < 15 ? 'text-rose-400 font-extrabold' : 'text-slate-300'} font-mono">${vehicle.fuelLevel}%</span>
            </div>
          </div>
        `,
        iconSize: [40, 48],
        iconAnchor: [20, 24]
      });

      const marker = L.marker([vehicle.currentLocation.lat, vehicle.currentLocation.lng], {
        icon: vehicleIcon,
        zIndexOffset: isSelected ? 1000 : 100
      });

      marker.on('click', () => {
        onSelectVehicle?.(vehicle);
      });

      markersLayerRef.current?.addLayer(marker);
    });

  }, [vehicles, hubs, selectedVehicleId, showGeofences]);

  return <div ref={mapContainerRef} className={`z-0 relative rounded-xl overflow-hidden ${className}`} />;
};
