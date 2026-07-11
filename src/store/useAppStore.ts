import { create } from 'zustand';
import { Toilet, FilterState, MapState, UserProfile, RouteInfo } from '../types';
import { haversineDistance, estimateWalkMinutes } from '../lib/utils';
import mockToilets from '../data/mockToilets';

interface AppState {
  // Map
  map: MapState;
  setMapState: (s: Partial<MapState>) => void;

  // Toilets
  toilets: Toilet[];
  filteredToilets: Toilet[];
  selectedToilet: Toilet | null;
  isLoadingToilets: boolean;

  // Filters
  filters: FilterState;
  setFilter: (key: keyof FilterState, value: boolean | string | number) => void;
  clearFilters: () => void;

  // User location
  userLocation: [number, number] | null;
  setUserLocation: (loc: [number, number]) => void;

  // Routing
  routeInfo: RouteInfo | null;
  isLoadingRoute: boolean;
  setRouteInfo: (route: RouteInfo | null) => void;

  // UI
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isDetailOpen: boolean;
  setDetailOpen: (open: boolean) => void;
  isAddToiletOpen: boolean;
  setAddToiletOpen: (open: boolean) => void;
  isEmergencyLoading: boolean;
  sheetHeight: number;
  setSheetHeight: (height: number) => void;

  // User
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;

  // Actions
  selectToilet: (toilet: Toilet | null) => void;
  loadToilets: () => void;
  applyFilters: () => void;
  findNearest: () => void;
  addToilet: (toilet: Toilet) => void;
  verifyToilet: (id: string) => void;
}

const defaultFilters: FilterState = {
  free: false,
  openNow: false,
  wheelchair: false,
  babyChange: false,
  shower: false,
  clean4plus: false,
  is24h: false,
  verifiedRecently: false,
  femaleFriendly: false,
  searchQuery: '',
  activeCategory: 'toilet',
};

export const useAppStore = create<AppState>((set, get) => ({
  map: {
    center: [10.1632, 76.6413] as [number, number], // Kerala center
    zoom: 8,
  },
  setMapState: (s) => set((state) => ({ map: { ...state.map, ...s } })),

  toilets: [],
  filteredToilets: [],
  selectedToilet: null,
  isLoadingToilets: false,

  filters: defaultFilters,
  setFilter: (key, value) => {
    set((state) => ({ filters: { ...state.filters, [key]: value } }));
    get().applyFilters();
  },
  clearFilters: () => {
    set({ filters: defaultFilters });
    get().applyFilters();
  },

  userLocation: null,
  setUserLocation: (loc) => {
    try {
      set({ userLocation: loc });
      // Recalculate distances
      const toilets = get().toilets.map((t) => {
        const dist = haversineDistance(loc[0], loc[1], t.lat, t.lng);
        return { ...t, distance: dist, walkMinutes: estimateWalkMinutes(dist) };
      });
      // Sort by distance
      toilets.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
      set({ toilets });
      get().applyFilters();
    } catch (error) {
      console.error('Error in setUserLocation:', error);
    }
  },

  routeInfo: null,
  isLoadingRoute: false,
  setRouteInfo: (route) => set({ routeInfo: route }),

  isSidebarOpen: true,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  isDetailOpen: false,
  setDetailOpen: (open) => set({ isDetailOpen: open }),
  isAddToiletOpen: false,
  setAddToiletOpen: (open) => set({ isAddToiletOpen: open }),
  isEmergencyLoading: false,
  sheetHeight: 55,
  setSheetHeight: (height) => set({ sheetHeight: height }),

  user: {
    uid: 'local-user',
    displayName: 'Local User',
    points: 0,
    badges: [],
    toiletsAdded: 0,
    toiletsVerified: 0,
    reviewsWritten: 0,
    reportsSubmitted: 0,
    photosUploaded: 0,
    reputation: 'new',
  },
  setUser: (user) => set({ user }),

  selectToilet: (toilet) => {
    set({ selectedToilet: toilet, isDetailOpen: !!toilet, routeInfo: null });
    if (toilet) {
      set({ map: { center: [toilet.lat, toilet.lng] as [number, number], zoom: 16 } });
    }
  },

  loadToilets: () => {
    try {
      set({ isLoadingToilets: true });
      const { userLocation } = get();
      let toilets = [...mockToilets];
      if (userLocation) {
        toilets = toilets.map((t) => {
          const dist = haversineDistance(userLocation[0], userLocation[1], t.lat, t.lng);
          return { ...t, distance: dist, walkMinutes: estimateWalkMinutes(dist) };
        });
        toilets.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
      }
      set({ toilets, isLoadingToilets: false });
      get().applyFilters();
    } catch (error) {
      console.error('Error in loadToilets:', error);
      set({ isLoadingToilets: false });
    }
  },

  applyFilters: () => {
    const { toilets, filters } = get();
    let result = [...toilets];

    if (filters.free) result = result.filter((t) => t.free);
    if (filters.openNow) result = result.filter((t) => t.status === 'open' || t.status === 'probably_open');
    if (filters.wheelchair) result = result.filter((t) => t.wheelchair);
    if (filters.babyChange) result = result.filter((t) => t.babyChange);
    if (filters.shower) result = result.filter((t) => t.shower);
    if (filters.clean4plus) result = result.filter((t) => t.ratings.overall >= 4);
    if (filters.is24h) result = result.filter((t) => t.is24h);
    if (filters.femaleFriendly) result = result.filter((t) => t.gender === 'female' || t.gender === 'unisex' || t.gender === 'family');
    if (filters.verifiedRecently) {
      result = result.filter((t) => {
        if (!t.lastVerified) return false;
        const days = (Date.now() - new Date(t.lastVerified).getTime()) / 86400000;
        return days <= 30;
      });
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.address.toLowerCase().includes(q) ||
          t.area.toLowerCase().includes(q) ||
          t.city.toLowerCase().includes(q)
      );
    }

    set({ filteredToilets: result });
  },

  findNearest: () => {
    const { toilets, userLocation } = get();
    if (!userLocation) return;
    const open = toilets.filter((t) => t.status === 'open' || t.status === 'probably_open');
    const nearest = open.length ? open[0] : toilets[0];
    if (nearest) get().selectToilet(nearest);
  },

  addToilet: (toilet) => {
    set((state) => ({ toilets: [toilet, ...state.toilets] }));
    get().applyFilters();
  },

  verifyToilet: (id) => {
    set((state) => {
      const updatedToilets = state.toilets.map((t) =>
        t.id === id
          ? { ...t, verifiedCount: t.verifiedCount + 1, lastVerified: new Date().toISOString().split('T')[0], confidenceScore: Math.min(100, t.confidenceScore + 5) }
          : t
      );
      const updatedSelected = state.selectedToilet?.id === id
        ? updatedToilets.find((t) => t.id === id) ?? state.selectedToilet
        : state.selectedToilet;
      return { toilets: updatedToilets, selectedToilet: updatedSelected };
    });
    get().applyFilters();
  },
}));
