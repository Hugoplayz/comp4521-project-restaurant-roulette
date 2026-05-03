import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RADIUS_MIN, RADIUS_MAX, RADIUS_STEP } from '@/hooks/use-filters';

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  radius: number;
  onRadiusChange: (r: number) => void;
  availableCuisines: string[];
  selectedCuisines: Set<string>;
  onToggleCuisine: (cuisine: string) => void;
  onClearCuisines: () => void;
}

function formatRadius(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${meters} m`;
}

export function FilterSheet({
  visible,
  onClose,
  radius,
  onRadiusChange,
  availableCuisines,
  selectedCuisines,
  onToggleCuisine,
  onClearCuisines,
}: FilterSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={[styles.sheet, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <ThemedText style={styles.headerTitle}>Filters</ThemedText>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ThemedText style={[styles.doneButton, { color: colors.primary }]}>Done</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Radius Section */}
          <ThemedText style={styles.sectionTitle}>Search Radius</ThemedText>
          <View style={styles.radiusRow}>
            <ThemedText style={[styles.radiusValue, { color: colors.primary }]}>
              {formatRadius(radius)}
            </ThemedText>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={RADIUS_MIN}
            maximumValue={RADIUS_MAX}
            step={RADIUS_STEP}
            value={radius}
            onValueChange={onRadiusChange}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
          <View style={styles.radiusLabels}>
            <ThemedText style={styles.radiusLabel}>{formatRadius(RADIUS_MIN)}</ThemedText>
            <ThemedText style={styles.radiusLabel}>{formatRadius(RADIUS_MAX)}</ThemedText>
          </View>

          {/* Cuisine Section */}
          {availableCuisines.length > 0 && (
            <>
              <View style={styles.cuisineHeader}>
                <ThemedText style={styles.sectionTitle}>Cuisine</ThemedText>
                {selectedCuisines.size > 0 && (
                  <TouchableOpacity onPress={onClearCuisines}>
                    <ThemedText style={[styles.clearButton, { color: colors.primary }]}>
                      Clear
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.chipsContainer}>
                {availableCuisines.map((cuisine) => {
                  const selected = selectedCuisines.has(cuisine);
                  return (
                    <TouchableOpacity
                      key={cuisine}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: selected ? colors.primary : colors.surface,
                          borderColor: selected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => onToggleCuisine(cuisine)}
                      activeOpacity={0.7}
                    >
                      <ThemedText
                        style={[
                          styles.chipText,
                          { color: selected ? '#fff' : colors.text },
                        ]}
                      >
                        {cuisine}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 32,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  doneButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  body: {
    flexGrow: 0,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.5,
    marginBottom: 12,
  },
  radiusRow: {
    alignItems: 'center',
    marginBottom: 4,
  },
  radiusValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  radiusLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  radiusLabel: {
    fontSize: 12,
    opacity: 0.5,
  },
  cuisineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
});
