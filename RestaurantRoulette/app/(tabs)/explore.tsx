import { useState, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLocation } from '@/hooks/use-location';
import { useRestaurants } from '@/hooks/use-restaurants';
import { LoadingScreen } from '@/components/loading-screen';
import { ErrorScreen } from '@/components/error-screen';
import { RouletteWheel } from '@/components/roulette-wheel';
import { WinnerModal } from '@/components/winner-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Restaurant } from '@/types/restaurant';

export default function RouletteScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const {
    latitude,
    longitude,
    loading: locationLoading,
    error: locationError,
    permissionDenied,
  } = useLocation();

  const {
    restaurants,
    loading: restaurantsLoading,
    error: restaurantsError,
    refetch,
  } = useRestaurants(latitude, longitude);

  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Restaurant | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSpin = useCallback(() => {
    if (spinning) return;
    setWinner(null);
    setModalVisible(false);
    setSpinning(true);
  }, [spinning]);

  const handleFinished = useCallback((restaurant: Restaurant) => {
    setSpinning(false);
    setWinner(restaurant);
    setModalVisible(true);
  }, []);

  const handleSpinAgain = useCallback(() => {
    setModalVisible(false);
    setWinner(null);
    // Small delay so the modal dismisses before spinning starts again
    setTimeout(() => {
      setSpinning(true);
    }, 300);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  // Loading / error states
  if (locationLoading) {
    return <LoadingScreen message="Finding your location..." />;
  }

  if (permissionDenied || locationError) {
    return (
      <ErrorScreen
        message={
          locationError ||
          'Location permission is required to find nearby restaurants.'
        }
      />
    );
  }

  if (restaurantsLoading) {
    return <LoadingScreen message="Searching for nearby restaurants..." />;
  }

  if (restaurantsError) {
    return (
      <ErrorScreen
        message={`Could not load restaurants.\n${restaurantsError}`}
        onRetry={refetch}
      />
    );
  }

  if (restaurants.length === 0) {
    return (
      <ErrorScreen
        message="No restaurants found nearby. Try a different area."
        onRetry={refetch}
      />
    );
  }

  if (restaurants.length < 2) {
    return (
      <ErrorScreen
        message="Need at least 2 restaurants to spin the wheel. Try a wider search area."
        onRetry={refetch}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Title */}
        <ThemedText style={styles.title}>Restaurant Roulette</ThemedText>
        <ThemedText style={styles.subtitle}>
          {restaurants.length} restaurants nearby
        </ThemedText>

        {/* Wheel */}
        <View style={styles.wheelContainer}>
          <RouletteWheel
            restaurants={restaurants}
            spinning={spinning}
            onFinished={handleFinished}
          />
        </View>

        {/* Spin button */}
        <TouchableOpacity
          style={[
            styles.spinButton,
            { backgroundColor: spinning ? colors.icon : colors.primary },
          ]}
          onPress={handleSpin}
          disabled={spinning}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.spinButtonText} lightColor="#fff" darkColor="#fff">
            {spinning ? 'Spinning...' : 'Spin!'}
          </ThemedText>
        </TouchableOpacity>

        {/* Winner modal */}
        <WinnerModal
          restaurant={winner}
          visible={modalVisible}
          onSpinAgain={handleSpinAgain}
          onClose={handleCloseModal}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 16,
  },
  wheelContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinButton: {
    width: '80%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  spinButtonText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
