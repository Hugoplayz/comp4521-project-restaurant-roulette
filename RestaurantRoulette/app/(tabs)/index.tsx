import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Circle, Marker } from 'react-native-maps';

import { useLocation } from '@/hooks/use-location';
import { useRestaurants } from '@/hooks/use-restaurants';
import { useFilters, RADIUS_DEFAULT } from '@/hooks/use-filters';
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

  const { latitude, longitude, loading: locationLoading, error: locationError, permissionDenied } = useLocation();

  const [radius, setRadius] = useState(RADIUS_DEFAULT);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const { restaurants, loading: restaurantsLoading, error: restaurantsError, refetch } =
    useRestaurants(latitude, longitude, radius);

  const {
    selectedCuisines,
    toggleCuisine,
    clearCuisines,
    availableCuisines,
    filteredRestaurants,
    activeCuisineCount,
  } = useFilters(restaurants);

  if (locationLoading) return <LoadingScreen message="Finding your location..." />;
  if (permissionDenied || locationError) return <ErrorScreen message={locationError || 'Location permission is required to find nearby restaurants.'} />;
  if (restaurantsLoading) return <LoadingScreen message="Searching for nearby restaurants..." />;
  if (restaurantsError) return <ErrorScreen message={`Could not load restaurants.\n${restaurantsError}`} onRetry={refetch} />;
  if (restaurants.length === 0) return <ErrorScreen message="No restaurants found nearby. Try a wider radius." onRetry={refetch} />;

  const displayList = filteredRestaurants.length > 0 ? filteredRestaurants : restaurants;
  const activeFilterCount = activeCuisineCount + (radius !== RADIUS_DEFAULT ? 1 : 0);

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
        {/* Radius circle overlay */}
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
            title={restaurant.name}
          >
            <Callout tooltip={false}>
              <View style={styles.callout}>
                <ThemedText style={styles.calloutTitle} lightColor="#000" darkColor="#000">
                  {restaurant.name}
                </ThemedText>
                <ThemedText style={styles.calloutCuisine} lightColor="#555" darkColor="#555">
                  {restaurant.cuisine}
                </ThemedText>
                <ThemedText style={styles.calloutAddress} lightColor="#777" darkColor="#777">
                  {restaurant.address}
                </ThemedText>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Filter FAB */}
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
        onRadiusChange={setRadius}
        availableCuisines={availableCuisines}
        selectedCuisines={selectedCuisines}
        onToggleCuisine={toggleCuisine}
        onClearCuisines={clearCuisines}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  callout: { minWidth: 150, maxWidth: 250, padding: 8 },
  calloutTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  calloutCuisine: { fontSize: 13, marginBottom: 2, textTransform: 'capitalize' },
  calloutAddress: { fontSize: 12 },
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
