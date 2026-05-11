import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';

import { useFilterContext } from '@/contexts/filter-context';
import { LoadingScreen } from '@/components/loading-screen';
import { ErrorScreen } from '@/components/error-screen';
import { FilterSheet } from '@/components/filter-sheet';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { openInMaps } from '@/utils/maps';
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
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

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
        onPress={() => setSelectedRestaurant(null)}
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
            onPress={(e) => {
              e.stopPropagation();
              setSelectedRestaurant(restaurant);
            }}
          />
        ))}
      </MapView>

      {/* Info card shown when a pin is tapped */}
      {selectedRestaurant && (
        <View style={[styles.infoCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.infoCardDismiss} onPress={() => setSelectedRestaurant(null)} hitSlop={8}>
            <Text style={[styles.infoCardDismissText, { color: colors.icon }]}>✕</Text>
          </TouchableOpacity>
          <Text style={[styles.infoName, { color: colors.text }]} numberOfLines={2}>
            {selectedRestaurant.name}
          </Text>
          {!!selectedRestaurant.cuisine && (
            <Text style={styles.infoCuisine} numberOfLines={1}>
              {selectedRestaurant.cuisine}
            </Text>
          )}
          <Text style={styles.infoAddress} numberOfLines={2}>
            {selectedRestaurant.address}
          </Text>
          <TouchableOpacity
            style={[styles.directionsButton, { backgroundColor: colors.primary }]}
            onPress={() => openInMaps(selectedRestaurant.lat, selectedRestaurant.lon, selectedRestaurant.name)}
            activeOpacity={0.7}
          >
            <Text style={styles.directionsButtonText}>Directions</Text>
          </TouchableOpacity>
        </View>
      )}

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

  infoCard: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  infoCardDismiss: {
    position: 'absolute',
    top: 10,
    right: 12,
  },
  infoCardDismissText: {
    fontSize: 16,
    opacity: 0.5,
  },
  infoName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
    marginRight: 20,
  },
  infoCuisine: {
    fontSize: 13,
    textTransform: 'capitalize',
    color: '#888',
    marginBottom: 2,
  },
  infoAddress: {
    fontSize: 13,
    color: '#888',
    marginBottom: 14,
  },
  directionsButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  directionsButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

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
