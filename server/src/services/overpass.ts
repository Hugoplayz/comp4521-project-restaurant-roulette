import axios from 'axios';
import { OverpassResponse, OverpassElement, Restaurant } from '../types/restaurant';

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Build an Overpass QL query to find restaurants, fast food, and cafes
 * within a given radius (meters) of a lat/lon coordinate.
 */
function buildQuery(lat: number, lon: number, radius: number): string {
  return `
    [out:json][timeout:15];
    (
      node["amenity"="restaurant"](around:${radius},${lat},${lon});
      node["amenity"="fast_food"](around:${radius},${lat},${lon});
      node["amenity"="cafe"](around:${radius},${lat},${lon});
      way["amenity"="restaurant"](around:${radius},${lat},${lon});
      way["amenity"="fast_food"](around:${radius},${lat},${lon});
      way["amenity"="cafe"](around:${radius},${lat},${lon});
    );
    out center body;
  `.trim();
}

/**
 * Format a single Overpass element into a clean Restaurant object.
 */
function formatElement(el: OverpassElement): Restaurant | null {
  const tags = el.tags || {};

  // Skip entries without a name
  if (!tags.name) return null;

  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat === undefined || lon === undefined) return null;

  // Build address from available tags
  const addressParts: string[] = [];
  if (tags['addr:housenumber']) addressParts.push(tags['addr:housenumber']);
  if (tags['addr:street']) addressParts.push(tags['addr:street']);
  if (tags['addr:city']) addressParts.push(tags['addr:city']);

  return {
    id: `${el.type}-${el.id}`,
    name: tags.name,
    lat,
    lon,
    cuisine: tags.cuisine ? tags.cuisine.split(';')[0].trim().toLowerCase() : '',
    address: addressParts.length > 0 ? addressParts.join(', ') : 'Address not available',
  };
}

/**
 * Fetch nearby restaurants from the Overpass API and return clean data.
 */
export async function fetchRestaurants(
  lat: number,
  lon: number,
  radius: number = 1000
): Promise<Restaurant[]> {
  const query = buildQuery(lat, lon, radius);

  const response = await axios.post<OverpassResponse>(
    OVERPASS_API_URL,
    `data=${encodeURIComponent(query)}`,
    {
      /** 
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      */
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'text/plain',
        'User-Agent': 'PAWS (mydomain.de)',  
        'Referer': 'http://www.mydomain.de/' 

      },
      timeout: 20000,
    }
  );

  const restaurants = response.data.elements
    .map(formatElement)
    .filter((r): r is Restaurant => r !== null);

  // Remove duplicates by name (some places have both node + way entries)
  const seen = new Set<string>();
  return restaurants.filter((r) => {
    const key = r.name.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
