// ─── i18n Helper ────────────────────────────────────────────────────────────
// All UI strings go through t() so Malayalam/Hindi can be added later.
// Currently returns the English key as-is.

type TranslationKey = string;

const translations: Record<string, string> = {
  // App
  'app.name': 'NearLoo',
  'app.tagline': 'Find clean toilets near you',

  // Navbar
  'nav.search_placeholder': 'Search by name or area...',
  'nav.filters': 'Filters',
  'nav.profile': 'Profile',

  // Emergency
  'emergency.button': 'Find Nearest Toilet',
  'emergency.finding': 'Finding nearest...',

  // Status
  'status.open': '🟢 Open',
  'status.probably_open': '🟡 Probably Open',
  'status.closed': '🔴 Closed',
  'status.unknown': '⚪ Unknown',

  // Trust
  'trust.highly_reliable': 'Highly Reliable',
  'trust.moderately_reliable': 'Moderately Reliable',
  'trust.unverified': 'Unverified',

  // Filters
  'filter.free': 'Free',
  'filter.open_now': 'Open Now',
  'filter.wheelchair': 'Wheelchair',
  'filter.baby_change': 'Baby Change',
  'filter.shower': 'Shower',
  'filter.clean': 'Clean 4★+',
  'filter.24h': '24 Hours',
  'filter.verified': 'Verified Recently',
  'filter.female': 'Female Friendly',

  // Toilet detail
  'detail.info': 'Info',
  'detail.ratings': 'Ratings',
  'detail.photos': 'Photos',
  'detail.reviews': 'Reviews',
  'detail.navigate': 'Navigate',
  'detail.verify': 'Verify',
  'detail.report': 'Report',
  'detail.add_review': 'Add Review',
  'detail.open_in_maps': 'Open in Google Maps',
  'detail.walking_route': 'Walking Route',
  'detail.driving_route': 'Driving Route',
  'detail.distance': 'Distance',
  'detail.walk_time': 'Walking time',
  'detail.entry_fee': 'Entry Fee',
  'detail.free': 'Free',
  'detail.hours': 'Hours',
  'detail.stalls': 'Stalls',
  'detail.urinals': 'Urinals',
  'detail.type': 'Type',
  'detail.western': 'Western',
  'detail.indian': 'Indian',
  'detail.both': 'Both',

  // Amenities
  'amenity.wheelchair': 'Wheelchair',
  'amenity.baby_change': 'Baby Change',
  'amenity.shower': 'Shower',
  'amenity.water': 'Water',
  'amenity.lighting': 'Lighting',
  'amenity.security': 'Security',

  // Rating axes
  'rating.overall': 'Overall',
  'rating.cleanliness': 'Cleanliness',
  'rating.water': 'Water',
  'rating.paper': 'Toilet Paper',
  'rating.smell': 'Smell',
  'rating.lighting': 'Lighting',
  'rating.privacy': 'Privacy',
  'rating.maintenance': 'Maintenance',
  'rating.mirror': 'Mirror',

  // Community
  'community.add_toilet': 'Add Toilet',
  'community.verify': 'Confirm this toilet is accurate',
  'community.verified_by': 'Verified by',
  'community.users': 'users',
  'community.last_verified': 'Last verified',
  'community.never': 'Never verified',

  // Reports
  'report.closed': 'Closed temporarily',
  'report.permanently_removed': 'Permanently removed',
  'report.dirty': 'Very dirty',
  'report.no_water': 'No water',
  'report.no_electricity': 'No electricity/lighting',
  'report.locked': 'Locked',
  'report.wrong_location': 'Wrong location on map',
  'report.unsafe': 'Unsafe',
  'report.duplicate': 'Duplicate entry',

  // Badges
  'badge.explorer': 'Explorer',
  'badge.contributor': 'Contributor',
  'badge.verifier': 'Verifier',
  'badge.guardian': 'Guardian',
  'badge.expert_reviewer': 'Expert Reviewer',
  'badge.local_guide': 'Local Guide',
  'badge.trusted_verifier': 'Trusted Verifier',

  // Misc
  'misc.no_results': 'No toilets found nearby',
  'misc.loading': 'Loading toilets...',
  'misc.error': 'Could not load data',
  'misc.nearby': 'Nearby',
  'misc.meters': 'm away',
  'misc.km': 'km away',
  'misc.min_walk': 'min walk',
  'misc.ratings': 'ratings',
  'misc.reviews': 'reviews',
  'misc.photos': 'photos',
};

export function t(key: TranslationKey, fallback?: string): string {
  return translations[key] ?? fallback ?? key;
}

export default t;
