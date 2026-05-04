import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Circle, Marker } from 'react-native-maps';

import { useFilterContext } from '@/contexts/filter-context';
import { LoadingScreen } from '@/components/loading-screen';
import { ErrorScreen } from '@/components/error-screen';
import { FilterSheet } from '@/components/filter-sheet';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Restaurant } from '@/types/restaurant';

const DELTA = 0.01;

export default function MapScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const {
    latitude, longitude,
    locationLoading, locationError, permissionDenied,
    restaurants, restaurantsLoading, restaurantsError, refetch,
    availableCuisines,
    radius, selectedCuisines, applyFilters, applyToRestaurants, activeFilterCount,
  } = useFilterContext();

  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const displayList = useMemo(() => applyToRestaurants(restaurants), [restaurants, applyToRestaurants]);

  if (locationLoading) return <LoadingScreen message="Finding your location..." />;
  if (permissionDenied || locationError) return <ErrorScreen message={locationError || 'Location permission is required to find nearby restaurants.'} />;
  if (restaurantsLoading) return <LoadingScreen message="Searching for nearby restaurants..." />;
  if (restaurantsError) return <ErrorScreen message={`Could not load restaurants.\n${restaurantsError}`} onRetry={refetch} />;
  if (restaurants.length === 0) return <ErrorScreen message="No restaurants found nearby. Try a wider radius." onRetry={refetch} />;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: latitude!,
          longitude: longitude!,
          latitudeDelta: DELTA,
          longitudeDelta: DELTA,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        <Circle
          center={{ latitude: latitude!, longitude: longitude! }}
          radius={radius}
          strokeColor={colors.primary}
          fillColor={`${colors.primary}18`}
          strokeWidth={1.5}
        />
        {displayList.map((restaurant: Restaurant) => (
          <Marker
            key={restaurant.id}
            coordinate={{ latitude: restaurant.lat, longitude: restaurant.lon }}
            pinColor="red"
          >
            <Callout tooltip={true}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{restaurant.name}</Text>
                {!!restaurant.cuisine && (
                  <Text style={styles.calloutCuisine}>{restaurant.cuisine}</Text>
                )}
                <Text style={styles.calloutAddress}>{restaurant.address}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity
        style={[styles.filterFab, { backgroundColor: colors.background, borderColor: colors.border }]}
        onPress={() => setFilterSheetVisible(true)}
        activeOpacity={0.8}
      >
        <ThemedText style={[styles.filterIcon, { color: colors.primary }]}>⚙</ThemedText>
        {activeFilterCount > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <ThemedText style={styles.badgeText}>{activeFilterCount}</ThemedText>
          </View>
        )}
      </TouchableOpacity>

      <FilterSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        radius={radius}
        selectedCuisines={selectedCuisines}
        availableCuisines={availableCuisines}
        onApply={({ radius: r, selectedCuisines: c }) => applyFilters(r, c)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  callout: {
    minWidth: 160,
    maxWidth: 260,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  calloutTitle: { fontSize: 15, fontWeight: '700', marginBottom: 3, color: '#111' },
  calloutCuisine: { fontSize: 13, marginBottom: 2, textTransform: 'capitalize', color: '#555' },
  calloutAddress: { fontSize: 12, color: '#777' },
  filterFab: {
    position: 'absolute',
    top: 56,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  filterIcon: { fontSize: 22 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
});
