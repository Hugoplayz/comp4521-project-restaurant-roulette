import axios from 'axios';
import { RestaurantsResponse, Restaurant } from '@/types/restaurant';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000,
});

/**
 * Fetch nearby restaurants from the backend API.
 * The backend proxies to the Overpass API (OpenStreetMap).
 */
export async function fetchRestaurants(
  lat: number,
  lon: number,
  radius: number = 1000
): Promise<Restaurant[]> {
  const response = await apiClient.get<RestaurantsResponse>(
    '/api/restaurants',
    {
      params: { lat, lon, radius },
    }
  );
  return response.data.restaurants;
}
