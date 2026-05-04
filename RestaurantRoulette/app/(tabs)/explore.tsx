import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFilterContext } from '@/contexts/filter-context';
import { LoadingScreen } from '@/components/loading-screen';
import { ErrorScreen } from '@/components/error-screen';
import { RouletteWheel } from '@/components/roulette-wheel';
import { WinnerModal } from '@/components/winner-modal';
import { FilterSheet } from '@/components/filter-sheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Restaurant } from '@/types/restaurant';

export default function RouletteScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const {
    locationLoading, locationError, permissionDenied,
    restaurants, restaurantsLoading, restaurantsError, refetch,
    availableCuisines,
    radius, selectedCuisines, applyFilters, applyToRestaurants, activeFilterCount,
  } = useFilterContext();

  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Restaurant | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filteredRestaurants = useMemo(() => applyToRestaurants(restaurants), [restaurants, applyToRestaurants]);
  const spinList = filteredRestaurants.length >= 2 ? filteredRestaurants : restaurants;

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
    setTimeout(() => { setSpinning(true); }, 300);
  }, []);

  const handleCloseModal = useCallback(() => { setModalVisible(false); }, []);

  if (locationLoading) return <LoadingScreen message="Finding your location..." />;
  if (permissionDenied || locationError) return <ErrorScreen message={locationError || 'Location permission is required to find nearby restaurants.'} />;
  if (restaurantsLoading) return <LoadingScreen message="Searching for nearby restaurants..." />;
  if (restaurantsError) return <ErrorScreen message={`Could not load restaurants.\n${restaurantsError}`} onRetry={refetch} />;
  if (restaurants.length === 0) return <ErrorScreen message="No restaurants found nearby. Try a wider radius." onRetry={refetch} />;
  if (spinList.length < 2) return <ErrorScreen message="Need at least 2 restaurants to spin. Try adjusting your filters." onRetry={refetch} />;

  const showingFiltered = filteredRestaurants.length > 0 && filteredRestaurants.length < restaurants.length;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.title}>Restaurant Roulette</ThemedText>
            <ThemedText style={styles.subtitle}>
              {showingFiltered
                ? `${filteredRestaurants.length} of ${restaurants.length} restaurants`
                : `${restaurants.length} restaurants nearby`}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setFilterSheetVisible(true)}
            activeOpacity={0.7}
          >
            <ThemedText style={[styles.filterIcon, { color: colors.primary }]}>⚙</ThemedText>
            {activeFilterCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.badgeText}>{activeFilterCount}</ThemedText>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Wheel */}
        <View style={styles.wheelContainer}>
          <RouletteWheel restaurants={spinList} spinning={spinning} onFinished={handleFinished} />
        </View>

        {/* Spin button */}
        <TouchableOpacity
          style={[styles.spinButton, { backgroundColor: spinning ? colors.icon : colors.primary }]}
          onPress={handleSpin}
          disabled={spinning}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.spinButtonText} lightColor="#fff" darkColor="#fff">
            {spinning ? 'Spinning...' : 'Spin!'}
          </ThemedText>
        </TouchableOpacity>

        <WinnerModal
          restaurant={winner}
          visible={modalVisible}
          onSpinAgain={handleSpinAgain}
          onClose={handleCloseModal}
        />

        <FilterSheet
          visible={filterSheetVisible}
          onClose={() => setFilterSheetVisible(false)}
          radius={radius}
          selectedCuisines={selectedCuisines}
          availableCuisines={availableCuisines}
          onApply={({ radius: r, selectedCuisines: c }) => applyFilters(r, c)}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingTop: 16, paddingHorizontal: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: { flex: 1 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 2 },
  subtitle: { fontSize: 13, opacity: 0.6 },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  filterIcon: { fontSize: 20 },
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
  wheelContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  spinButton: {
    width: '80%',
    alignSelf: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  spinButtonText: { fontSize: 20, fontWeight: '800', letterSpacing: 1 },
});
