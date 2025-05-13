// Mock expo-av
jest.mock('expo-av', () => ({
  Video: 'Video',
  Audio: {
    setAudioModeAsync: jest.fn(),
  },
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
    Videos: 'Videos',
  },
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  default: {
    View: 'View',
    Text: 'Text',
    Image: 'Image',
    ScrollView: 'ScrollView',
    TouchableOpacity: 'TouchableOpacity',
  },
  useSharedValue: jest.fn(),
  useAnimatedStyle: jest.fn(),
  withSpring: jest.fn(),
  withTiming: jest.fn(),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  PanGestureHandler: 'PanGestureHandler',
  State: {},
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: 'SafeAreaProvider',
  SafeAreaView: 'SafeAreaView',
  useSafeAreaInsets: jest.fn(),
}));

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock react-native-vector-icons/Ionicons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock react-native-vector-icons/MaterialIcons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock react-native-vector-icons/FontAwesome
jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');

// Mock react-native-vector-icons/FontAwesome5
jest.mock('react-native-vector-icons/FontAwesome5', () => 'Icon');

// Mock react-native-vector-icons/Feather
jest.mock('react-native-vector-icons/Feather', () => 'Icon');

// Mock react-native-vector-icons/AntDesign
jest.mock('react-native-vector-icons/AntDesign', () => 'Icon');

// Mock react-native-vector-icons/Entypo
jest.mock('react-native-vector-icons/Entypo', () => 'Icon');

// Mock react-native-vector-icons/EvilIcons
jest.mock('react-native-vector-icons/EvilIcons', () => 'Icon');

// Mock react-native-vector-icons/Fontisto
jest.mock('react-native-vector-icons/Fontisto', () => 'Icon');

// Mock react-native-vector-icons/Foundation
jest.mock('react-native-vector-icons/Foundation', () => 'Icon');

// Mock react-native-vector-icons/Octicons
jest.mock('react-native-vector-icons/Octicons', () => 'Icon');

// Mock react-native-vector-icons/SimpleLineIcons
jest.mock('react-native-vector-icons/SimpleLineIcons', () => 'Icon');

// Mock react-native-vector-icons/Zocial
jest.mock('react-native-vector-icons/Zocial', () => 'Icon');

// Mock react-native-vector-icons/MaterialCommunityIcons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock react-native-vector-icons/Ionicons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock react-native-vector-icons/MaterialIcons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock react-native-vector-icons/FontAwesome
jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');

// Mock react-native-vector-icons/FontAwesome5
jest.mock('react-native-vector-icons/FontAwesome5', () => 'Icon');

// Mock react-native-vector-icons/Feather
jest.mock('react-native-vector-icons/Feather', () => 'Icon');

// Mock react-native-vector-icons/AntDesign
jest.mock('react-native-vector-icons/AntDesign', () => 'Icon');

// Mock react-native-vector-icons/Entypo
jest.mock('react-native-vector-icons/Entypo', () => 'Icon');

// Mock react-native-vector-icons/EvilIcons
jest.mock('react-native-vector-icons/EvilIcons', () => 'Icon');

// Mock react-native-vector-icons/Fontisto
jest.mock('react-native-vector-icons/Fontisto', () => 'Icon');

// Mock react-native-vector-icons/Foundation
jest.mock('react-native-vector-icons/Foundation', () => 'Icon');

// Mock react-native-vector-icons/Octicons
jest.mock('react-native-vector-icons/Octicons', () => 'Icon');

// Mock react-native-vector-icons/SimpleLineIcons
jest.mock('react-native-vector-icons/SimpleLineIcons', () => 'Icon');

// Mock react-native-vector-icons/Zocial
jest.mock('react-native-vector-icons/Zocial', () => 'Icon'); 