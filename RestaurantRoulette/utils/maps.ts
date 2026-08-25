import { Linking, Platform } from 'react-native';

/**
 * Opens the native Maps app (Apple Maps on iOS, Google Maps on Android)
 * with directions to the given coordinates.
 */
export function openInMaps(lat: number, lon: number, label: string): void {
  const encodedLabel = encodeURIComponent(label);

  const url = Platform.select({
    ios: `maps:0,0?q=${encodedLabel}&ll=${lat},${lon}`,
    android: `geo:${lat},${lon}?q=${lat},${lon}(${encodedLabel})`,
  });

  if (url) {
    Linking.openURL(url).catch((err) => {
      console.error('Failed to open maps:', err);
    });
  }
}
