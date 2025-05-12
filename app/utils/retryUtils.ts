import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffFactor?: number;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffFactor: 2,
};

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const { maxAttempts, delayMs, backoffFactor } = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts) break;

      const delay = delayMs * Math.pow(backoffFactor, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

export const isOnline = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected ?? false;
};

export const withOfflineSupport = async <T>(
  operation: () => Promise<T>,
  cacheKey: string,
  options: { ttl?: number } = {}
): Promise<T> => {
  const { ttl = 24 * 60 * 60 * 1000 } = options; // Default TTL: 24 hours

  try {
    const online = await isOnline();
    if (online) {
      const result = await operation();
      // Cache the result
      await AsyncStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: result,
          timestamp: Date.now(),
        })
      );
      return result;
    }
  } catch (error) {
    console.error('Online operation failed:', error);
  }

  // Try to get cached data
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < ttl) {
        return data;
      }
    }
  } catch (error) {
    console.error('Cache read failed:', error);
  }

  throw new Error('No internet connection and no valid cached data available');
}; 