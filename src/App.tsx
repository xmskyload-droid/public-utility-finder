import React, { useEffect } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import { useAppStore } from './store/useAppStore';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import MapView from './components/map/MapView';
import ToiletDetailModal from './components/modals/ToiletDetailModal';
import AddToiletModal from './components/modals/AddToiletModal';
import EmergencyFAB from './components/layout/EmergencyFAB';
import LoadingOverlay from './components/ui/LoadingOverlay';

export default function App() {
  const { loadToilets, isLoadingToilets } = useAppStore();
  useGeolocation();

  useEffect(() => {
    loadToilets();
  }, []);

  return (
    <div className="app-root">
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <MapView />
      </div>
      <EmergencyFAB />
      <ToiletDetailModal />
      <AddToiletModal />
      {isLoadingToilets && <LoadingOverlay />}
    </div>
  );
}
