import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  clearSpinHistory,
  formatTimestamp,
  getSpinHistory,
  SpinResult,
} from '@/utils/storage';
import { openInMaps } from '@/utils/maps';

export default function HistoryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [history, setHistory] = useState<SpinResult[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    const data = await getSpinHistory();
    setHistory(data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const handleClear = useCallback(() => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all spin history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearSpinHistory();
            setHistory([]);
          },
        },
      ]
    );
  }, []);

  const renderItem = ({ item, index }: { item: SpinResult; index: number }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => openInMaps(item.restaurant.lat, item.restaurant.lon, item.restaurant.name)}
      activeOpacity={0.7}
    >
      <View style={styles.cardLeft}>
        <View style={[styles.indexBadge, { backgroundColor: colors.primary }]}>
          <ThemedText style={styles.indexText}>{index + 1}</ThemedText>
        </View>
      </View>
      <View style={styles.cardBody}>
        <ThemedText style={styles.restaurantName} numberOfLines={1}>
          {item.restaurant.name}
        </ThemedText>
        <ThemedText style={styles.cuisine} numberOfLines={1}>
          {item.restaurant.cuisine}
        </ThemedText>
        <ThemedText style={styles.address} numberOfLines={1}>
          {item.restaurant.address}
        </ThemedText>
      </View>
      <View style={styles.cardRight}>
        <ThemedText style={styles.timestamp}>{formatTimestamp(item.timestamp)}</ThemedText>
        <ThemedText style={[styles.mapHint, { color: colors.primary }]}>Directions ›</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>Spin History</ThemedText>
          {history.length > 0 && (
            <TouchableOpacity onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <ThemedText style={[styles.clearButton, { color: colors.primary }]}>Clear</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>Loading...</ThemedText>
          </View>
        ) : history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyIcon}>🎰</ThemedText>
            <ThemedText style={styles.emptyTitle}>No spins yet</ThemedText>
            <ThemedText style={styles.emptyText}>
              Spin the roulette wheel to start building your history!
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: { fontSize: 28, fontWeight: 'bold' },
  clearButton: { fontSize: 16, fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  separator: { height: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardLeft: { marginRight: 12 },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indexText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  cardBody: { flex: 1, marginRight: 8 },
  restaurantName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  cuisine: { fontSize: 13, opacity: 0.6, textTransform: 'capitalize', marginBottom: 2 },
  address: { fontSize: 12, opacity: 0.5 },
  cardRight: { alignItems: 'flex-end' },
  timestamp: { fontSize: 11, opacity: 0.5, marginBottom: 4 },
  mapHint: { fontSize: 12, fontWeight: '600' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptyText: { fontSize: 15, opacity: 0.6, textAlign: 'center', lineHeight: 22 },
});
