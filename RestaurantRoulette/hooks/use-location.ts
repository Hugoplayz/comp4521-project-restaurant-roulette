import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
}

/**
 * Custom hook that requests GPS permission and returns the user's current location.
 */
export function useLocation(): LocationState {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    loading: true,
    error: null,
    permissionDenied: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function getLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (cancelled) return;

        if (status !== 'granted') {
          setState({
            latitude: null,
            longitude: null,
            loading: false,
            error: 'Location permission was denied. Please enable it in your device settings.',
            permissionDenied: true,
          });
          return;
        }

        // Try last known position first (fast, works well on emulators)
        let location = await Location.getLastKnownPositionAsync({
          maxAge: 60000,
          requiredAccuracy: 1000,
        });

        // Fall back to getCurrentPositionAsync with a timeout
        if (!location) {
          location = await Promise.race([
            Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Location request timed out. Make sure location services are enabled and a mock location is set.')), 10000)
            ),
          ]);
        }

        if (cancelled) return;

        setState({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          loading: false,
          error: null,
          permissionDenied: false,
        });
      } catch (err) {
        if (cancelled) return;

        const message =
          err instanceof Error ? err.message : 'Failed to get location';
        setState({
          latitude: null,
          longitude: null,
          loading: false,
          error: message,
          permissionDenied: false,
        });
      }
    }

    getLocation();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
