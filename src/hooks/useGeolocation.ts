import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useGeolocation() {
  const { setUserLocation, setMapState } = useAppStore();

  const locate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        setMapState({ center: loc, zoom: 14 });
      },
      () => {
        // Fallback to Kochi center
        setMapState({ center: [9.9312, 76.2673], zoom: 13 });
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  useEffect(() => { locate(); }, []);

  return { locate };
}
