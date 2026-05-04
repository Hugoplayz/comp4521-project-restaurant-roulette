import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Restaurant } from '@/types/restaurant';
import { RADIUS_DEFAULT } from '@/hooks/use-filters';
import { useLocation } from '@/hooks/use-location';
import { fetchRestaurants } from '@/services/api';

interface FilterContextValue {
  // Location
  latitude: number | null;
  longitude: number | null;
  locationLoading: boolean;
  locationError: string | null;
  permissionDenied: boolean;

  // Restaurants (single shared fetch)
  restaurants: Restaurant[];
  restaurantsLoading: boolean;
  restaurantsError: string | null;
  refetch: () => void;

  // Cuisines derived from restaurant list
  availableCuisines: string[];

  // Filters
  radius: number;
  selectedCuisines: Set<string>;
  applyFilters: (radius: number, cuisines: Set<string>) => void;
  applyToRestaurants: (restaurants: Restaurant[]) => Restaurant[];
  activeFilterCount: number;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const {
    latitude,
    longitude,
    loading: locationLoading,
    error: locationError,
    permissionDenied,
  } = useLocation();

  const [radius, setRadius] = useState(RADIUS_DEFAULT);
  const [selectedCuisines, setSelectedCuisines] = useState<Set<string>>(new Set());

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(false);
  const [restaurantsError, setRestaurantsError] = useState<string | null>(null);

  const doFetch = useCallback(async () => {
    if (latitude === null || longitude === null) return;
    setRestaurantsLoading(true);
    setRestaurantsError(null);
    try {
      const data = await fetchRestaurants(latitude, longitude, radius);
      setRestaurants(data);
    } catch (err) {
      setRestaurantsError(err instanceof Error ? err.message : 'Failed to fetch restaurants');
      setRestaurants([]);
    } finally {
      setRestaurantsLoading(false);
    }
  }, [latitude, longitude, radius]);

  useEffect(() => {
    doFetch();
  }, [doFetch]);

  // Cuisines available in the current result set
  const availableCuisines = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach((r) => {
      if (r.cuisine) set.add(r.cuisine.toLowerCase().trim());
    });
    return Array.from(set).sort();
  }, [restaurants]);

  // When the restaurant list changes, drop any selected cuisines no longer present
  useEffect(() => {
    if (availableCuisines.length === 0) return;
    setSelectedCuisines((prev) => {
      const next = new Set([...prev].filter((c) => availableCuisines.includes(c)));
      return next.size === prev.size ? prev : next;
    });
  }, [availableCuisines]);

  const applyFilters = useCallback((newRadius: number, cuisines: Set<string>) => {
    setRadius(newRadius);
    setSelectedCuisines(new Set(cuisines));
  }, []);

  const applyToRestaurants = useCallback(
    (list: Restaurant[]) => {
      if (selectedCuisines.size === 0) return list;
      return list.filter((r) => selectedCuisines.has(r.cuisine.toLowerCase().trim()));
    },
    [selectedCuisines],
  );

  const activeFilterCount = selectedCuisines.size + (radius !== RADIUS_DEFAULT ? 1 : 0);

  const value = useMemo(
    () => ({
      latitude,
      longitude,
      locationLoading,
      locationError,
      permissionDenied,
      restaurants,
      restaurantsLoading,
      restaurantsError,
      refetch: doFetch,
      availableCuisines,
      radius,
      selectedCuisines,
      applyFilters,
      applyToRestaurants,
      activeFilterCount,
    }),
    [
      latitude, longitude, locationLoading, locationError, permissionDenied,
      restaurants, restaurantsLoading, restaurantsError, doFetch,
      availableCuisines, radius, selectedCuisines, applyFilters, applyToRestaurants, activeFilterCount,
    ],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilterContext(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilterContext must be used inside FilterProvider');
  return ctx;
}
