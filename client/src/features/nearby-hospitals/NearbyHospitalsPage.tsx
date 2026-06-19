// ═══════════════════════════════════════════════════════════════
// samaramAI — Nearby Hospitals Page with Leaflet Maps
// Real-time GPS-based hospital finder using Overpass API & OSRM
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Star, Clock, Phone, Navigation2,
  Filter, ChevronDown, ChevronUp, Stethoscope, Building2,
  BadgeCheck, AlertTriangle, Ambulance, Heart, Loader2,
} from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { useTranslation } from '@/hooks/useTranslation';

import 'leaflet/dist/leaflet.css';

// ── Configuration ──
const SEARCH_RADIUS_METERS = 5000; // 5 km default radius
const CACHE_TTL_MS = 5 * 60 * 1000; // 5-minute cache
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';
const OSRM_API_URL = 'https://router.project-osrm.org/route/v1/driving';

// ── Fix Leaflet default markers ──
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ── Custom markers ──
const hospitalIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.DivIcon({
  html: `<div style="width:20px;height:20px;background:var(--color-teal-500,#0D9488);border:3px solid white;border-radius:50%;box-shadow:0 0 12px rgba(13,148,136,0.5);"></div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// ── Hospital type ──
interface Hospital {
  id: string;
  name: string;
  type: 'government' | 'private' | 'clinic' | 'phc';
  lat: number;
  lng: number;
  distance: number; // km
  rating: number; // 1-5
  totalScore: number; // 0-100
  phone: string;
  address: string;
  openNow: boolean;
  openHours: string;
  emergencyAvailable: boolean;
  specialties: string[];
  beds: number;
  ambulanceAvailable: boolean;
  insuranceAccepted: boolean;
  reviews: number;
  scoreBreakdown: {
    infrastructure: number;
    doctorQuality: number;
    hygiene: number;
    accessibility: number;
    affordability: number;
  } | null;
}

// ── Route info ──
interface RouteInfo {
  coordinates: [number, number][];
  distanceKm: number;
  durationMinutes: number;
}

// ── Haversine distance (km) ──
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

// ── Determine hospital type from OSM tags ──
function inferHospitalType(tags: Record<string, string>): Hospital['type'] {
  const name = (tags.name || '').toLowerCase();
  const operator = (tags.operator || '').toLowerCase();
  const operatorType = (tags['operator:type'] || '').toLowerCase();
  const healthcare = (tags.healthcare || '').toLowerCase();
  const amenity = (tags.amenity || '').toLowerCase();

  if (amenity === 'clinic' || healthcare === 'clinic' || healthcare === 'doctor') return 'clinic';
  if (
    operatorType === 'government' ||
    operatorType === 'public' ||
    operator.includes('government') ||
    operator.includes('municipal') ||
    operator.includes('state') ||
    name.includes('government') ||
    name.includes('govt') ||
    name.includes('district') ||
    name.includes('general hospital') ||
    name.includes('public')
  )
    return 'government';
  if (name.includes('phc') || name.includes('primary health') || healthcare === 'centre')
    return 'phc';
  return 'private';
}

// ── Parse opening hours to determine if open now ──
function isOpenNow(openingHours: string | undefined): boolean {
  if (!openingHours) return false;
  const oh = openingHours.toLowerCase().trim();
  if (oh === '24/7' || oh.includes('24/7')) return true;
  // For complex opening_hours, assume open if the tag exists
  // A full parser would be complex and out of scope
  return true;
}

// ── Parse specialties from OSM ──
function parseSpecialties(tags: Record<string, string>): string[] {
  const specialtyTag = tags['healthcare:speciality'] || tags['health_specialty:type'] || '';
  if (specialtyTag) {
    return specialtyTag
      .split(';')
      .map((s) => s.trim().replace(/_/g, ' '))
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1));
  }

  // Infer from name
  const name = (tags.name || '').toLowerCase();
  const specialties: string[] = [];
  if (name.includes('eye') || name.includes('ophthal')) specialties.push('Ophthalmology');
  if (name.includes('dental') || name.includes('dent')) specialties.push('Dental');
  if (name.includes('ortho')) specialties.push('Orthopedics');
  if (name.includes('cardiac') || name.includes('heart') || name.includes('cardio'))
    specialties.push('Cardiology');
  if (name.includes('child') || name.includes('pediatr') || name.includes('paediatr'))
    specialties.push('Pediatrics');
  if (name.includes('maternity') || name.includes('women') || name.includes('gynec'))
    specialties.push('Gynecology');
  if (name.includes('cancer') || name.includes('oncol')) specialties.push('Oncology');
  if (specialties.length === 0) specialties.push('General Medicine');
  return specialties;
}

// ── Build address from OSM tags ──
function buildAddress(tags: Record<string, string>): string {
  const parts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:suburb'] || tags['addr:neighbourhood'],
    tags['addr:city'] || tags['addr:town'] || tags['addr:village'],
    tags['addr:postcode'],
  ].filter(Boolean);
  if (parts.length > 0) return parts.join(', ');
  return tags['addr:full'] || tags.address || '';
}

// ── In-memory cache ──
interface CacheEntry {
  hospitals: Hospital[];
  timestamp: number;
  lat: number;
  lng: number;
}

let hospitalCache: CacheEntry | null = null;
let fetchInProgress: Promise<Hospital[]> | null = null;

function getCacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

function isCacheValid(lat: number, lng: number): boolean {
  if (!hospitalCache) return false;
  const age = Date.now() - hospitalCache.timestamp;
  if (age > CACHE_TTL_MS) return false;
  // Check if location shifted significantly (>~100m)
  const dist = haversineDistance(lat, lng, hospitalCache.lat, hospitalCache.lng);
  return dist < 0.1;
}

// ── Fetch nearby hospitals from Overpass API ──
async function fetchNearbyHospitals(lat: number, lng: number): Promise<Hospital[]> {
  // Check cache first
  if (isCacheValid(lat, lng) && hospitalCache) {
    return hospitalCache.hospitals;
  }

  // Prevent duplicate concurrent requests
  if (fetchInProgress) {
    return fetchInProgress;
  }

  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="hospital"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
      way["amenity"="hospital"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
      node["amenity"="clinic"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
      way["amenity"="clinic"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
      node["healthcare"="hospital"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
      way["healthcare"="hospital"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
      node["healthcare"="clinic"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
      way["healthcare"="clinic"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
    );
    out center body;
  `;

  fetchInProgress = (async () => {
    try {
      const response = await fetch(OVERPASS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status}`);
      }

      const data = await response.json();
      const elements: any[] = data.elements || [];

      // Deduplicate by name + proximity
      const seen = new Set<string>();
      const hospitals: Hospital[] = [];

      for (const el of elements) {
        const tags = el.tags || {};
        const name = tags.name || tags['name:en'];
        if (!name) continue;

        // For ways, use the center coordinates
        const elLat = el.lat ?? el.center?.lat;
        const elLng = el.lon ?? el.center?.lon;
        if (!elLat || !elLng) continue;

        // Dedup: same name within 200m
        const dedupeKey = `${name.toLowerCase()}-${elLat.toFixed(3)}-${elLng.toFixed(3)}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);

        const distance = haversineDistance(lat, lng, elLat, elLng);
        const type = inferHospitalType(tags);
        const hasEmergency =
          tags.emergency === 'yes' ||
          tags['emergency:phone'] !== undefined ||
          (tags.name || '').toLowerCase().includes('emergency') ||
          (tags.name || '').toLowerCase().includes('trauma');
        const openHours = tags.opening_hours || '';
        const openNow = openHours ? isOpenNow(openHours) : type !== 'phc'; // assume non-PHC hospitals are open
        const address = buildAddress(tags);
        const specialties = parseSpecialties(tags);
        const phone = tags.phone || tags['contact:phone'] || tags['phone:emergency'] || '';
        const beds = tags.beds ? parseInt(tags.beds, 10) : 0;
        const ambulance = tags.ambulance === 'yes' || hasEmergency;

        hospitals.push({
          id: `osm-${el.id}`,
          name,
          type,
          lat: elLat,
          lng: elLng,
          distance,
          rating: 0, // OSM doesn't provide ratings
          totalScore: 0, // No score from OSM
          phone,
          address,
          openNow,
          openHours: openHours || (openNow ? 'Hours not listed' : 'Closed'),
          emergencyAvailable: hasEmergency,
          specialties,
          beds,
          ambulanceAvailable: ambulance,
          insuranceAccepted: false,
          reviews: 0,
          scoreBreakdown: null,
        });
      }

      // Sort by distance
      hospitals.sort((a, b) => a.distance - b.distance);

      // Update cache
      hospitalCache = { hospitals, timestamp: Date.now(), lat, lng };

      // Persist to localStorage for AI assistant
      try {
        const summary = hospitals.slice(0, 20).map((h) => ({
          name: h.name,
          type: h.type,
          distance: h.distance,
          address: h.address,
          phone: h.phone,
          emergencyAvailable: h.emergencyAvailable,
          openNow: h.openNow,
          openHours: h.openHours,
          specialties: h.specialties,
        }));
        localStorage.setItem(
          'samaramai_hospital_data',
          JSON.stringify({ hospitals: summary, userLocation: { lat, lng }, fetchedAt: Date.now() })
        );
      } catch {
        // localStorage might be full or unavailable
      }

      return hospitals;
    } finally {
      fetchInProgress = null;
    }
  })();

  return fetchInProgress;
}

// ── Fetch route from OSRM ──
async function fetchRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<RouteInfo | null> {
  try {
    const url = `${OSRM_API_URL}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) return null;

    const route = data.routes[0];
    const coordinates: [number, number][] = route.geometry.coordinates.map(
      (coord: [number, number]) => [coord[1], coord[0]] // GeoJSON is [lng, lat], Leaflet needs [lat, lng]
    );

    return {
      coordinates,
      distanceKm: parseFloat((route.distance / 1000).toFixed(1)),
      durationMinutes: Math.round(route.duration / 60),
    };
  } catch {
    return null;
  }
}

// ── Map auto-pan component ──
function FlyToLocation({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14, { duration: 1.5 });
  }, [center, map]);
  return null;
}

// ── Route polyline layer ──
function RouteLayer({ route }: { route: RouteInfo | null }) {
  if (!route || route.coordinates.length === 0) return null;
  return (
    <Polyline
      positions={route.coordinates}
      pathOptions={{
        color: 'var(--color-teal-500)',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 6',
      }}
    />
  );
}

// ── Score badge color ──
function getScoreColor(score: number): string {
  if (score >= 85) return 'var(--color-success)';
  if (score >= 70) return 'var(--color-teal-500)';
  if (score >= 50) return 'var(--color-warning)';
  return 'var(--color-emergency)';
}

function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Below Average';
}

type FilterType = 'all' | 'government' | 'private' | 'clinic' | 'phc';
type SortType = 'score' | 'distance' | 'rating';

export default function NearbyHospitalsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('distance');
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Detecting your location...');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  // Get user location and fetch hospitals
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('GPS is not available on this device. Please use a device with location services.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        setLoadingMessage('Finding nearby hospitals...');

        try {
          const results = await fetchNearbyHospitals(loc[0], loc[1]);
          setHospitals(results);
          if (results.length === 0) {
            setError(`No hospitals found within ${SEARCH_RADIUS_METERS / 1000} km of your location. Try again in a different area.`);
          }
        } catch {
          setError('Unable to fetch nearby hospitals. Please check your internet connection and try again.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        let message = 'Unable to detect your location.';
        if (err.code === err.PERMISSION_DENIED) {
          message = 'Location permission is required to find nearby hospitals. Please enable location access in your browser settings and refresh.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          message = 'GPS is not available on this device. Please ensure location services are enabled.';
        } else if (err.code === err.TIMEOUT) {
          message = 'Location detection timed out. Please check your GPS signal and try again.';
        }
        setError(message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Fetch route when a hospital is selected
  useEffect(() => {
    if (!selectedHospital || !userLocation) {
      setRouteInfo(null);
      return;
    }

    let cancelled = false;
    setRouteLoading(true);

    fetchRoute(userLocation[0], userLocation[1], selectedHospital.lat, selectedHospital.lng)
      .then((route) => {
        if (!cancelled) {
          setRouteInfo(route);
          setRouteLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRouteInfo(null);
          setRouteLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedHospital, userLocation]);

  // Filter and sort
  const filteredHospitals = useMemo(() => {
    let list = hospitals;
    if (filter !== 'all') list = list.filter((h) => h.type === filter);
    list = [...list].sort((a, b) => {
      if (sortBy === 'score') return b.totalScore - a.totalScore;
      if (sortBy === 'distance') return a.distance - b.distance;
      return b.rating - a.rating;
    });
    return list;
  }, [hospitals, filter, sortBy]);

  const handleCall = useCallback((phone: string) => {
    if (phone) window.open(`tel:${phone}`, '_self');
  }, []);

  const handleDirections = useCallback((lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  }, []);

  const handleSelectHospital = useCallback((hospital: Hospital) => {
    setSelectedHospital((prev) => (prev?.id === hospital.id ? null : hospital));
  }, []);

  // Error state
  if (error && !userLocation) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-midnight)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(185,28,28,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AlertTriangle size={28} color="var(--color-emergency)" />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', maxWidth: '400px', lineHeight: 1.6 }}>{error}</p>
        <button onClick={() => navigate(-1)} className="btn-primary" style={{ marginTop: '0.5rem' }}>
          <ArrowLeft size={16} /> {t('common.back')}
        </button>
      </div>
    );
  }

  // Loading state
  if (loading || !userLocation) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-midnight)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-teal-400)' }}
        />
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>{loadingMessage}</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-midnight)', color: 'var(--color-text-inverse)' }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ padding: '1.25rem clamp(1.5rem, 5vw, 4rem)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.9rem' }}>
          <ArrowLeft size={18} /> {t('common.back')}
        </button>
        <span className="text-label" style={{ color: 'var(--color-teal-400)', fontSize: '0.7rem' }}>{t('hospital.title')}</span>
        <button onClick={() => setShowFilters(!showFilters)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
          <Filter size={18} />
        </button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ padding: '1rem clamp(1.5rem, 5vw, 4rem)' }}>
              <div className="flex flex-wrap gap-2" style={{ marginBottom: '0.75rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', width: '100%', marginBottom: '0.25rem' }}>Type:</span>
                {([['all', 'All'], ['government', 'Government'], ['private', 'Private'], ['clinic', 'Clinic'], ['phc', 'PHC']] as const).map(([val, label]) => (
                  <button key={val} onClick={() => setFilter(val)} style={{ padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', border: 'none', background: filter === val ? 'var(--color-teal-500)' : 'rgba(255,255,255,0.08)', color: filter === val ? 'white' : 'rgba(255,255,255,0.5)', fontSize: '0.8rem', cursor: 'pointer' }}>{label}</button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', width: '100%', marginBottom: '0.25rem' }}>Sort by:</span>
                {([['score', 'Score'], ['distance', 'Distance'], ['rating', 'Rating']] as const).map(([val, label]) => (
                  <button key={val} onClick={() => setSortBy(val)} style={{ padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', border: 'none', background: sortBy === val ? 'var(--color-teal-500)' : 'rgba(255,255,255,0.08)', color: sortBy === val ? 'white' : 'rgba(255,255,255,0.5)', fontSize: '0.8rem', cursor: 'pointer' }}>{label}</button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map */}
      <div style={{ height: '45vh', position: 'relative' }}>
        <MapContainer center={userLocation} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyToLocation center={selectedHospital ? [selectedHospital.lat, selectedHospital.lng] : userLocation} />

          {/* Route polyline */}
          <RouteLayer route={routeInfo} />

          {/* User marker */}
          <Marker position={userLocation} icon={userIcon}>
            <Popup><strong>You are here</strong></Popup>
          </Marker>

          {/* Hospital markers */}
          {filteredHospitals.map((h) => (
            <Marker key={h.id} position={[h.lat, h.lng]} icon={hospitalIcon} eventHandlers={{ click: () => handleSelectHospital(h) }}>
              <Popup>
                <div style={{ minWidth: 200 }}>
                  <strong>{h.name}</strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', margin: '0.3rem 0' }}>
                    <Navigation2 size={12} /> {h.distance} km
                    {h.emergencyAvailable && (
                      <span style={{ marginLeft: '0.5rem', color: '#dc2626', fontWeight: 600, fontSize: '0.75rem' }}>🚑 Emergency</span>
                    )}
                  </div>
                  {h.address && (
                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.2rem' }}>{h.address}</div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Map overlay - hospital count */}
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 1000 }}>
          <div className="glass" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--color-text-inverse)' }}>
            <MapPin size={14} style={{ display: 'inline', marginRight: '0.3rem' }} />
            {filteredHospitals.length} hospitals found
          </div>
        </div>

        {/* Route info overlay */}
        {routeLoading && (
          <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', zIndex: 1000 }}>
            <div className="glass" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--color-text-inverse)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Loader2 size={14} />
              </motion.div>
              Calculating route...
            </div>
          </div>
        )}
        {routeInfo && !routeLoading && (
          <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', zIndex: 1000 }}>
            <div className="glass" style={{ padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--color-text-inverse)' }}>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Navigation2 size={13} color="var(--color-teal-400)" /> {routeInfo.distanceKm} km
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={13} color="var(--color-teal-400)" /> ~{routeInfo.durationMinutes} min
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty state */}
      {filteredHospitals.length === 0 && !loading && (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <MapPin size={32} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
            {error || `No hospitals found within ${SEARCH_RADIUS_METERS / 1000} km. Try changing filters.`}
          </p>
        </div>
      )}

      {/* Hospital List */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" style={{ padding: 'clamp(1rem, 3vw, 2rem) clamp(1.5rem, 5vw, 4rem)' }}>
        <div className="flex flex-col gap-3">
          {filteredHospitals.map((hospital) => (
            <HospitalCard
              key={hospital.id}
              hospital={hospital}
              isSelected={selectedHospital?.id === hospital.id}
              onSelect={() => handleSelectHospital(hospital)}
              onCall={handleCall}
              onDirections={handleDirections}
              routeInfo={selectedHospital?.id === hospital.id ? routeInfo : null}
              routeLoading={selectedHospital?.id === hospital.id ? routeLoading : false}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ── Hospital Card ──
function HospitalCard({ hospital, isSelected, onSelect, onCall, onDirections, routeInfo, routeLoading }: {
  hospital: Hospital;
  isSelected: boolean;
  onSelect: () => void;
  onCall: (phone: string) => void;
  onDirections: (lat: number, lng: number) => void;
  routeInfo: RouteInfo | null;
  routeLoading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const typeLabels = { government: 'GOVT', private: 'PRIVATE', clinic: 'CLINIC', phc: 'PHC' };
  const typeColors = { government: 'var(--color-blue-400)', private: 'var(--color-teal-400)', clinic: 'var(--color-warning)', phc: 'var(--color-success)' };
  const hasScore = hospital.totalScore > 0;
  const hasRating = hospital.rating > 0;

  return (
    <motion.div
      variants={fadeInUp}
      onClick={onSelect}
      className="glass"
      style={{
        borderRadius: 'var(--radius-xl)',
        padding: '1.25rem',
        cursor: 'pointer',
        border: isSelected ? '1.5px solid var(--color-teal-500)' : '1.5px solid rgba(255,255,255,0.06)',
        transition: 'border-color 0.3s',
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between" style={{ marginBottom: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
            <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.08)', color: typeColors[hospital.type], fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              {typeLabels[hospital.type]}
            </span>
            {hospital.emergencyAvailable && (
              <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(185,28,28,0.15)', color: 'var(--color-emergency)', fontSize: '0.65rem', fontWeight: 600 }}>
                24/7 ER
              </span>
            )}
            {hospital.openNow ? (
              <span style={{ color: 'var(--color-success)', fontSize: '0.7rem' }}>● Open</span>
            ) : (
              <span style={{ color: 'var(--color-emergency)', fontSize: '0.7rem' }}>● Closed</span>
            )}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text-inverse)', marginBottom: '0.2rem' }}>{hospital.name}</h3>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{hospital.address || 'Address not available'}</p>
        </div>

        {/* Score badge - only show if we have a score */}
        {hasScore ? (
          <div style={{ textAlign: 'center', flexShrink: 0, marginLeft: '0.75rem' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: `conic-gradient(${getScoreColor(hospital.totalScore)} ${hospital.totalScore * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--color-midnight)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: getScoreColor(hospital.totalScore) }}>{hospital.totalScore}</span>
              </div>
            </div>
            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', display: 'block', marginTop: '0.2rem' }}>{getScoreLabel(hospital.totalScore)}</span>
          </div>
        ) : (
          <div style={{ textAlign: 'center', flexShrink: 0, marginLeft: '0.75rem' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Building2 size={22} color="rgba(255,255,255,0.3)" />
            </div>
            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', display: 'block', marginTop: '0.2rem' }}>OSM Data</span>
          </div>
        )}
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-3" style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
        {hasRating && (
          <span className="flex items-center gap-1"><Star size={13} fill="#FBBF24" color="#FBBF24" /> {hospital.rating} ({hospital.reviews})</span>
        )}
        <span className="flex items-center gap-1"><Navigation2 size={13} /> {hospital.distance} km</span>
        <span className="flex items-center gap-1"><Clock size={13} /> {hospital.openHours}</span>
        {hospital.beds > 0 && (
          <span className="flex items-center gap-1"><Building2 size={13} /> {hospital.beds} beds</span>
        )}
      </div>

      {/* Route info for selected hospital */}
      {isSelected && (routeLoading || routeInfo) && (
        <div style={{ marginBottom: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.2)' }}>
          {routeLoading ? (
            <div className="flex items-center gap-2" style={{ fontSize: '0.8rem', color: 'var(--color-teal-400)' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Loader2 size={14} />
              </motion.div>
              Calculating route...
            </div>
          ) : routeInfo && (
            <div className="flex items-center gap-3" style={{ fontSize: '0.8rem', color: 'var(--color-teal-400)' }}>
              <span className="flex items-center gap-1"><Navigation2 size={13} /> Route: {routeInfo.distanceKm} km</span>
              <span className="flex items-center gap-1"><Clock size={13} /> ~{routeInfo.durationMinutes} min</span>
            </div>
          )}
        </div>
      )}

      {/* Specialties */}
      <div className="flex flex-wrap gap-1" style={{ marginBottom: '0.75rem' }}>
        {hospital.specialties.slice(0, 3).map((s) => (
          <span key={s} style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>{s}</span>
        ))}
        {hospital.specialties.length > 3 && (
          <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>+{hospital.specialties.length - 3}</span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2" style={{ marginBottom: expanded ? '0.75rem' : 0 }}>
        <button onClick={(e) => { e.stopPropagation(); onCall(hospital.phone); }} className="btn-primary" style={{ flex: 1, padding: '0.6rem', minHeight: 'auto', fontSize: '0.85rem', opacity: hospital.phone ? 1 : 0.4 }} disabled={!hospital.phone}>
          <Phone size={14} /> Call
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDirections(hospital.lat, hospital.lng); }} className="btn-secondary" style={{ flex: 1, padding: '0.6rem', minHeight: 'auto', fontSize: '0.85rem', borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
          <Navigation2 size={14} /> Directions
        </button>
        <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem 0 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Score breakdown — only if available */}
              {hospital.scoreBreakdown && (
                <>
                  <span className="text-label" style={{ color: 'var(--color-teal-400)', fontSize: '0.6rem', display: 'block', marginBottom: '0.75rem' }}>SCORE BREAKDOWN</span>
                  {Object.entries(hospital.scoreBreakdown).map(([key, value]) => (
                    <ScoreBar key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())} value={value} />
                  ))}
                </>
              )}

              {/* Hospital details */}
              <span className="text-label" style={{ color: 'var(--color-teal-400)', fontSize: '0.6rem', display: 'block', marginBottom: '0.75rem', marginTop: hospital.scoreBreakdown ? '0.75rem' : 0 }}>DETAILS</span>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
                {hospital.address && <div>📍 {hospital.address}</div>}
                {hospital.phone && <div>📞 {hospital.phone}</div>}
                <div>🕐 {hospital.openHours}</div>
                {hospital.beds > 0 && <div>🏥 {hospital.beds} beds</div>}
                {hospital.specialties.length > 0 && (
                  <div>🩺 {hospital.specialties.join(', ')}</div>
                )}
              </div>

              <div className="flex flex-wrap gap-2" style={{ marginTop: '0.75rem' }}>
                {hospital.ambulanceAvailable && <Tag icon={<Ambulance size={12} />} label="Ambulance" color="var(--color-teal-400)" />}
                {hospital.insuranceAccepted && <Tag icon={<BadgeCheck size={12} />} label="Insurance" color="var(--color-blue-400)" />}
                {hospital.emergencyAvailable && <Tag icon={<AlertTriangle size={12} />} label="Emergency" color="var(--color-emergency)" />}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
      <span style={{ width: '100px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{label}</span>
      <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8 }} style={{ height: '100%', borderRadius: '3px', background: getScoreColor(value) }} />
      </div>
      <span style={{ width: '30px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: getScoreColor(value) }}>{value}</span>
    </div>
  );
}

function Tag({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <span className="flex items-center gap-1" style={{ padding: '3px 8px', borderRadius: 'var(--radius-full)', border: `1px solid ${color}30`, color, fontSize: '0.7rem' }}>
      {icon} {label}
    </span>
  );
}
