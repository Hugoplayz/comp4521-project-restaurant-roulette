import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ErrorScreenProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorScreen({
  message = 'Something went wrong.',
  onRetry,
}: ErrorScreenProps) {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <ThemedView style={styles.container}>
      <IconSymbol
        size={64}
        name="exclamationmark.triangle"
        color={Colors[colorScheme].icon}
      />
      <ThemedText style={styles.message}>{message}</ThemedText>
      {onRetry && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors[colorScheme].tint }]}
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.buttonText} lightColor="#fff" darkColor="#000">
            Try Again
          </ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
