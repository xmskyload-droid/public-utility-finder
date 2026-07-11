import { Toilet, Review, WomensSafety, CommunityPhoto, AvailabilityReport } from '../types';
import { computeTrustScore, getTrustLabel, computeToiletStatus } from '../lib/utils';

// ─── Kerala Mock Dataset ──────────────────────────────────────────────────────
// 50+ toilets across Kerala cities for demo/offline use
// In production these come from Overpass API, with Firebase overlay for community data

const defaultWomensSafety: WomensSafety = {
  score: 6,
  lighting: 'good',
  doorLockQuality: 'good',
  separateWomensArea: false,
  visibility: 'medium',
  nearbyCrowdLevel: 'moderate',
  securityPresence: false,
  emergencyContactAvailable: false,
};

const nowMs = Date.now();

function makeToilet(partial: Partial<Toilet> & Pick<Toilet, 'id' | 'name' | 'lat' | 'lng' | 'address' | 'area' | 'city'>): Toilet {
  const base: Toilet = {
    source: 'osm',
    type: 'public',
    free: true,
    gender: 'unisex',
    hours: '06:00–22:00',
    is24h: false,
    wheelchair: false,
    accessibility: { wheelchairEntrance: false, grabBars: false, accessibleSink: false, wideDoor: false, accessibleParking: false },
    babyChange: false,
    shower: false,
    water: true,
    westernStyle: true,
    indianStyle: false,
    stalls: 2,
    urinals: 2,
    lighting: true,
    security: false,
    safety: { wellLit: true, safeAtNight: false, security: false, cctv: false },
    womensSafety: defaultWomensSafety,
    ratings: { overall: 3.5, cleanliness: 3.5, water: 3.5, paper: 3.0, smell: 3.5, lighting: 4.0, privacy: 3.5, maintenance: 3.5, mirror: 3.0 },
    ratingCount: 0,
    photos: [],
    communityPhotos: [],
    availabilityReports: [],
    reviews: [],
    reports: [],
    verifiedCount: 0,
    lastVerified: '',
    confidenceScore: 0,
    trustLabel: 'unverified',
    status: 'unknown',
    businessInfo: { claimed: false },
    ...partial,
  };

  const score = computeTrustScore(base);
  base.confidenceScore = score;
  base.trustLabel = getTrustLabel(score);
  base.status = computeToiletStatus(base);
  return base;
}

const sampleReviews: Review[] = [
  { id: 'r1', userId: 'u1', userName: 'Arun K.', userBadge: 'expert_reviewer', text: 'Clean and well maintained. Water available always.', rating: 4.5, timestamp: nowMs - 86400000, helpful: 12, flagged: false },
  { id: 'r2', userId: 'u2', userName: 'Priya M.', userBadge: 'top_verifier', text: 'Decent toilet. Gets crowded during peak hours.', rating: 3.5, timestamp: nowMs - 172800000, helpful: 7, flagged: false },

  { id: 'r3', userId: 'u3', userName: 'Rahul S.', text: 'Wheelchair accessible and clean.', rating: 4.0, timestamp: Date.now() - 259200000, helpful: 5, flagged: false },
];

export const mockToilets: Toilet[] = [
  // ── KOCHI / ERNAKULAM ──────────────────────────────────────────────────────
  makeToilet({
    id: 'T001', name: 'MG Road Public Toilet', area: 'Ernakulam', city: 'Kochi',
    lat: 9.9667, lng: 76.2853, address: 'MG Road, Ernakulam, Kochi',
    type: 'public', free: true, gender: 'unisex', hours: '06:00–22:00',
    wheelchair: true, accessibility: { wheelchairEntrance: true, grabBars: true, accessibleSink: true, wideDoor: true, accessibleParking: false },
    babyChange: true, water: true, westernStyle: true, indianStyle: true, stalls: 6, urinals: 4,
    lighting: true, security: true, safety: { wellLit: true, safeAtNight: true, security: true, cctv: true },
    womensSafety: { score: 8, lighting: 'excellent', doorLockQuality: 'excellent', separateWomensArea: true, visibility: 'high', nearbyCrowdLevel: 'busy', securityPresence: true, emergencyContactAvailable: true },
    ratings: { overall: 4.2, cleanliness: 4.5, water: 4.0, paper: 3.8, smell: 4.1, lighting: 4.8, privacy: 4.0, maintenance: 4.2, mirror: 3.9 },
    ratingCount: 48,
    photos: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80', 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80'],
    communityPhotos: [
      { id: 'cp1', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80', uploadedBy: 'u1', uploaderName: 'Arun K.', uploadedAt: nowMs - 86400000, likes: 14, caption: 'Main entrance', category: 'entrance' },
      { id: 'cp2', url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80', uploadedBy: 'u2', uploaderName: 'Priya M.', uploadedAt: nowMs - 172800000, likes: 8, caption: 'Inside view', category: 'inside' },
      { id: 'cp3', url: 'https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=600&q=80', uploadedBy: 'u3', uploaderName: 'Rahul S.', uploadedAt: nowMs - 259200000, likes: 5, caption: 'Washbasin area', category: 'washbasin' },
    ],
    availabilityReports: [
      { id: 'av1', userId: 'u1', status: 'available', timestamp: nowMs - 5 * 60 * 1000 },
      { id: 'av2', userId: 'u2', status: 'available', timestamp: nowMs - 12 * 60 * 1000 },
    ],
    businessInfo: { claimed: true, businessName: 'Kochi Municipal Corporation', verified: true, contactEmail: 'kmc@kochi.gov.in' },
    reviews: sampleReviews, verifiedCount: 15, lastVerified: new Date(nowMs - 86400000).toISOString().split('T')[0],
  }),
  makeToilet({
    id: 'T002', name: 'Ernakulam Junction Railway Station', area: 'Ernakulam', city: 'Kochi',
    lat: 9.9840, lng: 76.2916, address: 'Ernakulam Junction (South) Railway Station, Kochi',
    type: 'public', free: false, entryFee: 5, gender: 'unisex', hours: '05:00–23:00',
    wheelchair: true, accessibility: { wheelchairEntrance: true, grabBars: true, accessibleSink: false, wideDoor: true, accessibleParking: true },
    babyChange: true, shower: true, water: true, westernStyle: true, indianStyle: true, stalls: 12, urinals: 8,
    lighting: true, security: true, safety: { wellLit: true, safeAtNight: true, security: true, cctv: true },
    womensSafety: { score: 7, lighting: 'good', doorLockQuality: 'good', separateWomensArea: true, visibility: 'high', nearbyCrowdLevel: 'busy', securityPresence: true, emergencyContactAvailable: false },
    ratings: { overall: 3.8, cleanliness: 3.5, water: 4.2, paper: 3.5, smell: 3.6, lighting: 4.5, privacy: 3.8, maintenance: 3.7, mirror: 4.0 },
    ratingCount: 92,
    photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80'],
    communityPhotos: [
      { id: 'cp4', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80', uploadedBy: 'u4', uploaderName: 'Lakshmi T.', uploadedAt: nowMs - 43200000, likes: 22, caption: 'Railway station restroom', category: 'inside' },
    ],
    availabilityReports: [
      { id: 'av3', userId: 'u3', status: 'busy', timestamp: nowMs - 8 * 60 * 1000 },
      { id: 'av4', userId: 'u4', status: 'busy', timestamp: nowMs - 15 * 60 * 1000 },
    ],
    reviews: sampleReviews, verifiedCount: 30, lastVerified: new Date(nowMs - 43200000).toISOString().split('T')[0],
  }),
  makeToilet({
    id: 'T003', name: 'Broadway Market Toilet', area: 'Ernakulam', city: 'Kochi',
    lat: 9.9827, lng: 76.2865, address: 'Broadway Market, Ernakulam, Kochi',
    type: 'public', free: true, gender: 'unisex', hours: '07:00–20:00',
    wheelchair: false, babyChange: false, water: true, westernStyle: false, indianStyle: true, stalls: 3, urinals: 3,
    womensSafety: { score: 4, lighting: 'poor', doorLockQuality: 'poor', separateWomensArea: false, visibility: 'low', nearbyCrowdLevel: 'busy', securityPresence: false, emergencyContactAvailable: false },
    ratings: { overall: 2.8, cleanliness: 2.5, water: 3.0, paper: 2.0, smell: 2.5, lighting: 3.5, privacy: 3.0, maintenance: 2.8, mirror: 2.0 },
    ratingCount: 23, photos: [], reviews: [sampleReviews[1]], verifiedCount: 4, lastVerified: new Date(nowMs - 864000000).toISOString().split('T')[0],
  }),
  makeToilet({
    id: 'T004', name: 'Lulu Mall Public Restroom', area: 'Edapally', city: 'Kochi',
    lat: 10.0268, lng: 76.3083, address: 'Lulu Mall, Edapally, Kochi',
    type: 'private', free: true, gender: 'unisex', hours: '10:00–22:00',
    wheelchair: true, accessibility: { wheelchairEntrance: true, grabBars: true, accessibleSink: true, wideDoor: true, accessibleParking: true },
    babyChange: true, shower: false, water: true, westernStyle: true, indianStyle: false, stalls: 10, urinals: 6,
    lighting: true, security: true, safety: { wellLit: true, safeAtNight: true, security: true, cctv: true },
    womensSafety: { score: 9, lighting: 'excellent', doorLockQuality: 'excellent', separateWomensArea: true, visibility: 'high', nearbyCrowdLevel: 'busy', securityPresence: true, emergencyContactAvailable: true },

    ratings: { overall: 4.6, cleanliness: 4.8, water: 4.7, paper: 4.5, smell: 4.6, lighting: 4.9, privacy: 4.4, maintenance: 4.7, mirror: 4.8 },
    ratingCount: 156, photos: ['https://placehold.co/400x300/0a1a2a/14B8A6?text=Lulu+Mall'],
    reviews: sampleReviews, verifiedCount: 45, lastVerified: new Date(Date.now() - 3600000).toISOString().split('T')[0],
  }),
  makeToilet({
    id: 'T005', name: 'Cochin International Airport T3', area: 'Nedumbassery', city: 'Kochi',
    lat: 10.1520, lng: 76.3905, address: 'CIAL T3, Nedumbassery, Ernakulam',
    type: 'public', free: true, gender: 'unisex', hours: '24 hours', is24h: true,
    wheelchair: true, accessibility: { wheelchairEntrance: true, grabBars: true, accessibleSink: true, wideDoor: true, accessibleParking: true },
    babyChange: true, shower: true, water: true, westernStyle: true, indianStyle: false, stalls: 16, urinals: 8,
    lighting: true, security: true, safety: { wellLit: true, safeAtNight: true, security: true, cctv: true },
    ratings: { overall: 4.5, cleanliness: 4.7, water: 4.6, paper: 4.4, smell: 4.5, lighting: 4.9, privacy: 4.3, maintenance: 4.6, mirror: 4.7 },
    ratingCount: 210, photos: ['https://placehold.co/400x300/0a2a1a/14B8A6?text=Airport+T3'],
    reviews: sampleReviews, verifiedCount: 55, lastVerified: new Date(Date.now() - 7200000).toISOString().split('T')[0],
  }),
  makeToilet({
    id: 'T006', name: 'Marine Drive Promenade Toilet', area: 'Ernakulam', city: 'Kochi',
    lat: 9.9664, lng: 76.2768, address: 'Marine Drive, Ernakulam, Kochi',
    type: 'public', free: true, gender: 'unisex', hours: '06:00–21:00',
    wheelchair: false, babyChange: false, water: true, westernStyle: true, indianStyle: false, stalls: 4, urinals: 4,
    ratings: { overall: 3.6, cleanliness: 3.4, water: 3.8, paper: 3.0, smell: 3.5, lighting: 4.0, privacy: 3.7, maintenance: 3.5, mirror: 3.2 },
    ratingCount: 34, verifiedCount: 8, lastVerified: new Date(Date.now() - 432000000).toISOString().split('T')[0],
  }),
  makeToilet({
    id: 'T007', name: 'Vytila Mobility Hub', area: 'Vytila', city: 'Kochi',
    lat: 9.9489, lng: 76.3138, address: 'Vytila Junction, Kochi',
    type: 'public', free: true, gender: 'unisex', hours: '05:30–23:00',
    wheelchair: true, accessibility: { wheelchairEntrance: true, grabBars: false, accessibleSink: true, wideDoor: true, accessibleParking: false },
    water: true, westernStyle: true, indianStyle: true, stalls: 5, urinals: 4,
    lighting: true, security: false, safety: { wellLit: true, safeAtNight: false, security: false, cctv: true },
    ratings: { overall: 3.9, cleanliness: 3.8, water: 4.0, paper: 3.5, smell: 3.8, lighting: 4.2, privacy: 3.9, maintenance: 3.7, mirror: 3.5 },
    ratingCount: 41, verifiedCount: 11, lastVerified: new Date(Date.now() - 259200000).toISOString().split('T')[0],
  }),

  // ── THIRUVANANTHAPURAM ─────────────────────────────────────────────────────
  makeToilet({
    id: 'T008', name: 'Central Bus Stand Toilet', area: 'Thampanoor', city: 'Thiruvananthapuram',
    lat: 8.4925, lng: 76.9514, address: 'Thampanoor, Thiruvananthapuram',
    type: 'public', free: false, entryFee: 5, gender: 'unisex', hours: '05:00–22:00',
    wheelchair: true, water: true, westernStyle: true, indianStyle: true, stalls: 8, urinals: 6,
    lighting: true, security: true, safety: { wellLit: true, safeAtNight: true, security: true, cctv: false },
    ratings: { overall: 3.5, cleanliness: 3.2, water: 3.8, paper: 3.0, smell: 3.3, lighting: 4.0, privacy: 3.6, maintenance: 3.4, mirror: 3.2 },
    ratingCount: 67, verifiedCount: 18, lastVerified: new Date(Date.now() - 172800000).toISOString().split('T')[0],
  }),
  makeToilet({
    id: 'T009', name: 'Padmanabhaswamy Temple Area', area: 'Fort', city: 'Thiruvananthapuram',
    lat: 8.4819, lng: 76.9465, address: 'East Fort, Thiruvananthapuram',
    type: 'public', free: true, gender: 'unisex', hours: '07:00–19:00',
    wheelchair: false, water: true, westernStyle: false, indianStyle: true, stalls: 4, urinals: 3,
    ratings: { overall: 3.0, cleanliness: 2.8, water: 3.2, paper: 2.5, smell: 2.9, lighting: 3.5, privacy: 3.2, maintenance: 3.0, mirror: 2.5 },
    ratingCount: 29, verifiedCount: 6, lastVerified: new Date(Date.now() - 604800000).toISOString().split('T')[0],
  }),
  makeToilet({
    id: 'T010', name: 'Trivandrum International Airport', area: 'Chackai', city: 'Thiruvananthapuram',
    lat: 8.4824, lng: 76.9200, address: 'Trivandrum International Airport',
    type: 'public', free: true, gender: 'unisex', hours: '24 hours', is24h: true,
    wheelchair: true, accessibility: { wheelchairEntrance: true, grabBars: true, accessibleSink: true, wideDoor: true, accessibleParking: true },
    babyChange: true, shower: true, water: true, westernStyle: true, indianStyle: false, stalls: 14, urinals: 8,
    lighting: true, security: true, safety: { wellLit: true, safeAtNight: true, security: true, cctv: true },
    ratings: { overall: 4.4, cleanliness: 4.6, water: 4.5, paper: 4.3, smell: 4.4, lighting: 4.8, privacy: 4.2, maintenance: 4.5, mirror: 4.6 },
    ratingCount: 178, verifiedCount: 48, lastVerified: new Date(Date.now() - 14400000).toISOString().split('T')[0],
  }),

  // ── THRISSUR ───────────────────────────────────────────────────────────────
  makeToilet({
    id: 'T011', name: 'Thrissur Town Hall Toilet', area: 'Town Hall', city: 'Thrissur',
    lat: 10.5271, lng: 76.2143, address: 'Town Hall Road, Thrissur',
    type: 'public', free: true, gender: 'unisex', hours: '06:00–21:00',
    wheelchair: false, water: true, westernStyle: true, indianStyle: false, stalls: 3, urinals: 3,
    lighting: true, security: false,
    ratings: { overall: 3.4, cleanliness: 3.2, water: 3.6, paper: 3.0, smell: 3.2, lighting: 3.8, privacy: 3.5, maintenance: 3.3, mirror: 3.0 },
    ratingCount: 22, verifiedCount: 5, lastVerified: new Date(Date.now() - 518400000).toISOString().split('T')[0],
  }),
  makeToilet({
    id: 'T012', name: 'Thrissur Railway Station', area: 'Railway Station', city: 'Thrissur',
    lat: 10.5218, lng: 76.2116, address: 'Thrissur Railway Station, Thrissur',
    type: 'public', free: false, entryFee: 5, gender: 'unisex', hours: '05:00–23:00',
    wheelchair: true, water: true, westernStyle: true, indianStyle: true, stalls: 6, urinals: 5,
    lighting: true, security: true,
    ratings: { overall: 3.7, cleanliness: 3.5, water: 3.9, paper: 3.3, smell: 3.6, lighting: 4.1, privacy: 3.8, maintenance: 3.6, mirror: 3.5 },
    ratingCount: 51, verifiedCount: 14, lastVerified: new Date(Date.now() - 345600000).toISOString().split('T')[0],
  }),
  makeToilet({
    id: 'T013', name: 'Vadakkumnathan Temple Toilet', area: 'Swaraj Round', city: 'Thrissur',
    lat: 10.5245, lng: 76.2138, address: 'Swaraj Round, Thrissur',
    type: 'public', free: true, gender: 'unisex', hours: '06:00–20:00',
    wheelchair: false, water: true, westernStyle: false, indianStyle: true, stalls: 4, urinals: 3,
    ratings: { overall: 3.2, cleanliness: 3.0, water: 3.4, paper: 2.8, smell: 3.0, lighting: 3.5, privacy: 3.3, maintenance: 3.0, mirror: 2.5 },
    ratingCount: 18, verifiedCount: 3, lastVerified: new Date(Date.now() - 1209600000).toISOString().split('T')[0],
  }),

  // ── KOZHIKODE ─────────────────────────────────────────────────────────────
  makeToilet({
    id: 'T014', name: 'Calicut Beach Toilet', area: 'Beach Road', city: 'Kozhikode',
    lat: 11.2568, lng: 75.7739, address: 'Kozhikode Beach, Beach Road',
    type: 'public', free: true, gender: 'unisex', hours: '06:00–21:00',
    wheelchair: false, babyChange: false, water: true, westernStyle: true, indianStyle: true, stalls: 4, urinals: 4,
    lighting: true, security: false,
    ratings: { overall: 3.3, cleanliness: 3.0, water: 3.5, paper: 2.8, smell: 3.1, lighting: 3.7, privacy: 3.4, maintenance: 3.2, mirror: 2.8 },
    ratingCount: 38, verifiedCount: 9, lastVerified: new Date(Date.now() - 432000000).toISOString().split('T')[0],
  }),
  makeToilet({
    id: 'T015', name: 'Calicut Railway Station', area: 'Railway Station', city: 'Kozhikode',
    lat: 11.2477, lng: 75.7813, address: 'Calicut Railway Station, Kozhikode',
    type: 'public', free: false, entryFee: 5, gender: 'unisex', hours: '05:00–23:00',
    wheelchair: true, water: true, westernStyle: true, indianStyle: true, stalls: 8, urinals: 6,
    lighting: true, security: true,
    ratings: { overall: 3.9, cleanliness: 3.7, water: 4.1, paper: 3.6, smell: 3.8, lighting: 4.3, privacy: 3.9, maintenance: 3.8, mirror: 3.7 },
    ratingCount: 74, verifiedCount: 20, lastVerified: new Date(Date.now() - 259200000).toISOString().split('T')[0],
  }),
  makeToilet({
    id: 'T016', name: 'SM Street (Mittai Theruv) Toilet', area: 'SM Street', city: 'Kozhikode',
    lat: 11.2481, lng: 75.7719, address: 'Sweet Meat Street, Kozhikode',
    type: 'public', free: true, gender: 'unisex', hours: '07:00–21:00',
    wheelchair: false, water: true, westernStyle: false, indianStyle: true, stalls: 3, urinals: 2,
    ratings: { overall: 3.0, cleanliness: 2.7, water: 3.2, paper: 2.5, smell: 2.8, lighting: 3.3, privacy: 3.1, maintenance: 2.9, mirror: 2.4 },
    ratingCount: 16, verifiedCount: 3, lastVerified: new Date(Date.now() - 864000000).toISOString().split('T')[0],
  }),

  // ── PALAKKAD ──────────────────────────────────────────────────────────────
  makeToilet({
    id: 'T017', name: 'Palakkad Bus Stand Toilet', area: 'Old Bus Stand', city: 'Palakkad',
    lat: 10.7817, lng: 76.6556, address: 'KSRTC Bus Stand, Palakkad',
    type: 'public', free: false, entryFee: 3, gender: 'unisex', hours: '05:30–22:00',
    wheelchair: false, water: true, westernStyle: true, indianStyle: true, stalls: 5, urinals: 4,
    lighting: true, security: true,
    ratings: { overall: 3.4, cleanliness: 3.1, water: 3.6, paper: 3.0, smell: 3.2, lighting: 3.8, privacy: 3.5, maintenance: 3.3, mirror: 3.0 },
    ratingCount: 27, verifiedCount: 7, lastVerified: new Date(Date.now() - 604800000).toISOString().split('T')[0],
  }),
  makeToilet({
    id: 'T018', name: 'Palakkad Fort Area', area: 'Fort', city: 'Palakkad',
    lat: 10.7795, lng: 76.6540, address: 'Tipu Sultan Fort, Palakkad',
    type: 'public', free: true, gender: 'unisex', hours: '08:00–18:00',
    wheelchair: false, water: true, westernStyle: false, indianStyle: true, stalls: 2, urinals: 2,
    ratings: { overall: 2.9, cleanliness: 2.6, water: 3.1, paper: 2.3, smell: 2.7, lighting: 3.2, privacy: 3.0, maintenance: 2.8, mirror: 2.3 },
    ratingCount: 14, verifiedCount: 2, lastVerified: new Date(Date.now() - 1728000000).toISOString().split('T')[0],
  }),

  // ── KANNUR ────────────────────────────────────────────────────────────────
  makeToilet({
    id: 'T019', name: 'Kannur Lighthouse Beach Toilet', area: 'Baby Beach', city: 'Kannur',
    lat: 11.8721, lng: 75.3745, address: 'Baby Beach, Kannur',
    type: 'public', free: true, gender: 'unisex', hours: '06:00–20:00',
    wheelchair: false, water: true, westernStyle: true, indianStyle: false, stalls: 3, urinals: 3,
    ratings: { overall: 3.5, cleanliness: 3.3, water: 3.7, paper: 3.0, smell: 3.4, lighting: 3.8, privacy: 3.6, maintenance: 3.4, mirror: 3.0 },
    ratingCount: 21, verifiedCount: 5, lastVerified: new Date(Date.now() - 518400000).toISOString().split('T')[0],
  }),
  makeToilet({
    id: 'T020', name: 'Kannur Bus Stand Toilet', area: 'Bus Stand', city: 'Kannur',
    lat: 11.8679, lng: 75.3789, address: 'KSRTC Bus Stand, Kannur',
    type: 'public', free: false, entryFee: 3, gender: 'unisex', hours: '05:00–22:00',
    wheelchair: true, water: true, westernStyle: true, indianStyle: true, stalls: 5, urinals: 4,
    lighting: true, security: true,
    ratings: { overall: 3.6, cleanliness: 3.4, water: 3.8, paper: 3.2, smell: 3.5, lighting: 4.0, privacy: 3.7, maintenance: 3.5, mirror: 3.3 },
    ratingCount: 32, verifiedCount: 8, lastVerified: new Date(Date.now() - 345600000).toISOString().split('T')[0],
  }),

  // ── KOTTAYAM ──────────────────────────────────────────────────────────────
  makeToilet({
    id: 'T021', name: 'Kottayam KSRTC Bus Stand', area: 'KSRTC Stand', city: 'Kottayam',
    lat: 9.5916, lng: 76.5222, address: 'KSRTC Bus Stand, Kottayam',
    type: 'public', free: false, entryFee: 5, gender: 'unisex', hours: '05:00–22:00',
    wheelchair: false, water: true, westernStyle: true, indianStyle: true, stalls: 6, urinals: 5,
    lighting: true, security: true,
    ratings: { overall: 3.5, cleanliness: 3.3, water: 3.7, paper: 3.1, smell: 3.4, lighting: 3.9, privacy: 3.6, maintenance: 3.4, mirror: 3.2 },
    ratingCount: 35, verifiedCount: 9, lastVerified: new Date(Date.now() - 432000000).toISOString().split('T')[0],
  }),
  makeToilet({
    id: 'T022', name: 'Kumarakom Boat Jetty Toilet', area: 'Kumarakom', city: 'Kottayam',
    lat: 9.6188, lng: 76.4321, address: 'Kumarakom Boat Jetty, Kottayam',
    type: 'public', free: true, gender: 'unisex', hours: '07:00–19:00',
    wheelchair: false, water: true, westernStyle: false, indianStyle: true, stalls: 2, urinals: 2,
    ratings: { overall: 3.1, cleanliness: 2.9, water: 3.3, paper: 2.7, smell: 3.0, lighting: 3.4, privacy: 3.2, maintenance: 3.0, mirror: 2.6 },
    ratingCount: 12, verifiedCount: 3, lastVerified: new Date(Date.now() - 1209600000).toISOString().split('T')[0],
  }),

  // ── ALAPPUZHA ─────────────────────────────────────────────────────────────
  makeToilet({
    id: 'T023', name: 'Alappuzha Beach Toilet', area: 'Beach', city: 'Alappuzha',
    lat: 9.4938, lng: 76.3276, address: 'Alappuzha Beach, Alappuzha',
    type: 'public', free: true, gender: 'unisex', hours: '06:00–20:00',
    wheelchair: false, water: true, westernStyle: true, indianStyle: false, stalls: 4, urinals: 4,
    ratings: { overall: 3.3, cleanliness: 3.0, water: 3.5, paper: 2.8, smell: 3.1, lighting: 3.6, privacy: 3.4, maintenance: 3.2, mirror: 2.9 },
    ratingCount: 28, verifiedCount: 6, lastVerified: new Date(Date.now() - 604800000).toISOString().split('T')[0],
  }),
  makeToilet({
    id: 'T024', name: 'Alappuzha KSRTC Bus Stand', area: 'Bus Stand', city: 'Alappuzha',
    lat: 9.4970, lng: 76.3390, address: 'KSRTC Bus Stand, Alappuzha',
    type: 'public', free: false, entryFee: 3, gender: 'unisex', hours: '05:30–22:00',
    wheelchair: true, water: true, westernStyle: true, indianStyle: true, stalls: 5, urinals: 4,
    lighting: true, security: true,
    ratings: { overall: 3.6, cleanliness: 3.4, water: 3.8, paper: 3.2, smell: 3.5, lighting: 3.9, privacy: 3.7, maintenance: 3.5, mirror: 3.3 },
    ratingCount: 24, verifiedCount: 7, lastVerified: new Date(Date.now() - 259200000).toISOString().split('T')[0],
  }),
  makeToilet({
    id: 'T025', name: 'Alleppey Backwaters Houseboat Jetty', area: 'Finishing Point', city: 'Alappuzha',
    lat: 9.4966, lng: 76.3389, address: 'Finishing Point, Alappuzha',
    type: 'public', free: true, gender: 'unisex', hours: '06:00–22:00',
    wheelchair: false, water: true, westernStyle: true, indianStyle: false, stalls: 3, urinals: 2,
    ratings: { overall: 3.4, cleanliness: 3.2, water: 3.6, paper: 3.0, smell: 3.3, lighting: 3.7, privacy: 3.5, maintenance: 3.3, mirror: 3.0 },
    ratingCount: 19, verifiedCount: 4, lastVerified: new Date(Date.now() - 691200000).toISOString().split('T')[0],
  }),

  // ── MORE KOCHI ────────────────────────────────────────────────────────────
  makeToilet({
    id: 'T026', name: 'Fort Kochi Heritage Walk Toilet', area: 'Fort Kochi', city: 'Kochi',
    lat: 9.9658, lng: 76.2433, address: 'Princess Street, Fort Kochi',
    type: 'public', free: true, gender: 'unisex', hours: '07:00–20:00',
    wheelchair: false, water: true, westernStyle: true, indianStyle: false, stalls: 4, urinals: 3,
    ratings: { overall: 3.8, cleanliness: 3.6, water: 4.0, paper: 3.4, smell: 3.7, lighting: 4.0, privacy: 3.9, maintenance: 3.7, mirror: 3.5 },
    ratingCount: 42, verifiedCount: 12, lastVerified: new Date(Date.now() - 172800000).toISOString().split('T')[0],
  }),
  makeToilet({
    id: 'T027', name: 'Mattancherry Palace Toilet', area: 'Mattancherry', city: 'Kochi',
    lat: 9.9571, lng: 76.2605, address: 'Dutch Palace Road, Mattancherry',
    type: 'public', free: true, gender: 'unisex', hours: '09:00–17:00',
    wheelchair: false, water: true, westernStyle: false, indianStyle: true, stalls: 2, urinals: 2,
    ratings: { overall: 3.0, cleanliness: 2.8, water: 3.2, paper: 2.6, smell: 2.9, lighting: 3.3, privacy: 3.1, maintenance: 2.9, mirror: 2.5 },
    ratingCount: 16, verifiedCount: 3, lastVerified: new Date(Date.now() - 864000000).toISOString().split('T')[0],
  }),
  makeToilet({
    id: 'T028', name: 'High Court Junction Toilet', area: 'High Court', city: 'Kochi',
    lat: 9.9757, lng: 76.2851, address: 'High Court Junction, Ernakulam',
    type: 'public', free: true, gender: 'unisex', hours: '06:00–21:00',
    wheelchair: true, water: true, westernStyle: true, indianStyle: false, stalls: 4, urinals: 3,
    lighting: true, security: false,
    ratings: { overall: 3.5, cleanliness: 3.3, water: 3.7, paper: 3.1, smell: 3.4, lighting: 3.8, privacy: 3.6, maintenance: 3.4, mirror: 3.2 },
    ratingCount: 26, verifiedCount: 7, lastVerified: new Date(Date.now() - 345600000).toISOString().split('T')[0],
  }),
  makeToilet({
    id: 'T029', name: 'InfoPark IT Hub Restroom', area: 'Kakkanad', city: 'Kochi',
    lat: 10.0238, lng: 76.3421, address: 'Infopark Expressway, Kakkanad',
    type: 'semi_public', free: true, gender: 'unisex', hours: '08:00–20:00',
    wheelchair: true, accessibility: { wheelchairEntrance: true, grabBars: true, accessibleSink: true, wideDoor: true, accessibleParking: true },
    babyChange: false, water: true, westernStyle: true, indianStyle: false, stalls: 6, urinals: 4,
    lighting: true, security: true, safety: { wellLit: true, safeAtNight: true, security: true, cctv: true },
    ratings: { overall: 4.3, cleanliness: 4.5, water: 4.4, paper: 4.2, smell: 4.3, lighting: 4.7, privacy: 4.2, maintenance: 4.4, mirror: 4.5 },
    ratingCount: 89, verifiedCount: 24, lastVerified: new Date(Date.now() - 86400000).toISOString().split('T')[0],
  }),
  makeToilet({
    id: 'T030', name: 'Cherai Beach Toilet', area: 'Cherai', city: 'Kochi',
    lat: 10.1413, lng: 76.1807, address: 'Cherai Beach, Vypin',
    type: 'public', free: true, gender: 'unisex', hours: '06:00–21:00',
    wheelchair: false, water: true, westernStyle: true, indianStyle: true, stalls: 3, urinals: 3,
    ratings: { overall: 3.4, cleanliness: 3.1, water: 3.6, paper: 3.0, smell: 3.2, lighting: 3.6, privacy: 3.5, maintenance: 3.3, mirror: 2.9 },
    ratingCount: 22, verifiedCount: 5, lastVerified: new Date(Date.now() - 518400000).toISOString().split('T')[0],
  }),

  // Extra entries to hit 50+
  makeToilet({ id: 'T031', name: 'Kovalam Beach Toilet', area: 'Kovalam', city: 'Thiruvananthapuram', lat: 8.3893, lng: 76.9816, address: 'Kovalam Beach, TVM', type: 'public', free: true, gender: 'unisex', hours: '06:00–20:00', water: true, westernStyle: true, indianStyle: false, stalls: 4, urinals: 3, ratings: { overall: 3.4, cleanliness: 3.2, water: 3.6, paper: 3.0, smell: 3.3, lighting: 3.7, privacy: 3.5, maintenance: 3.3, mirror: 3.0 }, ratingCount: 31, verifiedCount: 7, lastVerified: new Date(Date.now() - 432000000).toISOString().split('T')[0] }),
  makeToilet({ id: 'T032', name: 'Varkala Cliff Beach Toilet', area: 'Varkala', city: 'Thiruvananthapuram', lat: 8.7411, lng: 76.7163, address: 'Varkala Cliff, TVM', type: 'public', free: true, gender: 'unisex', hours: '06:00–21:00', water: true, westernStyle: true, indianStyle: false, stalls: 3, urinals: 2, ratings: { overall: 3.2, cleanliness: 3.0, water: 3.4, paper: 2.8, smell: 3.1, lighting: 3.5, privacy: 3.3, maintenance: 3.1, mirror: 2.8 }, ratingCount: 24, verifiedCount: 5, lastVerified: new Date(Date.now() - 604800000).toISOString().split('T')[0] }),
  makeToilet({ id: 'T033', name: 'Munnar Town Toilet', area: 'Munnar Town', city: 'Idukki', lat: 10.0892, lng: 77.0595, address: 'Munnar Town, Idukki', type: 'public', free: true, gender: 'unisex', hours: '06:00–20:00', water: true, westernStyle: true, indianStyle: true, stalls: 4, urinals: 3, ratings: { overall: 3.1, cleanliness: 2.9, water: 3.3, paper: 2.7, smell: 3.0, lighting: 3.4, privacy: 3.2, maintenance: 3.0, mirror: 2.7 }, ratingCount: 19, verifiedCount: 4, lastVerified: new Date(Date.now() - 864000000).toISOString().split('T')[0] }),
  makeToilet({ id: 'T034', name: 'Guruvayur Temple Toilet', area: 'Guruvayur', city: 'Thrissur', lat: 10.5958, lng: 76.0413, address: 'Guruvayur Temple, Thrissur', type: 'public', free: true, gender: 'unisex', hours: '04:00–22:00', water: true, westernStyle: false, indianStyle: true, stalls: 8, urinals: 6, lighting: true, security: true, ratings: { overall: 3.6, cleanliness: 3.4, water: 3.8, paper: 3.2, smell: 3.5, lighting: 3.9, privacy: 3.7, maintenance: 3.5, mirror: 3.3 }, ratingCount: 55, verifiedCount: 14, lastVerified: new Date(Date.now() - 259200000).toISOString().split('T')[0] }),
  makeToilet({ id: 'T035', name: 'Thekkady Kumily Town Toilet', area: 'Kumily', city: 'Idukki', lat: 9.5998, lng: 77.1660, address: 'Kumily Town, Thekkady', type: 'public', free: true, gender: 'unisex', hours: '07:00–19:00', water: true, westernStyle: true, indianStyle: false, stalls: 3, urinals: 2, ratings: { overall: 3.0, cleanliness: 2.8, water: 3.2, paper: 2.6, smell: 2.9, lighting: 3.3, privacy: 3.1, maintenance: 2.9, mirror: 2.5 }, ratingCount: 14, verifiedCount: 3, lastVerified: new Date(Date.now() - 1209600000).toISOString().split('T')[0] }),
  makeToilet({ id: 'T036', name: 'Wayanad Kalpetta Bus Stand Toilet', area: 'Kalpetta', city: 'Wayanad', lat: 11.6068, lng: 76.0828, address: 'Kalpetta Bus Stand, Wayanad', type: 'public', free: false, entryFee: 3, gender: 'unisex', hours: '05:30–21:00', water: true, westernStyle: true, indianStyle: true, stalls: 4, urinals: 3, ratings: { overall: 3.3, cleanliness: 3.1, water: 3.5, paper: 2.9, smell: 3.2, lighting: 3.6, privacy: 3.4, maintenance: 3.2, mirror: 2.9 }, ratingCount: 17, verifiedCount: 4, lastVerified: new Date(Date.now() - 691200000).toISOString().split('T')[0] }),
  makeToilet({ id: 'T037', name: 'Periyar National Park Visitor Toilet', area: 'Thekkady', city: 'Idukki', lat: 9.5797, lng: 77.1615, address: 'Periyar Tiger Reserve, Thekkady', type: 'public', free: true, gender: 'unisex', hours: '06:00–18:00', water: true, westernStyle: true, indianStyle: false, stalls: 4, urinals: 3, ratings: { overall: 3.5, cleanliness: 3.3, water: 3.7, paper: 3.1, smell: 3.4, lighting: 3.8, privacy: 3.6, maintenance: 3.4, mirror: 3.1 }, ratingCount: 28, verifiedCount: 6, lastVerified: new Date(Date.now() - 518400000).toISOString().split('T')[0] }),
  makeToilet({ id: 'T038', name: 'Malampuzha Dam Toilet', area: 'Malampuzha', city: 'Palakkad', lat: 10.8382, lng: 76.6738, address: 'Malampuzha Dam, Palakkad', type: 'public', free: true, gender: 'unisex', hours: '08:00–18:00', water: true, westernStyle: false, indianStyle: true, stalls: 3, urinals: 2, ratings: { overall: 2.9, cleanliness: 2.7, water: 3.1, paper: 2.5, smell: 2.8, lighting: 3.2, privacy: 3.0, maintenance: 2.8, mirror: 2.4 }, ratingCount: 15, verifiedCount: 3, lastVerified: new Date(Date.now() - 1296000000).toISOString().split('T')[0] }),
  makeToilet({ id: 'T039', name: 'Thrissur Pooram Grounds Toilet', area: 'Thekkinkadu Maidan', city: 'Thrissur', lat: 10.5217, lng: 76.2144, address: 'Thekkinkadu Maidan, Thrissur', type: 'public', free: true, gender: 'unisex', hours: '06:00–22:00', water: true, westernStyle: true, indianStyle: true, stalls: 6, urinals: 5, ratings: { overall: 3.4, cleanliness: 3.2, water: 3.6, paper: 3.0, smell: 3.3, lighting: 3.7, privacy: 3.5, maintenance: 3.3, mirror: 3.0 }, ratingCount: 29, verifiedCount: 7, lastVerified: new Date(Date.now() - 432000000).toISOString().split('T')[0] }),
  makeToilet({ id: 'T040', name: 'Napier Museum Trivandrum Toilet', area: 'Museum', city: 'Thiruvananthapuram', lat: 8.5072, lng: 76.9563, address: 'Museum Road, TVM', type: 'public', free: true, gender: 'unisex', hours: '09:00–17:00', water: true, westernStyle: false, indianStyle: true, stalls: 2, urinals: 2, ratings: { overall: 3.1, cleanliness: 2.9, water: 3.3, paper: 2.7, smell: 3.0, lighting: 3.4, privacy: 3.2, maintenance: 3.0, mirror: 2.6 }, ratingCount: 13, verifiedCount: 2, lastVerified: new Date(Date.now() - 1728000000).toISOString().split('T')[0] }),
  makeToilet({ id: 'T041', name: 'Shanghumukham Beach Toilet', area: 'Shanghumugham', city: 'Thiruvananthapuram', lat: 8.4817, lng: 76.9236, address: 'Shanghumugham Beach, TVM', type: 'public', free: true, gender: 'unisex', hours: '06:00–20:00', water: true, westernStyle: true, indianStyle: false, stalls: 4, urinals: 3, ratings: { overall: 3.3, cleanliness: 3.0, water: 3.5, paper: 2.9, smell: 3.2, lighting: 3.6, privacy: 3.4, maintenance: 3.2, mirror: 2.9 }, ratingCount: 21, verifiedCount: 5, lastVerified: new Date(Date.now() - 604800000).toISOString().split('T')[0] }),
  makeToilet({ id: 'T042', name: 'Kasaragod Bus Stand Toilet', area: 'Bus Stand', city: 'Kasaragod', lat: 12.4996, lng: 74.9869, address: 'KSRTC Stand, Kasaragod', type: 'public', free: false, entryFee: 3, gender: 'unisex', hours: '05:30–22:00', water: true, westernStyle: true, indianStyle: true, stalls: 4, urinals: 3, lighting: true, security: true, ratings: { overall: 3.4, cleanliness: 3.2, water: 3.6, paper: 3.0, smell: 3.3, lighting: 3.7, privacy: 3.5, maintenance: 3.3, mirror: 3.0 }, ratingCount: 19, verifiedCount: 5, lastVerified: new Date(Date.now() - 432000000).toISOString().split('T')[0] }),
  makeToilet({ id: 'T043', name: 'Bekal Fort Toilet', area: 'Bekal', city: 'Kasaragod', lat: 12.3961, lng: 75.0376, address: 'Bekal Fort, Kasaragod', type: 'public', free: true, gender: 'unisex', hours: '08:00–18:00', water: true, westernStyle: false, indianStyle: true, stalls: 3, urinals: 2, ratings: { overall: 3.2, cleanliness: 3.0, water: 3.4, paper: 2.8, smell: 3.1, lighting: 3.5, privacy: 3.3, maintenance: 3.1, mirror: 2.8 }, ratingCount: 18, verifiedCount: 4, lastVerified: new Date(Date.now() - 864000000).toISOString().split('T')[0] }),
  makeToilet({ id: 'T044', name: 'Kollam Beach Toilet', area: 'Kollam Beach', city: 'Kollam', lat: 8.8788, lng: 76.6014, address: 'Kollam Beach, Kollam', type: 'public', free: true, gender: 'unisex', hours: '06:00–21:00', water: true, westernStyle: true, indianStyle: false, stalls: 4, urinals: 3, ratings: { overall: 3.3, cleanliness: 3.0, water: 3.5, paper: 2.9, smell: 3.2, lighting: 3.6, privacy: 3.4, maintenance: 3.2, mirror: 2.9 }, ratingCount: 22, verifiedCount: 5, lastVerified: new Date(Date.now() - 518400000).toISOString().split('T')[0] }),
  makeToilet({ id: 'T045', name: 'Pathanamthitta Bus Stand Toilet', area: 'Bus Stand', city: 'Pathanamthitta', lat: 9.2647, lng: 76.7873, address: 'Bus Stand, Pathanamthitta', type: 'public', free: false, entryFee: 3, gender: 'unisex', hours: '05:30–21:00', water: true, westernStyle: true, indianStyle: true, stalls: 4, urinals: 3, lighting: true, ratings: { overall: 3.3, cleanliness: 3.1, water: 3.5, paper: 2.9, smell: 3.2, lighting: 3.6, privacy: 3.4, maintenance: 3.2, mirror: 2.9 }, ratingCount: 17, verifiedCount: 4, lastVerified: new Date(Date.now() - 604800000).toISOString().split('T')[0] }),
  makeToilet({ id: 'T046', name: 'Sabarimala Pilgrim Toilet', area: 'Pamba', city: 'Pathanamthitta', lat: 9.4327, lng: 77.0780, address: 'Pamba River Side, Pathanamthitta', type: 'public', free: true, gender: 'unisex', hours: '24 hours', is24h: true, water: true, westernStyle: false, indianStyle: true, stalls: 10, urinals: 8, lighting: true, security: true, ratings: { overall: 3.0, cleanliness: 2.7, water: 3.2, paper: 2.5, smell: 2.8, lighting: 3.3, privacy: 3.1, maintenance: 2.9, mirror: 2.4 }, ratingCount: 41, verifiedCount: 10, lastVerified: new Date(Date.now() - 259200000).toISOString().split('T')[0] }),
  makeToilet({ id: 'T047', name: 'Thrissur Shakthan Thampuran Market', area: 'Shakthan Nagar', city: 'Thrissur', lat: 10.5290, lng: 76.2159, address: 'Shakthan Nagar, Thrissur', type: 'public', free: true, gender: 'unisex', hours: '06:00–21:00', water: true, westernStyle: true, indianStyle: true, stalls: 4, urinals: 3, ratings: { overall: 3.3, cleanliness: 3.1, water: 3.5, paper: 2.9, smell: 3.2, lighting: 3.6, privacy: 3.4, maintenance: 3.2, mirror: 2.9 }, ratingCount: 20, verifiedCount: 5, lastVerified: new Date(Date.now() - 432000000).toISOString().split('T')[0] }),
  makeToilet({ id: 'T048', name: 'Kozhikode KSRTC Bus Stand Toilet', area: 'New Bus Stand', city: 'Kozhikode', lat: 11.2439, lng: 75.7802, address: 'KSRTC Bus Stand, Kozhikode', type: 'public', free: false, entryFee: 3, gender: 'unisex', hours: '05:00–22:00', wheelchair: true, water: true, westernStyle: true, indianStyle: true, stalls: 7, urinals: 5, lighting: true, security: true, ratings: { overall: 3.6, cleanliness: 3.4, water: 3.8, paper: 3.2, smell: 3.5, lighting: 3.9, privacy: 3.7, maintenance: 3.5, mirror: 3.3 }, ratingCount: 39, verifiedCount: 10, lastVerified: new Date(Date.now() - 345600000).toISOString().split('T')[0] }),
  makeToilet({ id: 'T049', name: 'Nilambur Town Toilet', area: 'Town Area', city: 'Malappuram', lat: 11.2807, lng: 76.2278, address: 'Nilambur Town, Malappuram', type: 'public', free: true, gender: 'unisex', hours: '06:00–21:00', water: true, westernStyle: false, indianStyle: true, stalls: 3, urinals: 2, ratings: { overall: 3.1, cleanliness: 2.9, water: 3.3, paper: 2.7, smell: 3.0, lighting: 3.4, privacy: 3.2, maintenance: 3.0, mirror: 2.6 }, ratingCount: 12, verifiedCount: 2, lastVerified: new Date(Date.now() - 1209600000).toISOString().split('T')[0] }),
  makeToilet({ id: 'T050', name: 'Malappuram KSRTC Stand Toilet', area: 'Bus Stand', city: 'Malappuram', lat: 11.0732, lng: 76.0741, address: 'KSRTC Bus Stand, Malappuram', type: 'public', free: false, entryFee: 3, gender: 'unisex', hours: '05:30–22:00', water: true, westernStyle: true, indianStyle: true, stalls: 5, urinals: 4, lighting: true, security: true, ratings: { overall: 3.4, cleanliness: 3.2, water: 3.6, paper: 3.0, smell: 3.3, lighting: 3.7, privacy: 3.5, maintenance: 3.3, mirror: 3.0 }, ratingCount: 24, verifiedCount: 6, lastVerified: new Date(Date.now() - 518400000).toISOString().split('T')[0] }),
];

export default mockToilets;
