import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

type LocationState =
  | { status: 'idle' }
  | { status: 'requesting-permission' }
  | { status: 'permission-denied'; message: string }
  | { status: 'fetching' }
  | { status: 'success'; coords: Location.LocationObjectCoords; timestamp: number }
  | { status: 'error'; message: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString();
}

function formatCoord(value: number, decimals = 6): string {
  return value.toFixed(decimals);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function App() {
  const [state, setState] = useState<LocationState>({ status: 'idle' });
  const [accuracy, setAccuracy] = useState<Location.Accuracy>(Location.Accuracy.Balanced);

  const fetchLocation = useCallback(async () => {
    // Step 1: request permission
    setState({ status: 'requesting-permission' });
    let permissionResult: Location.LocationPermissionResponse;
    try {
      permissionResult = await Location.requestForegroundPermissionsAsync();
    } catch (e: unknown) {
      setState({
        status: 'error',
        message: `Permission request threw: ${e instanceof Error ? e.message : String(e)}`,
      });
      return;
    }

    if (permissionResult.status !== 'granted') {
      setState({
        status: 'permission-denied',
        message: `Permission status: "${permissionResult.status}". Please enable Location in device Settings → Apps → DebugLocation → Permissions.`,
      });
      return;
    }

    // Step 2: get position
    setState({ status: 'fetching' });
    try {
      const result = await Location.getCurrentPositionAsync({
        accuracy,
        // Give the OS up to 15 s to produce a fix — critical for emulators
        timeInterval: 15000,
      });
      setState({
        status: 'success',
        coords: result.coords,
        timestamp: result.timestamp,
      });
    } catch (e: unknown) {
      setState({
        status: 'error',
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }, [accuracy]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  // ── Render ─────────────────────────────────────────────────────────────────

  const renderContent = () => {
    switch (state.status) {
      case 'idle':
        return <Text style={styles.infoText}>Initialising…</Text>;

      case 'requesting-permission':
        return (
          <View style={styles.centeredRow}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.infoText}>Requesting location permission…</Text>
          </View>
        );

      case 'permission-denied':
        return (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Permission Denied</Text>
            <Text style={styles.errorMessage}>{state.message}</Text>
          </View>
        );

      case 'fetching':
        return (
          <View style={styles.centeredRow}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.infoText}>
              Fetching location (accuracy: {Location.Accuracy[accuracy]})…
            </Text>
            {Platform.OS === 'android' && (
              <Text style={styles.hint}>
                On emulator: open Extended Controls → Location and click "Set Location".
              </Text>
            )}
          </View>
        );

      case 'error':
        return (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>getCurrentPositionAsync() failed</Text>
            <Text style={styles.errorMessage}>{state.message}</Text>
            <Text style={styles.hint}>
              Common fixes:{'\n'}
              • Emulator: Extended Controls → Location → Set a mock location{'\n'}
              • Physical device: ensure GPS / Location Services is ON{'\n'}
              • Try switching to a lower accuracy level below
            </Text>
          </View>
        );

      case 'success': {
        const { latitude, longitude, altitude, accuracy: acc, heading, speed } = state.coords;
        return (
          <View style={styles.resultBox}>
            <Text style={styles.successTitle}>Location Retrieved</Text>
            <Row label="Latitude" value={formatCoord(latitude)} />
            <Row label="Longitude" value={formatCoord(longitude)} />
            <Row label="Altitude" value={altitude != null ? `${altitude.toFixed(1)} m` : 'n/a'} />
            <Row label="Accuracy" value={acc != null ? `±${acc.toFixed(1)} m` : 'n/a'} />
            <Row label="Heading" value={heading != null ? `${heading.toFixed(1)}°` : 'n/a'} />
            <Row label="Speed" value={speed != null ? `${speed.toFixed(2)} m/s` : 'n/a'} />
            <Row label="Timestamp" value={formatTimestamp(state.timestamp)} />
            <Row label="Accuracy level used" value={Location.Accuracy[accuracy]} />
            <Row label="Platform" value={Platform.OS} />
          </View>
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Location Debugger</Text>
        <Text style={styles.headerSubtitle}>expo-location · getCurrentPositionAsync</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>{renderContent()}</ScrollView>

      {/* Accuracy selector */}
      <View style={styles.accuracyBar}>
        <Text style={styles.accuracyLabel}>Accuracy:</Text>
        {(
          [
            [Location.Accuracy.Lowest, 'Lowest'],
            [Location.Accuracy.Low, 'Low'],
            [Location.Accuracy.Balanced, 'Balanced'],
            [Location.Accuracy.High, 'High'],
            [Location.Accuracy.Highest, 'Highest'],
          ] as [Location.Accuracy, string][]
        ).map(([value, label]) => (
          <Pressable
            key={label}
            onPress={() => setAccuracy(value)}
            style={[styles.accuracyChip, accuracy === value && styles.accuracyChipActive]}
          >
            <Text
              style={[styles.accuracyChipText, accuracy === value && styles.accuracyChipTextActive]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Refresh button */}
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={fetchLocation}
        disabled={state.status === 'fetching' || state.status === 'requesting-permission'}
      >
        <Text style={styles.buttonText}>
          {state.status === 'fetching' || state.status === 'requesting-permission'
            ? 'Fetching…'
            : 'Refresh Location'}
        </Text>
      </Pressable>
    </View>
  );
}

// ─── Row helper ───────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1117',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#1A1D2E',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2D3E',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7B8099',
    marginTop: 2,
  },
  body: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  centeredRow: {
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    color: '#AAAACC',
    fontSize: 15,
    textAlign: 'center',
  },
  hint: {
    color: '#7B8099',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: '#2A1A1A',
    borderWidth: 1,
    borderColor: '#FF4444',
    borderRadius: 10,
    padding: 16,
    gap: 8,
  },
  errorTitle: {
    color: '#FF6666',
    fontSize: 16,
    fontWeight: '700',
  },
  errorMessage: {
    color: '#FFAAAA',
    fontSize: 13,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier New',
  },
  resultBox: {
    backgroundColor: '#1A2A1A',
    borderWidth: 1,
    borderColor: '#44AA66',
    borderRadius: 10,
    padding: 16,
    gap: 2,
  },
  successTitle: {
    color: '#66DD88',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2A3A2A',
  },
  rowLabel: {
    color: '#88AA88',
    fontSize: 13,
    flex: 1,
  },
  rowValue: {
    color: '#CCFFCC',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier New',
    textAlign: 'right',
    flex: 1,
  },
  accuracyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1A1D2E',
    borderTopWidth: 1,
    borderTopColor: '#2A2D3E',
    flexWrap: 'wrap',
    gap: 6,
  },
  accuracyLabel: {
    color: '#7B8099',
    fontSize: 11,
    marginRight: 4,
  },
  accuracyChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3A3D5E',
    backgroundColor: '#0F1117',
  },
  accuracyChipActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  accuracyChipText: {
    color: '#7B8099',
    fontSize: 11,
  },
  accuracyChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  button: {
    margin: 16,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: '#3A70C2',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
