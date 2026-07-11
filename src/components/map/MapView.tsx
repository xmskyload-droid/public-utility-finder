import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Toilet } from '../../types';
import { getMarkerColor } from '../../lib/utils';

// Get a locate function without triggering the auto-locate effect again
function useLocate() {
  const { setUserLocation, setMapState } = useAppStore();
  return () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        setMapState({ center: loc, zoom: 15 });
      },
      () => {},
      { timeout: 8000, maximumAge: 30000 }
    );
  };
}


function getMarkerSvg(color: string, size: number = 36): string {
  return `<svg width="${size}" height="${size + 8}" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
    <defs><filter id="sh"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.5)"/></filter></defs>
    <circle cx="18" cy="18" r="16" fill="${color}" filter="url(#sh)"/>
    <circle cx="18" cy="18" r="10" fill="rgba(255,255,255,0.18)"/>
    <text x="18" y="23" text-anchor="middle" font-size="13" fill="white">🚻</text>
    <line x1="18" y1="34" x2="18" y2="44" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}

export default function MapView() {
  const sheetHeight = useAppStore((s) => s.sheetHeight);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  const routeLayer = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const initDone = useRef(false);

  const locate = useLocate();

  useEffect(() => {
    if (initDone.current || !mapRef.current) return;
    initDone.current = true;

    let unsubscribe: (() => void) | null = null;

    (async () => {
      // Dynamic imports so Leaflet's browser globals are safe
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      LRef.current = L;

      // Try to load cluster plugin
      let ClusterGroup: any = null;
      try {
        const mod = await import('leaflet.markercluster');
        ClusterGroup = (mod as any).MarkerClusterGroup ?? (L as any).MarkerClusterGroup;
        await import('leaflet.markercluster/dist/MarkerCluster.css');
        await import('leaflet.markercluster/dist/MarkerCluster.Default.css');
      } catch {
        // fallback — no clustering
      }

      const initialState = useAppStore.getState();

      const map = L.map(mapRef.current!, {
        center: initialState.map.center,
        zoom: initialState.map.zoom,
        zoomControl: false,
      });

      // Dark-compatible OSM tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Add zoom controls to bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      leafletMap.current = map;

      // Marker layer
      if (ClusterGroup) {
        markersLayer.current = new ClusterGroup({
          maxClusterRadius: 60,
          iconCreateFunction: (cluster: any) => {
            const count = cluster.getChildCount();
            return L.divIcon({
              html: `<div style="width:42px;height:42px;background:rgba(20,184,166,0.85);border:2px solid rgba(20,184,166,0.5);border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:14px;font-family:Inter,sans-serif;box-shadow:0 0 20px rgba(20,184,166,0.4)">${count}</div>`,
              className: '',
              iconSize: [42, 42],
              iconAnchor: [21, 21],
            });
          },
        });
      } else {
        markersLayer.current = L.layerGroup();
      }
      markersLayer.current.addTo(map);

      routeLayer.current = L.layerGroup().addTo(map);

      // Click on map background → deselect
      map.on('click', () => {
        useAppStore.getState().selectToilet(null);
      });

      // Render initial state
      const s = useAppStore.getState();
      renderMarkers(L, s.filteredToilets, s.selectedToilet?.id);
      if (s.userLocation) updateUserMarker(L, s.userLocation);

      // Subscribe to store
      let prevToiletSig = '';
      let prevSelectedId = '';
      let prevUserLoc = '';
      let prevRoute = '';
      let prevMapCenter = '';

      unsubscribe = useAppStore.subscribe((state) => {
        const toiletSig = state.filteredToilets.map((t) => t.id).join(',');
        const selId = state.selectedToilet?.id ?? '';
        const userLoc = state.userLocation?.join(',') ?? '';
        const route = state.routeInfo ? JSON.stringify(state.routeInfo.geometry.slice(0, 2)) : '';
        const mapCenter = state.map.center.join(',') + ':' + state.map.zoom;

        if (toiletSig !== prevToiletSig || selId !== prevSelectedId) {
          prevToiletSig = toiletSig;
          prevSelectedId = selId;
          renderMarkers(L, state.filteredToilets, selId);
        }

        if (userLoc !== prevUserLoc) {
          prevUserLoc = userLoc;
          if (state.userLocation) updateUserMarker(L, state.userLocation);
        }

        if (route !== prevRoute) {
          prevRoute = route;
          routeLayer.current?.clearLayers();
          if (state.routeInfo) {
            // ORS returns [lng, lat]; Leaflet needs [lat, lng]
            const coords = state.routeInfo.geometry.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
            L.polyline(coords, {
              color: '#14B8A6',
              weight: 5,
              opacity: 0.9,
              dashArray: '12, 7',
              lineCap: 'round',
              lineJoin: 'round',
            }).addTo(routeLayer.current);
            if (coords.length > 1) {
              map.fitBounds(L.latLngBounds(coords), { padding: [40, 40] });
            }
          }
        }

        if (mapCenter !== prevMapCenter) {
          prevMapCenter = mapCenter;
          map.flyTo(state.map.center, state.map.zoom, { duration: 0.9 });
        }
      });
    })();

    return () => {
      unsubscribe?.();
    };
  }, []);

  function updateUserMarker(L: any, location: [number, number]) {
    const map = leafletMap.current;
    if (!map) return;
    const icon = L.divIcon({
      html: `<div style="width:18px;height:18px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 5px rgba(59,130,246,0.25),0 2px 8px rgba(0,0,0,0.4);animation:pulse-user 2s ease-in-out infinite"></div>`,
      className: '',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker(location, { icon, zIndexOffset: 1000 }).addTo(map);
    } else {
      userMarkerRef.current.setLatLng(location).setIcon(icon);
    }
  }

  function renderMarkers(L: any, toilets: Toilet[], selectedId?: string) {
    const layer = markersLayer.current;
    if (!L || !layer) return;
    layer.clearLayers();

    toilets.forEach((toilet) => {
      const color = getMarkerColor(toilet);
      const isSelected = toilet.id === selectedId;
      const sz = isSelected ? 46 : 36;

      const icon = L.divIcon({
        html: getMarkerSvg(isSelected ? '#2dd4bf' : color, sz),
        className: '',
        iconSize: [sz, sz + 8],
        iconAnchor: [sz / 2, sz + 8],
      });

      const marker = L.marker([toilet.lat, toilet.lng], { icon });

      // Hover popup
      const statusLabel = toilet.status === 'open' ? '🟢 Open'
        : toilet.status === 'probably_open' ? '🟡 Probably Open'
        : toilet.status === 'closed' ? '🔴 Closed' : '⚪ Unknown';

      marker.bindPopup(
        L.popup({ closeButton: false, offset: [0, -(sz + 4)], className: 'nearloo-popup' }).setContent(`
          <div style="padding:12px 14px;min-width:200px;font-family:Inter,sans-serif">
            <div style="font-weight:700;font-size:14px;color:#f1f5f9;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px">${toilet.name}</div>
            <div style="font-size:12px;color:#94a3b8;margin-bottom:8px">${toilet.area}, ${toilet.city}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <span style="font-size:11px;padding:3px 9px;border-radius:99px;background:rgba(245,158,11,0.15);color:#F59E0B;border:1px solid #F59E0B">★ ${toilet.ratings.overall.toFixed(1)}</span>
              <span style="font-size:11px;padding:3px 9px;border-radius:99px;background:${toilet.free ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.1)'};color:${toilet.free ? '#10B981' : '#F59E0B'};border:1px solid ${toilet.free ? '#10B981' : '#F59E0B'}">${toilet.free ? '✓ Free' : '₹' + toilet.entryFee}</span>
              <span style="font-size:11px;padding:3px 9px;border-radius:99px;background:rgba(20,184,166,0.1);color:#14B8A6;border:1px solid rgba(20,184,166,0.4)">${statusLabel}</span>
            </div>
          </div>
        `)
      );

      marker.on('mouseover', () => marker.openPopup());
      marker.on('mouseout', () => marker.closePopup());
      marker.on('click', (e: any) => {
        e.originalEvent?.stopPropagation();
        useAppStore.getState().selectToilet(toilet);
      });

      layer.addLayer(marker);
    });
  }

  return (
    <div className="map-container" style={{ '--sheet-height': `${sheetHeight}vh` } as React.CSSProperties}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Locate me button */}
      <div className="map-controls">
        <button
          className="locate-btn"
          onClick={locate}
          title="Center on my location"
          id="locate-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
            <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" strokeOpacity="0.4"/>
          </svg>
        </button>
      </div>

      {/* Add toilet FAB on map */}
      <button
        className="map-ctrl-btn"
        style={{ position: 'absolute', left: 16, top: 16, zIndex: 400, width: 44, height: 44, borderRadius: '50%', background: 'var(--color-teal)', color: 'white', border: 'none', fontSize: 20, cursor: 'pointer', boxShadow: 'var(--shadow-teal)' }}
        onClick={() => useAppStore.getState().setAddToiletOpen(true)}
        title="Add new toilet"
        id="add-toilet-map-btn"
      >
        +
      </button>
    </div>
  );
}
