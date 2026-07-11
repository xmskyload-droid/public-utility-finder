import { Toilet } from '../types';
import { RouteInfo } from '../types';

const ORS_API_KEY = '5b3ce3597851110001cf6248a2b12fdc3e834b48a37a6a0b1e1b0ec8'; // public demo key

export async function getWalkingRoute(
  from: [number, number],
  to: [number, number]
): Promise<RouteInfo | null> {
  try {
    const url = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${ORS_API_KEY}&start=${from[1]},${from[0]}&end=${to[1]},${to[0]}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('ORS failed');
    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) return null;
    return {
      distance: feature.properties.summary.distance,
      duration: feature.properties.summary.duration,
      geometry: feature.geometry.coordinates as [number, number][],
      mode: 'walking',
    };
  } catch {
    return null;
  }
}

export async function getDrivingRoute(
  from: [number, number],
  to: [number, number]
): Promise<RouteInfo | null> {
  try {
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${from[1]},${from[0]}&end=${to[1]},${to[0]}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('ORS failed');
    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) return null;
    return {
      distance: feature.properties.summary.distance,
      duration: feature.properties.summary.duration,
      geometry: feature.geometry.coordinates as [number, number][],
      mode: 'driving',
    };
  } catch {
    return null;
  }
}

export function buildGoogleMapsUrl(toilet: Toilet, userLocation?: [number, number]): string {
  if (userLocation) {
    return `https://www.google.com/maps/dir/${userLocation[0]},${userLocation[1]}/${toilet.lat},${toilet.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${toilet.lat},${toilet.lng}`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  return `${hours}h ${remaining}m`;
}
