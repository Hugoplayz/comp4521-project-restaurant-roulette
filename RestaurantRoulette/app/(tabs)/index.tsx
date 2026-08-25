import { StyleSheet, View } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { useLocation } from '@/hooks/use-location';
import { useRestaurants } from '@/hooks/use-restaurants';
import { LoadingScreen } from '@/components/loading-screen';
import { ErrorScreen } from '@/components/error-screen';
import { ThemedText } from '@/components/themed-text';
import { Restaurant } from '@/types/restaurant';

const DELTA = 0.01; // ~1km zoom level

export default function MapScreen() {
  const { latitude, longitude, loading: locationLoading, error: locationError, permissionDenied } = useLocation();
  const { restaurants, loading: restaurantsLoading, error: restaurantsError, refetch } = useRestaurants(latitude, longitude);

  // 1. Loading location
  if (locationLoading) {
    return <LoadingScreen message="Finding your location..." />;
  }

  // 2. Location permission denied or error
  if (permissionDenied || locationError) {
    return (
      <ErrorScreen
        message={locationError || 'Location permission is required to find nearby restaurants.'}
      />
    );
  }

  // 3. Loading restaurants
  if (restaurantsLoading) {
    return <LoadingScreen message="Searching for nearby restaurants..." />;
  }

  // 4. Restaurant fetch error
  if (restaurantsError) {
    return (
      <ErrorScreen
        message={`Could not load restaurants.\n${restaurantsError}`}
        onRetry={refetch}
      />
    );
  }

  // 5. No restaurants found
  if (restaurants.length === 0) {
    return (
      <ErrorScreen
        message="No restaurants found nearby. Try a different area."
        onRetry={refetch}
      />
    );
  }

  // 6. Map with markers
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
        {restaurants.map((restaurant: Restaurant) => (
          <Marker
            key={restaurant.id}
            coordinate={{
              latitude: restaurant.lat,
              longitude: restaurant.lon,
            }}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  callout: {
    minWidth: 150,
    maxWidth: 250,
    padding: 8,
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  calloutCuisine: {
    fontSize: 13,
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  calloutAddress: {
    fontSize: 12,
  },
});
