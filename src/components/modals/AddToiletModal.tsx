import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Toilet } from '../../types';
import { computeTrustScore, getTrustLabel, computeToiletStatus } from '../../lib/utils';

export default function AddToiletModal() {
  const { isAddToiletOpen, setAddToiletOpen, userLocation, addToilet } = useAppStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    address: '',
    area: '',
    city: '',
    lat: userLocation?.[0]?.toFixed(6) ?? '',
    lng: userLocation?.[1]?.toFixed(6) ?? '',
    free: true,
    entryFee: 5,
    gender: 'unisex',
    hours: '06:00–22:00',
    is24h: false,
    wheelchair: false,
    babyChange: false,
    shower: false,
    water: true,
    westernStyle: true,
    indianStyle: false,
    stalls: 2,
    urinals: 2,
    lighting: true,
    security: false,
  });

  if (!isAddToiletOpen) return null;

  const set = (key: string, val: any) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = () => {
    if (!form.name || !form.lat || !form.lng) return;
    const now = new Date().toISOString().split('T')[0];
    const newToilet: Toilet = {
      id: `U${Date.now()}`,
      name: form.name,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      address: form.address,
      area: form.area,
      city: form.city,
      source: 'user',
      type: 'public',
      free: form.free,
      entryFee: form.entryFee,
      gender: form.gender as any,
      hours: form.is24h ? '24 hours' : form.hours,
      is24h: form.is24h,
      wheelchair: form.wheelchair,
      accessibility: { wheelchairEntrance: form.wheelchair, grabBars: false, accessibleSink: false, wideDoor: false, accessibleParking: false },
      babyChange: form.babyChange,
      shower: form.shower,
      water: form.water,
      westernStyle: form.westernStyle,
      indianStyle: form.indianStyle,
      stalls: form.stalls,
      urinals: form.urinals,
      lighting: form.lighting,
      security: form.security,
      safety: { wellLit: form.lighting, safeAtNight: false, security: form.security, cctv: false },
      ratings: { overall: 0, cleanliness: 0, water: 0, paper: 0, smell: 0, lighting: 0, privacy: 0, maintenance: 0, mirror: 0 },
      ratingCount: 0,
      photos: [],
      reviews: [],
      reports: [],
      verifiedCount: 1,
      lastVerified: now,
      confidenceScore: 0,
      trustLabel: 'unverified',
      status: 'unknown',
    };
    const score = computeTrustScore(newToilet);
    newToilet.confidenceScore = score;
    newToilet.trustLabel = getTrustLabel(score);
    newToilet.status = computeToiletStatus(newToilet);

    addToilet(newToilet);
    setAddToiletOpen(false);
    setStep(1);
  };

  const Toggle = ({ label, icon, value, onChange }: any) => (
    <div className="toggle-row">
      <span className="toggle-label">{icon} {label}</span>
      <div className={`toggle ${value ? 'on' : ''}`} onClick={() => onChange(!value)} />
    </div>
  );

  return (
    <div className="modal-overlay" onClick={() => setAddToiletOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-drag-handle" />

        <div className="modal-header">
          <div>
            <h2 className="modal-title">Add Toilet {step}/2</h2>
            <p className="modal-subtitle">Help the community by adding a new location</p>
          </div>
          <button className="modal-close" onClick={() => setAddToiletOpen(false)}>✕</button>
        </div>

        <div className="modal-body" style={{ padding: '20px 24px' }}>
          {step === 1 && (
            <>
              <div className="form-group">
                <label className="form-label">Toilet Name *</label>
                <input className="form-input" placeholder="e.g. MG Road Public Toilet" value={form.name} onChange={e => set('name', e.target.value)} id="add-name" />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-input" placeholder="Full street address" value={form.address} onChange={e => set('address', e.target.value)} id="add-address" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Area / Locality</label>
                  <input className="form-input" placeholder="Ernakulam" value={form.area} onChange={e => set('area', e.target.value)} id="add-area" />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" placeholder="Kochi" value={form.city} onChange={e => set('city', e.target.value)} id="add-city" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Latitude *</label>
                  <input className="form-input" type="number" step="any" placeholder="e.g. 9.9312" value={form.lat} onChange={e => set('lat', e.target.value)} id="add-lat" />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude *</label>
                  <input className="form-input" type="number" step="any" placeholder="e.g. 76.2673" value={form.lng} onChange={e => set('lng', e.target.value)} id="add-lng" />
                </div>
              </div>
              {userLocation && (
                <button className="btn btn-secondary btn-sm" onClick={() => { set('lat', userLocation[0].toFixed(6)); set('lng', userLocation[1].toFixed(6)); }} id="use-my-location">
                  📍 Use my current location
                </button>
              )}
              <div className="form-row" style={{ marginTop: 16 }}>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" value={form.gender} onChange={e => set('gender', e.target.value)} id="add-gender">
                    <option value="unisex">Unisex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="family">Family</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Toilet Type</label>
                  <select className="form-select" value={form.westernStyle ? 'western' : form.indianStyle ? 'indian' : 'both'} onChange={e => { set('westernStyle', e.target.value !== 'indian'); set('indianStyle', e.target.value !== 'western'); }}>
                    <option value="western">Western</option>
                    <option value="indian">Indian</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <Toggle label="Free entry" icon="💰" value={form.free} onChange={(v: boolean) => set('free', v)} />
              {!form.free && (
                <div className="form-group" style={{ marginTop: 8, paddingLeft: 16 }}>
                  <label className="form-label">Entry fee (₹)</label>
                  <input className="form-input" type="number" value={form.entryFee} onChange={e => set('entryFee', parseInt(e.target.value))} />
                </div>
              )}
              <Toggle label="Open 24 hours" icon="🕒" value={form.is24h} onChange={(v: boolean) => set('is24h', v)} />
              {!form.is24h && (
                <div className="form-group" style={{ marginTop: 8, paddingLeft: 16 }}>
                  <label className="form-label">Opening hours</label>
                  <input className="form-input" placeholder="06:00–22:00" value={form.hours} onChange={e => set('hours', e.target.value)} />
                </div>
              )}
              <Toggle label="Wheelchair accessible" icon="♿" value={form.wheelchair} onChange={(v: boolean) => set('wheelchair', v)} />
              <Toggle label="Baby changing station" icon="🚼" value={form.babyChange} onChange={(v: boolean) => set('babyChange', v)} />
              <Toggle label="Shower available" icon="🚿" value={form.shower} onChange={(v: boolean) => set('shower', v)} />
              <Toggle label="Water available" icon="💧" value={form.water} onChange={(v: boolean) => set('water', v)} />
              <Toggle label="Lighting" icon="💡" value={form.lighting} onChange={(v: boolean) => set('lighting', v)} />
              <Toggle label="Security/Caretaker" icon="🔒" value={form.security} onChange={(v: boolean) => set('security', v)} />
            </>
          )}
        </div>

        <div className="modal-footer">
          {step > 1 && (
            <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>← Back</button>
          )}
          {step < 2 ? (
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(s => s + 1)} disabled={!form.name || !form.lat}>
              Next →
            </button>
          ) : (
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} id="submit-toilet">
              🚻 Add Toilet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
