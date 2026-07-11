// ─── Core Toilet Type ────────────────────────────────────────────────────────

export interface ToiletRatings {
  overall: number;
  cleanliness: number;
  water: number;
  paper: number;
  smell: number;
  lighting: number;
  privacy: number;
  maintenance: number;
  mirror: number;
}

export interface AccessibilityInfo {
  wheelchairEntrance: boolean;
  grabBars: boolean;
  accessibleSink: boolean;
  wideDoor: boolean;
  accessibleParking: boolean;
}

export interface SafetyInfo {
  wellLit: boolean;
  safeAtNight: boolean;
  security: boolean;
  cctv: boolean;
}

// ─── NEW: Women's Safety ──────────────────────────────────────────────────────
export interface WomensSafety {
  score: number;           // 0–10
  lighting: 'excellent' | 'good' | 'poor' | 'unknown';
  doorLockQuality: 'excellent' | 'good' | 'poor' | 'none' | 'unknown';
  separateWomensArea: boolean;
  visibility: 'high' | 'medium' | 'low' | 'unknown';
  nearbyCrowdLevel: 'busy' | 'moderate' | 'quiet' | 'unknown';
  securityPresence: boolean;
  emergencyContactAvailable: boolean;
}

// ─── NEW: Live Availability ───────────────────────────────────────────────────
export interface AvailabilityReport {
  id: string;
  userId: string;
  status: 'available' | 'busy';
  timestamp: number;
}

export type LiveAvailability = 'available' | 'busy' | 'unknown';

// ─── NEW: Business Info ───────────────────────────────────────────────────────
export interface BusinessInfo {
  claimed: boolean;
  businessName?: string;
  claimedAt?: string;
  verified?: boolean;
  contactEmail?: string;
  website?: string;
}

// ─── NEW: Utility Category ────────────────────────────────────────────────────
export type UtilityCategory =
  | 'toilet'
  | 'drinking_water'
  | 'ev_charging'
  | 'parking'
  | 'accessible_facility'
  | 'atm'
  | 'first_aid'
  | 'police';

export interface UtilityCategoryMeta {
  id: UtilityCategory;
  label: string;
  icon: string;
  active: boolean;
  comingSoon: boolean;
}

// ─── Community Photo ──────────────────────────────────────────────────────────
export interface CommunityPhoto {
  id: string;
  url: string;
  caption?: string;
  uploadedBy: string;
  uploaderName: string;
  uploadedAt: number;
  likes: number;
  likedByCurrentUser?: boolean;
  reported?: boolean;
  category?: 'entrance' | 'inside' | 'washbasin' | 'accessibility' | 'other';
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userBadge?: ContributorBadgeType;
  text: string;
  rating: number;
  timestamp: number;
  helpful: number;
  flagged: boolean;
}

export interface Report {
  id: string;
  userId: string;
  type: ReportType;
  description?: string;
  timestamp: number;
}

export type ReportType =
  | 'closed'
  | 'permanently_removed'
  | 'dirty'
  | 'no_water'
  | 'no_electricity'
  | 'locked'
  | 'wrong_location'
  | 'unsafe'
  | 'duplicate';

export type ToiletGender = 'male' | 'female' | 'unisex' | 'family';
export type ToiletStatus = 'open' | 'probably_open' | 'closed' | 'unknown';
export type TrustLabel = 'highly_reliable' | 'moderately_reliable' | 'unverified';

// ─── NEW: Quality Badge ───────────────────────────────────────────────────────
export type QualityBadgeType = 'excellent' | 'good' | 'average' | 'needs_cleaning' | 'avoid';

export interface QualityBadge {
  type: QualityBadgeType;
  label: string;
  icon: string;
  color: string;
}

export interface Toilet {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  area: string;
  city: string;

  source: 'osm' | 'user' | 'government';
  osmId?: string;

  type: 'public' | 'private' | 'semi_public';
  free: boolean;
  entryFee?: number;
  gender: ToiletGender;

  hours: string;
  is24h: boolean;
  status: ToiletStatus;

  wheelchair: boolean;
  accessibility: AccessibilityInfo;
  babyChange: boolean;
  shower: boolean;
  water: boolean;
  westernStyle: boolean;
  indianStyle: boolean;
  stalls: number;
  urinals: number;
  lighting: boolean;
  security: boolean;

  safety: SafetyInfo;
  womensSafety?: WomensSafety;

  ratings: ToiletRatings;
  ratingCount: number;

  photos: string[];                 // legacy – plain URLs
  communityPhotos?: CommunityPhoto[]; // enhanced photos
  reviews: Review[];
  reports: Report[];
  availabilityReports?: AvailabilityReport[];

  verifiedCount: number;
  lastVerified: string;
  verifiedByCurrentUser?: boolean;

  confidenceScore: number;
  trustLabel: TrustLabel;

  // NEW
  businessInfo?: BusinessInfo;
  utilityCategory?: UtilityCategory;

  distance?: number;
  walkMinutes?: number;
}

// ─── Filter State ─────────────────────────────────────────────────────────────
export interface FilterState {
  free: boolean;
  openNow: boolean;
  wheelchair: boolean;
  babyChange: boolean;
  shower: boolean;
  clean4plus: boolean;
  is24h: boolean;
  verifiedRecently: boolean;
  femaleFriendly: boolean;
  searchQuery: string;
  maxDistance?: number;
  activeCategory: UtilityCategory;
}

// ─── Contributor Badges ───────────────────────────────────────────────────────
export type ContributorBadgeType =
  | 'first_contribution'
  | 'explorer'
  | 'cleanliness_inspector'
  | 'district_champion'
  | 'top_verifier'
  | 'trusted_verifier'
  | 'local_guide'
  | 'guardian'
  | 'expert_reviewer';

export interface ContributorBadge {
  type: ContributorBadgeType;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt?: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  points: number;
  badges: ContributorBadge[];
  toiletsAdded: number;
  toiletsVerified: number;
  reviewsWritten: number;
  reportsSubmitted: number;
  photosUploaded: number;
  reputation: 'new' | 'contributor' | 'trusted' | 'expert' | 'guardian';
}

// ─── Route Info ───────────────────────────────────────────────────────────────
export interface RouteInfo {
  distance: number;
  duration: number;
  geometry: [number, number][];
  mode: 'walking' | 'driving' | 'cycling';
}

export interface MapState {
  center: [number, number];
  zoom: number;
  userLocation?: [number, number];
}
