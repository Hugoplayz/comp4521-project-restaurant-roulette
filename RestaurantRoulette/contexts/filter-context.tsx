import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Restaurant } from '@/types/restaurant';
import { RADIUS_DEFAULT } from '@/hooks/use-filters';

interface FilterContextValue {
  radius: number;
  selectedCuisines: Set<string>;
  /** Called when the filter sheet commits new values */
  applyFilters: (radius: number, cuisines: Set<string>) => void;
  /** Derived: filter a restaurant list by the selected cuisines */
  applyToRestaurants: (restaurants: Restaurant[]) => Restaurant[];
  /** Active filter count badge value */
  activeFilterCount: number;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [radius, setRadius] = useState(RADIUS_DEFAULT);
  const [selectedCuisines, setSelectedCuisines] = useState<Set<string>>(new Set());

  const applyFilters = useCallback((newRadius: number, cuisines: Set<string>) => {
    setRadius(newRadius);
    setSelectedCuisines(new Set(cuisines));
  }, []);

  const applyToRestaurants = useCallback(
    (restaurants: Restaurant[]) => {
      if (selectedCuisines.size === 0) return restaurants;
      return restaurants.filter((r) =>
        selectedCuisines.has(r.cuisine.toLowerCase().trim())
      );
    },
    [selectedCuisines]
  );

  const activeFilterCount =
    selectedCuisines.size + (radius !== RADIUS_DEFAULT ? 1 : 0);

  const value = useMemo(
    () => ({ radius, selectedCuisines, applyFilters, applyToRestaurants, activeFilterCount }),
    [radius, selectedCuisines, applyFilters, applyToRestaurants, activeFilterCount]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilterContext(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilterContext must be used inside FilterProvider');
  return ctx;
}
