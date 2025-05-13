import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface Props {
  style?: any;
}

export const FeedItemSkeleton: React.FC<Props> = ({ style }) => {
  const animatedValue = new Animated.Value(0);

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Animated.View style={[styles.avatar, { opacity }]} />
        <View style={styles.headerContent}>
          <Animated.View style={[styles.name, { opacity }]} />
          <Animated.View style={[styles.timestamp, { opacity }]} />
        </View>
      </View>
      <Animated.View style={[styles.content, { opacity }]} />
      <View style={styles.footer}>
        <Animated.View style={[styles.action, { opacity }]} />
        <Animated.View style={[styles.action, { opacity }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E1E9EE',
  },
  headerContent: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    height: 16,
    width: '60%',
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
    marginBottom: 4,
  },
  timestamp: {
    height: 12,
    width: '40%',
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
  },
  content: {
    height: 80,
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  action: {
    height: 24,
    width: '30%',
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
  },
}); 