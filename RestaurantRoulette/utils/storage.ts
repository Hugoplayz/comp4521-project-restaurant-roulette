import AsyncStorage from '@react-native-async-storage/async-storage';
import { Restaurant } from '@/types/restaurant';

const HISTORY_KEY = '@restaurant_roulette_history';
const MAX_HISTORY = 50;

export interface SpinResult {
  id: string;
  restaurant: Restaurant;
  timestamp: number;
}

export async function saveSpinResult(restaurant: Restaurant): Promise<void> {
  try {
    const existing = await getSpinHistory();
    const entry: SpinResult = {
      id: `${Date.now()}-${restaurant.id}`,
      restaurant,
      timestamp: Date.now(),
    };
    const updated = [entry, ...existing].slice(0, MAX_HISTORY);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save spin result:', err);
  }
}

export async function getSpinHistory(): Promise<SpinResult[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SpinResult[];
  } catch (err) {
    console.warn('Failed to load spin history:', err);
    return [];
  }
}

export async function clearSpinHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (err) {
    console.warn('Failed to clear spin history:', err);
  }
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
