import { useState, useMemo } from 'react';
import { Restaurant } from '@/types/restaurant';

export const RADIUS_MIN = 500;
export const RADIUS_MAX = 5000;
export const RADIUS_STEP = 500;
export const RADIUS_DEFAULT = 1000;

interface UseFiltersReturn {
  selectedCuisines: Set<string>;
  toggleCuisine: (cuisine: string) => void;
  clearCuisines: () => void;
  availableCuisines: string[];
  filteredRestaurants: Restaurant[];
  activeCuisineCount: number;
}

export function useFilters(restaurants: Restaurant[]): UseFiltersReturn {
  const [selectedCuisines, setSelectedCuisines] = useState<Set<string>>(new Set());

  const availableCuisines = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach((r) => {
      if (r.cuisine) set.add(r.cuisine.toLowerCase().trim());
    });
    return Array.from(set).sort();
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    if (selectedCuisines.size === 0) return restaurants;
    return restaurants.filter((r) =>
      selectedCuisines.has(r.cuisine.toLowerCase().trim())
    );
  }, [restaurants, selectedCuisines]);

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines((prev) => {
      const next = new Set(prev);
      if (next.has(cuisine)) {
        next.delete(cuisine);
      } else {
        next.add(cuisine);
      }
      return next;
    });
  };

  const clearCuisines = () => setSelectedCuisines(new Set());

  return {
    selectedCuisines,
    toggleCuisine,
    clearCuisines,
    availableCuisines,
    filteredRestaurants,
    activeCuisineCount: selectedCuisines.size,
  };
}
