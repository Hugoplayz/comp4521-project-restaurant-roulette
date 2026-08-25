import { useState, useEffect, useCallback } from 'react';
import { fetchRestaurants } from '@/services/api';
import { Restaurant } from '@/types/restaurant';

interface RestaurantsState {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook that fetches nearby restaurants from the backend API.
 * Only fetches when lat/lon are provided (not null).
 */
export function useRestaurants(
  lat: number | null,
  lon: number | null,
  radius: number = 1000
) {
  const [state, setState] = useState<RestaurantsState>({
    restaurants: [],
    loading: false,
    error: null,
  });

  const fetch = useCallback(async () => {
    if (lat === null || lon === null) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const restaurants = await fetchRestaurants(lat, lon, radius);
      setState({ restaurants, loading: false, error: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch restaurants';
      setState({ restaurants: [], loading: false, error: message });
    }
  }, [lat, lon, radius]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    ...state,
    refetch: fetch,
  };
}
