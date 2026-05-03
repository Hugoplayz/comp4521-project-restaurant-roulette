import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
}

async function waitForLocationUpdate(timeoutMs = 15000): Promise<Location.LocationObject> {
  return new Promise((resolve, reject) => {
    let settled = false;
    let subscription: Location.LocationSubscription | null = null;
    let removeWhenReady = false;

    const clear = () => {
      if (subscription) {
        subscription.remove();
        return;
      }
      removeWhenReady = true;
    };

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      clear();
      reject(new Error('Location update timed out. Please keep location enabled and try again.'));
    }, timeoutMs);

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Lowest,
        timeInterval: 1000,
        distanceInterval: 0,
      },
      (location) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        clear();
        resolve(location);
      }
    )
      .then((sub) => {
        subscription = sub;
        if (removeWhenReady) {
          subscription.remove();
        }
      })
      .catch((error: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        clear();
        reject(error);
      });
  });
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

        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          setState({
            latitude: null,
            longitude: null,
            loading: false,
            error: 'Current location is unavailable. Make sure that location services are enabled.',
            permissionDenied: false,
          });
          return;
        }

        // Try last known position first (fast, works well on emulators)
        let lastKnown: Location.LocationObject | null = null;
        try {
          lastKnown = await Location.getLastKnownPositionAsync();
        } catch {
          lastKnown = null;
        }
        let location = lastKnown;

        // Fall back to active GPS request
        try {
          location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
            mayShowUserSettingsDialog: true,
          });
        } catch {
          // Some emulators return "Current location is unavailable" for one-shot requests.
          // In that case, wait briefly for a streamed update (works with mock GPS routes).
          if (!location) {
            location = await waitForLocationUpdate();
          }
        }

        if (!location) {
          throw new Error('Current location is unavailable. Make sure that location services are enabled.');
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
