import { Modal, Share, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useEffect } from 'react';
import { ThemedText } from '@/components/themed-text';
import { Restaurant } from '@/types/restaurant';
import { openInMaps } from '@/utils/maps';
import { saveSpinResult } from '@/utils/storage';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface WinnerModalProps {
  restaurant: Restaurant | null;
  visible: boolean;
  onSpinAgain: () => void;
  onClose: () => void;
}

export function WinnerModal({ restaurant, visible, onSpinAgain, onClose }: WinnerModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Save to history whenever a new winner is shown
  useEffect(() => {
    if (restaurant && visible) {
      saveSpinResult(restaurant);
    }
  }, [restaurant, visible]);

  if (!restaurant) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I'm going to ${restaurant.name}! 🍽️\n${restaurant.cuisine} · ${restaurant.address}`,
      });
    } catch (err) {
      console.warn('Share failed:', err);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={8}>
            <ThemedText style={styles.closeIcon}>✕</ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.headerLabel}>You're going to...</ThemedText>
          <ThemedText style={styles.restaurantName}>{restaurant.name}</ThemedText>

          <View style={[styles.detailRow, { borderColor: colors.border }]}>
            <ThemedText style={styles.detailLabel}>Cuisine</ThemedText>
            <ThemedText style={styles.detailValue}>{restaurant.cuisine}</ThemedText>
          </View>
          <View style={[styles.detailRow, { borderColor: colors.border }]}>
            <ThemedText style={styles.detailLabel}>Address</ThemedText>
            <ThemedText style={styles.detailValue}>{restaurant.address}</ThemedText>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => openInMaps(restaurant.lat, restaurant.lon, restaurant.name)}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.primaryButtonText} lightColor="#fff" darkColor="#fff">
              Take Me There
            </ThemedText>
          </TouchableOpacity>

          <View style={styles.secondaryRow}>
            <TouchableOpacity
              style={[styles.halfButton, { borderColor: colors.primary }]}
              onPress={onSpinAgain}
              activeOpacity={0.7}
            >
              <ThemedText style={[styles.halfButtonText, { color: colors.primary }]}>
                Spin Again
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.halfButton, { borderColor: colors.primary }]}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <ThemedText style={[styles.halfButtonText, { color: colors.primary }]}>
                Share
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerLabel: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
    opacity: 0.6,
  },
  restaurantName: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  detailRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  detailLabel: {
    fontSize: 13,
    opacity: 0.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    flex: 0.35,
  },
  detailValue: {
    fontSize: 15,
    flex: 0.6,
    textAlign: 'right',
    textTransform: 'capitalize',
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 12,
  },
  halfButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
  },
  halfButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
    opacity: 0.5,
  },
});
